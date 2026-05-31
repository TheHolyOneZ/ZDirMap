use globset::{Glob, GlobSet, GlobSetBuilder};
use std::path::Path;

pub struct IgnoreSet {
    set: GlobSet,
    names: Vec<String>,
}

impl IgnoreSet {
    pub fn new(patterns: &[String], use_defaults: bool) -> Self {
        let mut builder = GlobSetBuilder::new();
        let mut names: Vec<String> = Vec::new();

        if use_defaults {
            for p in DEFAULT_PATTERNS {
                if let Ok(g) = Glob::new(p) {
                    builder.add(g);
                    names.push((*p).to_string());
                }
            }
        }
        for pat in patterns {
            if let Ok(g) = Glob::new(pat) {
                builder.add(g);
                names.push(pat.clone());
            }
        }
        let set = builder.build().unwrap_or_else(|_| GlobSet::empty());
        Self { set, names }
    }

    pub fn empty() -> Self {
        Self { set: GlobSet::empty(), names: vec![] }
    }

    pub fn is_ignored(&self, rel_path: &Path, name: &str) -> bool {
        if self.names.is_empty() {
            return false;
        }
        if self.set.is_match(rel_path) {
            return true;
        }
        if self.set.is_match(Path::new(name)) {
            return true;
        }
        for component in rel_path.components() {
            let s = component.as_os_str().to_string_lossy();
            if self.set.is_match(Path::new(s.as_ref())) {
                return true;
            }
        }
        false
    }
}

pub const DEFAULT_PATTERNS: &[&str] = &[
    "node_modules",
    ".git",
    "target",
    "dist",
    ".next",
    ".turbo",
    ".cache",
    ".DS_Store",
    "*.tmp",
    "*.swp",
];

pub fn read_gitignore_patterns(root: &Path) -> Vec<String> {
    let gi = root.join(".gitignore");
    let Ok(text) = std::fs::read_to_string(&gi) else { return vec![]; };
    text.lines()
        .map(str::trim)
        .filter(|l| !l.is_empty() && !l.starts_with('#'))
        .map(|l| l.trim_start_matches('/').trim_end_matches('/').to_string())
        .filter(|l| !l.is_empty())
        .collect()
}
