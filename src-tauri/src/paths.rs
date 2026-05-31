use crate::error::{Error, Result};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn config_dir(app: &AppHandle) -> Result<PathBuf> {
    app.path()
        .app_config_dir()
        .map_err(|e| Error::Other(format!("config_dir: {e}")))
}

pub fn presets_dir(app: &AppHandle) -> Result<PathBuf> {
    let d = config_dir(app)?.join("presets");
    std::fs::create_dir_all(&d)?;
    Ok(d)
}

pub fn snapshots_dir(app: &AppHandle) -> Result<PathBuf> {
    let d = config_dir(app)?.join("snapshots");
    std::fs::create_dir_all(&d)?;
    Ok(d)
}
