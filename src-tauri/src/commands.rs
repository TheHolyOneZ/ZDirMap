use crate::error::Result;
use std::path::PathBuf;

#[tauri::command]
pub fn write_text_file(path: String, text: String) -> Result<()> {
    let p = PathBuf::from(&path);
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(p, text)?;
    Ok(())
}
