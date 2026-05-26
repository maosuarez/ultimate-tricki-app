use serde::{Deserialize, Serialize};
use std::io::{BufRead, Write};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::time::Duration;
use thiserror::Error;

// ─── Wrapper script ───────────────────────────────────────────────────────────

/// Python wrapper embedded in the binary.
/// Written to a temp file once per session; loads and drives the user's agent.
const WRAPPER_SCRIPT: &str = r#"import sys, json, importlib.util, os

def load_agent(path):
    spec = importlib.util.spec_from_file_location("agent", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.Agent()

agent_path = sys.argv[1]
agent = load_agent(agent_path)
agent.mount()

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    state = json.loads(line)
    result = agent.act(state)
    print(json.dumps({"move": list(result)}), flush=True)
"#;

// ─── Types ────────────────────────────────────────────────────────────────────

/// Game state payload sent to the Python agent over stdin.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameStatePayload {
    pub board: Vec<Vec<i8>>,
    pub active_subboard: Option<[i8; 2]>,
    /// 1 = X, -1 = O
    pub player: i8,
    pub valid_moves: Vec<[i8; 2]>,
}

/// Move returned by the Python agent.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentMove {
    pub macro_row: i8,
    pub macro_col: i8,
}

/// Errors that can occur when communicating with a Python agent process.
#[derive(Debug, Error)]
pub enum ExecutorError {
    #[error("agent did not respond within the time limit")]
    Timeout,
    #[error("agent response could not be parsed: {0}")]
    InvalidResponse(String),
    #[error("failed to spawn Python process: {0}")]
    SpawnFailed(String),
    #[error("I/O error communicating with agent: {0}")]
    Io(String),
}

// ─── Active session ───────────────────────────────────────────────────────────

/// A running Python agent process.
/// The stdout reader is stored inside an `Option` so we can move it into a
/// thread for timed reads and then restore it afterward.
pub struct AgentProcess {
    child: Child,
    stdin: ChildStdin,
    /// Wrapped in `Option` so we can temporarily move ownership into a thread.
    stdout_reader: Option<std::io::BufReader<std::process::ChildStdout>>,
    /// Keeps the temp wrapper script alive for the lifetime of the process.
    _wrapper_file: tempfile::NamedTempFile,
}

impl AgentProcess {
    /// Spawns the Python wrapper for the agent at `agent_path`.
    pub fn spawn(agent_path: &str) -> Result<Self, ExecutorError> {
        // Write wrapper script to a temp file.
        let mut wrapper_file = tempfile::Builder::new()
            .prefix("tricki_agent_wrapper_")
            .suffix(".py")
            .tempfile()
            .map_err(|e| ExecutorError::SpawnFailed(format!("tempfile: {e}")))?;

        wrapper_file
            .write_all(WRAPPER_SCRIPT.as_bytes())
            .map_err(|e| ExecutorError::SpawnFailed(format!("write wrapper: {e}")))?;

        let wrapper_path = wrapper_file.path().to_string_lossy().into_owned();

        // Prefer `python3`; fall back to `python`.
        let python = if which_python("python3") { "python3" } else { "python" };

        let mut child = Command::new(python)
            .arg(&wrapper_path)
            .arg(agent_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| ExecutorError::SpawnFailed(format!("spawn: {e}")))?;

        let stdin = child.stdin.take().unwrap();
        let stdout_reader = Some(std::io::BufReader::new(child.stdout.take().unwrap()));

        Ok(Self {
            child,
            stdin,
            stdout_reader,
            _wrapper_file: wrapper_file,
        })
    }

    /// Sends `game_state` to the Python agent and waits up to `timeout` for a move.
    pub fn request_move(
        &mut self,
        game_state: &GameStatePayload,
        timeout: Duration,
    ) -> Result<AgentMove, ExecutorError> {
        // Serialize state and send to stdin.
        let payload =
            serde_json::to_string(game_state).map_err(|e| ExecutorError::Io(e.to_string()))?;
        writeln!(self.stdin, "{payload}").map_err(|e| ExecutorError::Io(e.to_string()))?;

        // Move the reader into a thread so we can apply a timeout.
        // The thread returns the reader back alongside the result.
        let mut reader = self
            .stdout_reader
            .take()
            .expect("stdout_reader already consumed — concurrent call detected");

        let (tx, rx) = std::sync::mpsc::channel::<(
            std::io::BufReader<std::process::ChildStdout>,
            Result<String, ExecutorError>,
        )>();

        std::thread::spawn(move || {
            let mut line = String::new();
            let result = reader
                .read_line(&mut line)
                .map(|_| line.trim().to_string())
                .map_err(|e| ExecutorError::Io(e.to_string()));
            let _ = tx.send((reader, result));
        });

        // Wait with timeout; restore reader regardless of outcome.
        match rx.recv_timeout(timeout) {
            Ok((reader, result)) => {
                self.stdout_reader = Some(reader);
                let raw = result?;
                if raw.is_empty() {
                    return Err(ExecutorError::Timeout);
                }
                parse_agent_response(&raw)
            }
            Err(_) => {
                // Reader is still in the thread — kill the process so the thread
                // unblocks, then wait for it to return the reader.
                let _ = self.child.kill();
                if let Ok((reader, _)) = rx.recv() {
                    self.stdout_reader = Some(reader);
                }
                Err(ExecutorError::Timeout)
            }
        }
    }

    /// Terminates the child process gracefully.
    pub fn terminate(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

impl Drop for AgentProcess {
    fn drop(&mut self) {
        self.terminate();
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn which_python(name: &str) -> bool {
    Command::new(name).arg("--version").output().is_ok()
}

fn parse_agent_response(raw: &str) -> Result<AgentMove, ExecutorError> {
    #[derive(Deserialize)]
    struct RawResponse {
        #[serde(rename = "move")]
        mv: Vec<serde_json::Value>,
    }

    let parsed: RawResponse = serde_json::from_str(raw).map_err(|e| {
        ExecutorError::InvalidResponse(format!("JSON parse: {e} (got: {raw:?})"))
    })?;

    if parsed.mv.len() != 2 {
        return Err(ExecutorError::InvalidResponse(format!(
            "expected 2-element move array, got {} element(s)",
            parsed.mv.len()
        )));
    }

    let row = parsed.mv[0]
        .as_i64()
        .ok_or_else(|| ExecutorError::InvalidResponse("move[0] is not an integer".into()))?
        as i8;
    let col = parsed.mv[1]
        .as_i64()
        .ok_or_else(|| ExecutorError::InvalidResponse("move[1] is not an integer".into()))?
        as i8;

    Ok(AgentMove { macro_row: row, macro_col: col })
}
