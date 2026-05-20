# Motor de IA

## Filosofía

La IA debe ser **justa, predecible por nivel y desafiante**. El jugador en nivel `easy` debe sentir que puede ganar. En `expert`, debe sentir que juega contra algo que piensa de verdad.

Toda la computación de IA ocurre en **Rust en un thread separado** (`tokio::spawn`). La UI nunca se bloquea esperando la respuesta de la IA.

## Niveles de dificultad

| Nivel | Algoritmo | Profundidad | Comportamiento |
|-------|-----------|-------------|----------------|
| `easy` | Random válido + heurística básica | 1 | Movimiento aleatorio entre los válidos, con 30% de probabilidad de hacer el movimiento "obvio" |
| `medium` | Minimax | 3 | Siempre bloquea victorias inmediatas del oponente y toma victorias inmediatas propias |
| `hard` | Minimax + Alpha-Beta pruning | 5 | Juega bien pero comete errores en posiciones complejas |
| `expert` | MCTS | 1000–5000 simulaciones | Juega de forma óptima o casi óptima |

## Minimax (niveles medium y hard)

```rust
// src-tauri/src/game/ai/minimax.rs

fn minimax(
    state: &GameState,
    depth: u8,
    alpha: i32,
    beta: i32,
    maximizing: bool,
) -> i32 {
    if depth == 0 || is_terminal(state) {
        return evaluate(state);
    }
    // ... implementación estándar con alpha-beta pruning
}
```

### Función de evaluación heurística

Componentes de la evaluación (para nivel `hard`):
1. **Victorias en subtableros:** +100 por subtablero ganado, -100 por subtablero perdido por el oponente
2. **Progreso en líneas:** +10 por tener 2 en línea (macroboard) sin bloqueo
3. **Control del centro:** +5 por controlar subtablero central [1,1]
4. **Envío estratégico:** +3 por mover hacia el centro del subtablero destino
5. **Resultado terminal:** +10000 victoria, -10000 derrota

## MCTS (nivel expert)

```
Para cada simulación:
1. Selection: Navegar el árbol con UCB1 hasta hoja no explorada
2. Expansion: Agregar nuevo nodo hijo
3. Simulation (Rollout): Jugar aleatoriamente hasta terminal
4. Backpropagation: Actualizar wins/visits hacia la raíz

Seleccionar movimiento con mayor win rate tras N simulaciones
```

**UCB1 fórmula:** `wins/visits + C * sqrt(ln(parent_visits) / visits)`
donde `C = sqrt(2)` (parámetro de exploración estándar).

## Tiempo de respuesta objetivo

| Nivel | Tiempo máximo |
|-------|--------------|
| easy | < 100ms |
| medium | < 300ms |
| hard | < 800ms |
| expert | 1000–2000ms (para dar sensación de "pensar") |

Un delay artificial mínimo de 200ms en todos los niveles previene que la IA parezca instantánea (experiencia de usuario).

## Interfaz con el frontend

```rust
#[tauri::command]
pub async fn compute_ai_move(
    state: GameStateDTO,
    difficulty: AiDifficulty,
) -> Result<MoveDTO, AppError> {
    // Ejecutar en thread separado para no bloquear el event loop de Tauri
    tokio::task::spawn_blocking(move || {
        let game_state = GameState::from(state);
        let engine = AiEngine::new(difficulty);
        let best_move = engine.compute_best_move(&game_state)?;
        Ok(MoveDTO::from(best_move))
    })
    .await
    .map_err(|_| AppError::AiError)?
}
```

## Fase futura — IA basada en ML

Si el proyecto crece, se puede entrenar una red neuronal (similar a AlphaZero) con:
- Self-play masivo generando datos de entrenamiento
- Red de política (qué movimiento hacer) + red de valor (qué tan buena es la posición)
- Integrar el modelo en Rust via ONNX Runtime

Este path se evalúa solo si el MCTS resulta insuficiente a nivel competitivo.
