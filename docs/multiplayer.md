# Multiplayer — Estrategia y protocolo

> **Estado:** Fase futura. No implementar hasta completar Fase 1 y 2.
> Todo el código multiplayer debe estar detrás del feature flag `FEATURES.MULTIPLAYER`.

## Arquitectura general

```
Jugador A (Tauri)                 Servidor de relay              Jugador B (Tauri)
      │                                  │                              │
      │ ── WebSocket connect ──────────► │                              │
      │                                  │ ◄─── WebSocket connect ───── │
      │ ── CREATE_ROOM ────────────────► │                              │
      │ ◄── ROOM_CREATED {code} ──────── │                              │
      │                                  │ ◄─── JOIN_ROOM {code} ─────── │
      │ ◄── PLAYER_JOINED ────────────── │                              │
      │ ── GAME_START ─────────────────► │ ─── GAME_START ────────────► │
      │                         [ Partida en curso ]                    │
      │ ── MOVE {position} ────────────► │ ─── MOVE {position} ────────► │
      │ ◄── MOVE_ACK ─────────────────── │                              │
      │ ◄── OPPONENT_MOVE {position} ─── │                              │
```

## Protocolo de mensajes

### Tipos de mensaje cliente → servidor

```typescript
type ClientMessage =
  | { type: 'CREATE_ROOM'; config: RoomConfig }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string }
  | { type: 'PLAYER_READY' }
  | { type: 'MAKE_MOVE'; matchId: string; move: Move; stateHash: string }
  | { type: 'OFFER_DRAW' }
  | { type: 'ACCEPT_DRAW' }
  | { type: 'REJECT_DRAW' }
  | { type: 'RESIGN' }
  | { type: 'PING' };
```

### Tipos de mensaje servidor → cliente

```typescript
type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; roomId: string }
  | { type: 'PLAYER_JOINED'; player: PeerInfo }
  | { type: 'GAME_START'; matchId: string; playerColor: Player; config: MatchConfig }
  | { type: 'OPPONENT_MOVE'; move: Move; newStateHash: string }
  | { type: 'MOVE_REJECTED'; reason: string }
  | { type: 'DRAW_OFFERED' }
  | { type: 'GAME_OVER'; result: GameResult; reason: GameOverReason }
  | { type: 'OPPONENT_DISCONNECTED'; reconnectWindowSeconds: number }
  | { type: 'OPPONENT_RECONNECTED' }
  | { type: 'PONG' };
```

## Verificación de integridad

El campo `stateHash` en `MAKE_MOVE` es un hash SHA-256 del estado completo del tablero después del movimiento. El servidor verifica que el hash del cliente coincide con su propia computación del estado. Si difieren, el servidor rechaza el movimiento y solicita resincronización.

Esto previene desincronizaciones por bugs de implementación y potenciales cheats.

## Reconexión

- Ventana de reconexión: **60 segundos** configurados en el servidor.
- Al reconectarse, el servidor envía el estado completo actual de la partida.
- El cliente aplica el estado recibido y continúa desde donde estaba.
- El timer se pausa durante la desconexión del oponente.

## Consideraciones de latencia

- Movimientos locales se aplican **optimistamente** en el cliente.
- Si el servidor rechaza el movimiento, se hace rollback.
- El timer incluye compensación de latencia (±RTT/2).

## Tecnología del servidor (propuesta)

- **Lenguaje:** Rust (Axum + Tokio)
- **Transport:** WebSocket sobre WSS
- **Despliegue:** Docker + Railway o Fly.io (bajo costo inicial)
- **Escalabilidad:** Cada sala de juego es un actor Tokio. Horizontal scaling via Redis pub/sub cuando sea necesario.
