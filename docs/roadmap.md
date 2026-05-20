# Roadmap

## Fase 1 — Fundación (actual)

**Objetivo:** Partida local perfecta. Todo lo demás puede esperar.

- [x] Arquitectura y documentación base
- [ ] Scaffolding del proyecto (Tauri + React + TypeScript + Tailwind)
- [ ] Design system base (botones, modales, layout)
- [ ] Motor de juego en TypeScript con tests completos
- [ ] Tablero visual completo con todos los estados
- [ ] Partida local 1v1 funcional
- [ ] Persistencia de historial (SQLite via Rust)
- [ ] Vista de resultado (victoria, derrota, empate)
- [ ] Vista de historial
- [ ] Configuración básica (tema, sonido)

**Criterio de salida:** Una partida completa se puede jugar de inicio a fin sin bugs. El historial se guarda y se puede ver.

---

## Fase 2 — IA y Replay

**Objetivo:** El jugador puede mejorar solo.

- [ ] Motor de IA (Minimax + Alpha-Beta para medium/hard)
- [ ] Motor de IA MCTS para nivel expert
- [ ] Vista de configuración de partida con selector de dificultad
- [ ] Sistema de replay funcional
- [ ] Estadísticas locales del jugador
- [ ] Animaciones de victoria elaboradas
- [ ] Sonidos de juego

**Criterio de salida:** Nivel `expert` de IA es genuinamente desafiante para un jugador avanzado. El replay reproduce fielmente cualquier partida guardada.

---

## Fase 3 — Multiplayer

**Objetivo:** Jugar contra personas reales.

- [ ] Servidor de relay WebSocket (Rust/Axum)
- [ ] Sistema de salas (crear, unirse por código)
- [ ] Sincronización de estado con verificación de integridad
- [ ] Sistema de reconexión
- [ ] Timer por movimiento
- [ ] Chat de texto en partida (simple)
- [ ] Matchmaking automático básico

**Criterio de salida:** Dos jugadores en redes distintas pueden completar una partida sin desincronización.

---

## Fase 4 — Sistema de cuentas y comunidad

**Objetivo:** Trascender la sesión individual.

- [ ] Sistema de autenticación (email + OAuth)
- [ ] Perfil de usuario persistente en servidor
- [ ] ELO / sistema de rating
- [ ] Ranking global
- [ ] Torneos automáticos (formato suizo o eliminación directa)
- [ ] Análisis asistido por IA post-partida
- [ ] Sistema de amigos
- [ ] Notificaciones (es tu turno en partida por turnos)

---

## Deuda técnica planificada

| Item | Fase de resolución |
|------|------------------|
| Migrar de Minimax a MCTS para nivel `hard` | Fase 2 |
| Internacionalización (i18n) | Fase 3 |
| Accesibilidad completa (WCAG AA) | Fase 3 |
| Tests e2e en los 3 OS | Fase 2 |
| Firma de ejecutables para Windows/macOS | Previo a lanzamiento público |
