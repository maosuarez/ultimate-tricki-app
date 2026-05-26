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

const AGENT_TEMPLATE: &str = include_str!("../../../docs/agent-template.py");

/// Copies the bundled agent template to `~/.tricki/agents/agent-template.py`.
/// Returns the absolute path to the written file.
pub fn copy_template() -> Result<String, String> {
    let dir = agents_dir()?;
    let dest = dir.join("agent-template.py");
    fs::write(&dest, AGENT_TEMPLATE)
        .map_err(|e| format!("failed to write template: {e}"))?;
    Ok(dest.to_string_lossy().into_owned())
}

/// Returns the absolute path to `~/.tricki/agents/` as a string.
pub fn get_agents_dir_path() -> Result<String, String> {
    agents_dir().map(|p| p.to_string_lossy().into_owned())
}

/// Copies a `.py` file from `source_path` into `~/.tricki/agents/`.
/// Returns the metadata of the imported agent.
pub fn import_agent(source_path: &str) -> Result<PythonAgentInfo, String> {
    let src = std::path::Path::new(source_path);
    if src.extension().and_then(|e| e.to_str()) != Some("py") {
        return Err("only .py files are supported".to_string());
    }
    let filename = src
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or_else(|| "invalid filename".to_string())?
        .to_string();
    let dir = agents_dir()?;
    let dest = dir.join(&filename);
    fs::copy(src, &dest).map_err(|e| format!("failed to copy agent: {e}"))?;
    let name = src
        .file_stem()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();
    Ok(PythonAgentInfo {
        name,
        path: dest.to_string_lossy().into_owned(),
        filename,
    })
}

/// Writes the bundled agent template to the given `dest_path`.
/// Returns the absolute path written.
pub fn save_template_to(dest_path: &str) -> Result<String, String> {
    let dest = std::path::Path::new(dest_path);
    fs::write(dest, AGENT_TEMPLATE)
        .map_err(|e| format!("failed to write template: {e}"))?;
    Ok(dest.to_string_lossy().into_owned())
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
