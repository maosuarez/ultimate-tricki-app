mod agents;
mod game;

use agents::commands::{list_agents, request_move, start_agent_session, stop_agent_session};
use agents::python_commands::{
    copy_agent_template, end_python_agent_session, get_agents_dir_path, import_python_agent,
    list_python_agents, open_agents_folder, python_agent_make_move, save_agent_template,
    start_python_agent_session, PythonAgentRegistry,
};
use agents::registry::AgentRegistry;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(AgentRegistry::new())
        .manage(PythonAgentRegistry::new())
        .invoke_handler(tauri::generate_handler![
            list_agents,
            start_agent_session,
            request_move,
            stop_agent_session,
            list_python_agents,
            start_python_agent_session,
            python_agent_make_move,
            end_python_agent_session,
            copy_agent_template,
            get_agents_dir_path,
            open_agents_folder,
            import_python_agent,
            save_agent_template,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
