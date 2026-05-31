use crate::error::{Error, Result};
use crate::paths::{presets_dir, snapshots_dir};
use crate::scan::DirNode;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub version: u32,
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub root: String,
    pub output_format: String,
    pub output_options: serde_json::Value,
    pub selection: serde_json::Value,
    pub nodes: Vec<DirNode>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SnapshotMeta {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub root: String,
    pub file: String,
    pub node_count: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Preset {
    pub id: String,
    pub name: String,
    pub patterns: Vec<String>,
    pub use_defaults: bool,
}

fn slug(s: &str) -> String {
    s.chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '-' || c == '_' { c } else { '-' })
        .collect()
}

#[tauri::command]
pub fn save_snapshot(app: AppHandle, snapshot: Snapshot) -> Result<String> {
    let dir = snapshots_dir(&app)?;
    let file = dir.join(format!("{}-{}.zdirmap", slug(&snapshot.name), snapshot.id));
    let text = serde_json::to_string_pretty(&snapshot)?;
    std::fs::write(&file, text)?;
    Ok(file.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn load_snapshot(path: String) -> Result<Snapshot> {
    let text = std::fs::read_to_string(&path).map_err(Error::Io)?;
    let snap: Snapshot = serde_json::from_str(&text)?;
    Ok(snap)
}

#[tauri::command]
pub fn list_snapshots(app: AppHandle) -> Result<Vec<SnapshotMeta>> {
    let dir = snapshots_dir(&app)?;
    let mut out = Vec::new();
    for entry in std::fs::read_dir(&dir)? {
        let entry = entry?;
        let p = entry.path();
        if p.extension().and_then(|e| e.to_str()) != Some("zdirmap") {
            continue;
        }
        if let Ok(text) = std::fs::read_to_string(&p) {
            if let Ok(s) = serde_json::from_str::<Snapshot>(&text) {
                out.push(SnapshotMeta {
                    id: s.id,
                    name: s.name,
                    created_at: s.created_at,
                    root: s.root,
                    file: p.to_string_lossy().into_owned(),
                    node_count: s.nodes.len(),
                });
            }
        }
    }
    out.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Ok(out)
}

#[tauri::command]
pub fn delete_snapshot(path: String) -> Result<()> {
    let p = PathBuf::from(path);
    if p.exists() {
        std::fs::remove_file(p)?;
    }
    Ok(())
}

#[tauri::command]
pub fn list_presets(app: AppHandle) -> Result<Vec<Preset>> {
    let dir = presets_dir(&app)?;
    let mut out = Vec::new();
    for entry in std::fs::read_dir(&dir)? {
        let entry = entry?;
        let p = entry.path();
        if p.extension().and_then(|e| e.to_str()) != Some("json") {
            continue;
        }
        if let Ok(text) = std::fs::read_to_string(&p) {
            if let Ok(preset) = serde_json::from_str::<Preset>(&text) {
                out.push(preset);
            }
        }
    }
    out.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(out)
}

#[tauri::command]
pub fn save_preset(app: AppHandle, preset: Preset) -> Result<()> {
    let dir = presets_dir(&app)?;
    let file = dir.join(format!("{}-{}.json", slug(&preset.name), preset.id));
    let text = serde_json::to_string_pretty(&preset)?;
    std::fs::write(file, text)?;
    Ok(())
}

#[tauri::command]
pub fn delete_preset(app: AppHandle, id: String) -> Result<()> {
    let dir = presets_dir(&app)?;
    for entry in std::fs::read_dir(&dir)? {
        let entry = entry?;
        let p = entry.path();
        if p.file_name()
            .and_then(|n| n.to_str())
            .map(|n| n.ends_with(&format!("-{id}.json")))
            .unwrap_or(false)
        {
            std::fs::remove_file(&p)?;
        }
    }
    Ok(())
}
