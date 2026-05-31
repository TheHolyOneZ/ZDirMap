use crate::error::Result;
use crate::ignore::{read_gitignore_patterns, IgnoreSet};
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Instant;
use tauri::{AppHandle, Emitter, State};
use walkdir::WalkDir;

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DirNode {
    pub id: String,
    pub path: String,
    pub rel_path: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub is_dir: bool,
    pub depth: u16,
    pub size: u64,
    pub mtime: Option<i64>,
    pub children_count: u32,
    pub is_symlink: bool,
    pub lines: Option<u64>,
}

#[derive(Clone, Deserialize, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ScanOptions {
    pub max_depth: Option<u16>,
    #[serde(default)]
    pub follow_symlinks: bool,
    #[serde(default)]
    pub include_hidden: bool,
    #[serde(default = "default_true")]
    pub include_files: bool,
    #[serde(default = "default_true")]
    pub include_dirs: bool,
    #[serde(default)]
    pub use_gitignore: bool,
    #[serde(default)]
    pub use_defaults: bool,
    #[serde(default)]
    pub extra_globs: Vec<String>,
    #[serde(default = "default_batch")]
    pub emit_batch_size: usize,
    #[serde(default = "default_true")]
    pub compute_sizes: bool,
    #[serde(default)]
    pub compute_lines: bool,
}

fn default_true() -> bool { true }
fn default_batch() -> usize { 256 }

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProgressPayload {
    scan_id: String,
    scanned_count: u64,
    current_path: String,
    elapsed_ms: u128,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct NodesPayload {
    scan_id: String,
    nodes: Vec<DirNode>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct SizesPayload {
    scan_id: String,
    sizes: Vec<(String, u64)>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct LinesPayload {
    scan_id: String,
    lines: Vec<(String, u64)>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DonePayload {
    scan_id: String,
    total_nodes: u64,
    total_bytes: u64,
    duration_ms: u128,
    warnings: Vec<String>,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ErrorPayload {
    scan_id: String,
    message: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct CancelledPayload {
    scan_id: String,
}

#[tauri::command]
pub async fn start_scan(
    app: AppHandle,
    state: State<'_, AppState>,
    root: String,
    options: ScanOptions,
) -> Result<String> {
    let scan_id = uuid::Uuid::new_v4().to_string();
    let token = Arc::new(AtomicBool::new(false));
    {
        let mut map = state.cancel_map.lock().await;
        map.insert(scan_id.clone(), token.clone());
    }

    let app_clone = app.clone();
    let scan_id_clone = scan_id.clone();
    let cancel_map = state.cancel_map.clone();

    tokio::task::spawn(async move {
        let result = tokio::task::spawn_blocking({
            let app = app_clone.clone();
            let scan_id = scan_id_clone.clone();
            let token = token.clone();
            move || run_walk(&app, &scan_id, &root, options, token)
        })
        .await;


        {
            let mut map = cancel_map.lock().await;
            map.remove(&scan_id_clone);
        }

        match result {
            Ok(Ok(())) => {}
            Ok(Err(e)) => {
                let _ = app_clone.emit(
                    "scan://error",
                    ErrorPayload { scan_id: scan_id_clone.clone(), message: e.to_string() },
                );
            }
            Err(join_err) => {
                let _ = app_clone.emit(
                    "scan://error",
                    ErrorPayload {
                        scan_id: scan_id_clone.clone(),
                        message: format!("join error: {join_err}"),
                    },
                );
            }
        }
    });

    Ok(scan_id)
}

#[tauri::command]
pub async fn cancel_scan(state: State<'_, AppState>, scan_id: String) -> Result<()> {
    let map = state.cancel_map.lock().await;
    if let Some(tok) = map.get(&scan_id) {
        tok.store(true, Ordering::Relaxed);
    }
    Ok(())
}

fn run_walk(
    app: &AppHandle,
    scan_id: &str,
    root_str: &str,
    opts: ScanOptions,
    token: Arc<AtomicBool>,
) -> Result<()> {
    let started = Instant::now();
    let root = PathBuf::from(root_str);

    if !root.exists() {
        let _ = app.emit(
            "scan://error",
            ErrorPayload { scan_id: scan_id.into(), message: format!("path does not exist: {root_str}") },
        );
        return Ok(());
    }

    let mut patterns = opts.extra_globs.clone();
    if opts.use_gitignore {
        patterns.extend(read_gitignore_patterns(&root));
    }
    let ignore = IgnoreSet::new(&patterns, opts.use_defaults);

    let max_depth = opts.max_depth.map(|d| d as usize).unwrap_or(usize::MAX);


    let mut path_to_id: HashMap<PathBuf, String> = HashMap::new();
    let mut warnings: Vec<String> = Vec::new();
    let mut batch: Vec<DirNode> = Vec::with_capacity(opts.emit_batch_size);
    let mut total_count: u64 = 0;
    let mut total_bytes: u64 = 0;
    let mut last_progress = Instant::now();


    let mut node_sizes: HashMap<String, u64> = HashMap::new();
    let mut node_parents: HashMap<String, Option<String>> = HashMap::new();
    let mut node_is_dir: HashMap<String, bool> = HashMap::new();
    let mut node_lines: HashMap<String, u64> = HashMap::new();

    let walker = WalkDir::new(&root)
        .follow_links(opts.follow_symlinks)
        .max_depth(max_depth)
        .into_iter();

    for entry in walker.filter_entry(|e| {
        let p = e.path();
        let rel = p.strip_prefix(&root).unwrap_or(p);
        let name = e.file_name().to_string_lossy();
        if !opts.include_hidden && name.starts_with('.') && p != root {
            return false;
        }
        if rel.as_os_str().is_empty() {
            return true;
        }
        !ignore.is_ignored(rel, &name)
    }) {
        if token.load(Ordering::Relaxed) {
            if !batch.is_empty() {
                let _ = app.emit("scan://nodes", NodesPayload { scan_id: scan_id.into(), nodes: std::mem::take(&mut batch) });
            }
            let _ = app.emit("scan://cancelled", CancelledPayload { scan_id: scan_id.into() });
            return Ok(());
        }

        let entry = match entry {
            Ok(e) => e,
            Err(e) => {
                warnings.push(format!("walk: {e}"));
                continue;
            }
        };

        let p = entry.path().to_path_buf();
        let metadata = match entry.metadata() {
            Ok(m) => m,
            Err(e) => {
                warnings.push(format!("metadata {}: {}", p.display(), e));
                continue;
            }
        };
        let is_dir = metadata.is_dir();
        let is_symlink = metadata.file_type().is_symlink();
        if is_dir && !opts.include_dirs && p != root {
            continue;
        }
        if !is_dir && !opts.include_files {
            continue;
        }

        let depth = entry.depth() as u16;
        let id = uuid::Uuid::new_v4().to_string();
        let parent_id = if p == root {
            None
        } else {
            p.parent().and_then(|pp| path_to_id.get(pp).cloned())
        };
        path_to_id.insert(p.clone(), id.clone());

        let rel = p.strip_prefix(&root).unwrap_or(&p).to_path_buf();
        let name = entry
            .file_name()
            .to_string_lossy()
            .into_owned();
        let mtime = metadata.modified().ok().and_then(|t| {
            t.duration_since(std::time::UNIX_EPOCH).ok().map(|d| d.as_secs() as i64)
        });
        let size = if is_dir { 0 } else { metadata.len() };
        if !is_dir {
            total_bytes += size;
        }

        let lines = if !is_dir && opts.compute_lines {
            count_lines(&p, size)
        } else {
            None
        };

        node_sizes.insert(id.clone(), size);
        node_parents.insert(id.clone(), parent_id.clone());
        node_is_dir.insert(id.clone(), is_dir);
        if let Some(l) = lines {
            node_lines.insert(id.clone(), l);
        }

        let node = DirNode {
            id: id.clone(),
            path: p.to_string_lossy().into_owned(),
            rel_path: rel.to_string_lossy().into_owned(),
            name,
            parent_id,
            is_dir,
            depth,
            size,
            mtime,
            children_count: 0,
            is_symlink,
            lines,
        };
        batch.push(node);
        total_count += 1;

        if batch.len() >= opts.emit_batch_size {
            let _ = app.emit("scan://nodes", NodesPayload { scan_id: scan_id.into(), nodes: std::mem::take(&mut batch) });
            batch = Vec::with_capacity(opts.emit_batch_size);
        }

        if last_progress.elapsed().as_millis() >= 80 {
            let _ = app.emit(
                "scan://progress",
                ProgressPayload {
                    scan_id: scan_id.into(),
                    scanned_count: total_count,
                    current_path: p.to_string_lossy().into_owned(),
                    elapsed_ms: started.elapsed().as_millis(),
                },
            );
            last_progress = Instant::now();
        }
    }

    if !batch.is_empty() {
        let _ = app.emit("scan://nodes", NodesPayload { scan_id: scan_id.into(), nodes: std::mem::take(&mut batch) });
    }

    if opts.compute_sizes {

        let ids: Vec<String> = node_sizes.keys().cloned().collect();
        for id in &ids {
            if node_is_dir.get(id).copied().unwrap_or(false) {
                continue;
            }
            let size = node_sizes.get(id).copied().unwrap_or(0);
            let mut cur = node_parents.get(id).cloned().flatten();
            while let Some(pid) = cur {
                if let Some(v) = node_sizes.get_mut(&pid) {
                    *v += size;
                }
                cur = node_parents.get(&pid).cloned().flatten();
            }
        }
        let sizes: Vec<(String, u64)> = ids
            .iter()
            .filter(|id| node_is_dir.get(*id).copied().unwrap_or(false))
            .map(|id| (id.clone(), node_sizes.get(id).copied().unwrap_or(0)))
            .collect();
        let _ = app.emit("scan://sizes", SizesPayload { scan_id: scan_id.into(), sizes });
    }

    if opts.compute_lines {
        let ids: Vec<String> = node_lines.keys().cloned().collect();
        for id in &ids {
            let n_lines = node_lines.get(id).copied().unwrap_or(0);
            let mut cur = node_parents.get(id).cloned().flatten();
            while let Some(pid) = cur {
                if node_is_dir.get(&pid).copied().unwrap_or(false) {
                    *node_lines.entry(pid.clone()).or_insert(0) += n_lines;
                }
                cur = node_parents.get(&pid).cloned().flatten();
            }
        }
        let lines: Vec<(String, u64)> = node_lines
            .iter()
            .filter(|(id, _)| node_is_dir.get(*id).copied().unwrap_or(false))
            .map(|(id, l)| (id.clone(), *l))
            .collect();
        let _ = app.emit("scan://lines", LinesPayload { scan_id: scan_id.into(), lines });
    }

    let _ = app.emit(
        "scan://done",
        DonePayload {
            scan_id: scan_id.into(),
            total_nodes: total_count,
            total_bytes,
            duration_ms: started.elapsed().as_millis(),
            warnings,
        },
    );
    Ok(())
}

const MAX_LINE_COUNT_BYTES: u64 = 8 * 1024 * 1024;

fn count_lines(path: &Path, size: u64) -> Option<u64> {
    use std::fs::File;
    use std::io::Read;
    if size == 0 || size > MAX_LINE_COUNT_BYTES {
        return None;
    }
    let mut file = File::open(path).ok()?;
    let mut buf = Vec::with_capacity(size as usize);
    file.read_to_end(&mut buf).ok()?;
    let probe = &buf[..buf.len().min(4096)];
    if probe.contains(&0u8) {
        return None;
    }
    let mut count: u64 = bytecount(&buf, b'\n');
    if !buf.is_empty() && *buf.last().unwrap() != b'\n' {
        count += 1;
    }
    Some(count)
}

fn bytecount(haystack: &[u8], needle: u8) -> u64 {
    let mut n: u64 = 0;
    for &b in haystack {
        if b == needle {
            n += 1;
        }
    }
    n
}

#[tauri::command]
pub fn read_gitignore(root: String) -> Result<Vec<String>> {
    Ok(read_gitignore_patterns(Path::new(&root)))
}
