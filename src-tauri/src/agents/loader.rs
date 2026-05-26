use serde::{Deserialize, Serialize};
use std::fs;

/// Metadata for a discovered Python agent file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PythonAgentInfo {
    /// Agent name: filename without the `.py` extension.
    pub name: String,
    /// Absolute path to the `.py` file.
    pub path: String,
    /// Filename with extension, e.g. `my_agent.py`.
    pub filename: String,
}

/// Returns the path to `~/.tricki/agents/`, creating it if absent.
fn agents_dir() -> Result<std::path::PathBuf, String> {
    let home = dirs_next::home_dir()
        .ok_or_else(|| "cannot determine home directory".to_string())?;
    let dir = home.join(".tricki").join("agents");
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("failed to create agents directory: {e}"))?;
    }
    Ok(dir)
}

/// Scans `~/.tricki/agents/` for `.py` files and returns their metadata.
/// Creates the directory if it does not exist.
pub fn list_agents() -> Result<Vec<PythonAgentInfo>, String> {
    let dir = agents_dir()?;

    let entries = fs::read_dir(&dir)
        .map_err(|e| format!("failed to read agents directory: {e}"))?;

    let mut agents = Vec::new();
    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("py") {
            let filename = path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            let name = path
                .file_stem()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_string();
            agents.push(PythonAgentInfo {
                name,
                path: path.to_string_lossy().into_owned(),
                filename,
            });
        }
    }

    agents.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(agents)
}
