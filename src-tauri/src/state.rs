use std::collections::HashMap;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Default)]
pub struct AppState {
    pub cancel_map: Arc<Mutex<HashMap<String, Arc<AtomicBool>>>>,
}
