mod agents;
mod game;

use agents::commands::{list_agents, request_move, start_agent_session, stop_agent_session};
use agents::registry::AgentRegistry;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AgentRegistry::new())
        .invoke_handler(tauri::generate_handler![
            list_agents,
            start_agent_session,
            request_move,
            stop_agent_session,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
