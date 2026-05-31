#![allow(dead_code)]

pub mod commands;
pub mod error;
pub mod ignore;
pub mod paths;
pub mod scan;
pub mod snapshot;
pub mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "zdirmap=info".into()),
        )
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            scan::start_scan,
            scan::cancel_scan,
            scan::read_gitignore,
            commands::write_text_file,
            snapshot::save_snapshot,
            snapshot::load_snapshot,
            snapshot::list_snapshots,
            snapshot::delete_snapshot,
            snapshot::list_presets,
            snapshot::save_preset,
            snapshot::delete_preset,
        ])
        .run(tauri::generate_context!())
        .expect("error while running ZDirMap");
}
