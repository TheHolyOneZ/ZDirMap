#![allow(dead_code)]

pub mod commands;
pub mod error;
pub mod ignore;
pub mod paths;
pub mod scan;
pub mod snapshot;
pub mod state;

use state::AppState;
use tauri::{LogicalSize, Manager};

fn fit_window_to_screen(app: &tauri::App) {
    let Some(win) = app.get_webview_window("main") else { return };

    #[cfg(target_os = "macos")]
    let _ = win.set_decorations(true);

    let monitor = win.current_monitor().ok().flatten().or_else(|| win.primary_monitor().ok().flatten());
    let Some(monitor) = monitor else { return };
    let scale = monitor.scale_factor();
    let mon_w = monitor.size().width as f64 / scale;
    let mon_h = monitor.size().height as f64 / scale;

    let width = 1480f64.min(mon_w * 0.9);
    let height = 940f64.min(mon_h * 0.85);
    let _ = win.set_min_size(Some(LogicalSize::new(1080f64.min(width), 680f64.min(height))));
    let _ = win.set_size(LogicalSize::new(width, height));
    let _ = win.center();
}

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
        .setup(|app| {
            fit_window_to_screen(app);
            Ok(())
        })
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
