# Backlog de tareas — Fase 1: Mejoras críticas

Estado: `[ ]` pendiente | `[~]` en progreso | `[x]` completado

---

## Sprint 1 — Conectar historial de partidas a base de datos

### Problema

Actualmente, la vista de historial muestra datos simulados desconectados de la base de datos real de partidas. El usuario ve un mock estático en lugar del historial auténtico de partidas jugadas.

### Descripción técnica

**Nota:** Las partidas no se pueden eliminar del historial — la eliminación está prohibida por requerimiento. Las partidas sí se pueden revisar usando el sistema de replay.

---

## Sprint 2 — Clarificar modelo de datos: Historial vs Replays guardados

### Problema

Existe ambigüedad sobre la diferencia entre "Replays guardados" (una categoría en el UI) y "Historial de partidas" (otra vista). No está claro si ambas deben coexistir, si una reemplaza a la otra, o cuál es el caso de uso de cada una.

---

## Sprint 3 — Implementar controles de replay (timeline scrubber)

### Problema

Existe un slider de timeline en la página de replay que representa el historial de movimientos, pero es no funcional. Al mover el slider, el tablero no se actualiza para mostrar el estado del juego en ese punto del timeline.

### Descripción técnica

El timeline scrubber debe:
1. Recibir la lista de movimientos (`moves: Move[]`) desde la base de datos
2. Permitir al usuario deslizar o hacer clic para seleccionar un punto en el tiempo
3. Ejecutar los movimientos hasta ese punto para reconstruir el estado del tablero
4. Proporcionar controles de reproducción (play, pause, siguiente movimiento, movimiento anterior)
5. Mostrar metadatos del movimiento actual (qué jugador, dónde, en qué turno)

**Nota técnica:** El estado del replay debe ser independiente del estado del juego activo. Usar un selector de Zustand en el `replayStore` para mantener el estado actual sin afectar `gameStore`.

---

## Sprint 4 — Implementar vista de perfil de usuario y solicitudes de amistad

### Problema

No existe forma de ver el perfil público de otro jugador ni enviar solicitudes de amistad. Esto es necesario para la socialización en el modo online.

### Descripción técnica

**Funcionalidad de perfil:**
- Nueva ruta `/profile/:userId` que carga el perfil del usuario desde Supabase
- Muestra: avatar, nombre, estadísticas (partidas jugadas, tasa de victoria), rango global (si aplica)
- Si es el perfil del usuario autenticado: opción para editar; si es otro usuario: botón "Solicitar amistad"

**Funcionalidad de amistad:**
- Las solicitudes se guardan en tabla `friend_requests` en Supabase PostgreSQL (ver schema en `supabase/migrations/`)
- Las solicitudes se sincronizan en tiempo real vía WebSocket (Azure): cuando llega solicitud, notificar al usuario
- Las solicitudes rechazadas se borran; las aceptadas crean entrada en tabla `friendships`
- El usuario puede listar sus amigos desde su propio perfil

**Nota de paralelismo:** La persistencia (Supabase) y la sincronización en tiempo real (WebSocket) se pueden implementar en paralelo sin bloqueo. El servicio maneja ambas vías.

### Criterios de aceptación

- [ ] Ruta `/profile/:userId` existe y carga datos del usuario correctamente
- [ ] Se muestra avatar, nombre, estadísticas, fecha de ingreso
- [ ] Para perfil propio: botón "Editar perfil" está visible
- [ ] Para otro perfil: botón "Solicitar amistad" está visible y funcional
- [ ] Hacer clic en "Solicitar amistad" inserta registro en `friend_requests` en Supabase
- [ ] El usuario que recibe la solicitud ve una notificación en tiempo real (WebSocket)
- [ ] El usuario puede aceptar/rechazar solicitudes desde notificación o desde lista de pendientes
- [ ] Las amistades aceptadas se listan en el perfil del usuario
- [ ] TypeScript: sin errores en tipos de Usuario y Solicitud

### Notas de implementación

- Crear tipo `UserProfile` en `src/types/user.types.ts` con campos de perfil público
- Crear servicio `src/services/friendshipService.ts` que maneje solicitudes (HTTP a Supabase + WebSocket)
- Actualizar `userStore.ts` con acción `addFriendRequest(userId: string)` y `respondToRequest(requestId: string, accept: boolean)`
- Schema Supabase (migraciones):
  ```sql
  CREATE TABLE friend_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES auth.users(id),
    recipient_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(requester_id, recipient_id)
  );
  
  CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_a_id UUID NOT NULL REFERENCES auth.users(id),
    user_b_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_a_id, user_b_id)
  );
  ```

---

## Sprint 5 — Mejorar UX de sala de espera (lobby): navegación y distribución de botones

### Problema

El usuario no tiene forma intuitiva de salir de una sala de espera (lobby) mientras espera a un oponente. Además, la distribución visual de elementos es confusa: el botón de salida está encima del código de sala en lugar de estar alineado horizontalmente.

### Descripción técnica

**Salida de lobby:**
- Agregar botón explícito "Abandonar sala" o similar en la esquina superior derecha del lobby
- Hacer clic llama a `matchStore.leaveLobby()` que cierra la conexión WebSocket, limpia el estado y navega a `/`
- Si hay oponente ya en la sala, notificarle que el otro jugador se desconectó

**Mejora visual:**
- Reorganizar layout para que código de sala y botón de salida estén en la misma fila (flex row)
- Código de sala: texto copiable (con botón de copiar al portapapeles)
- Botón de salida: destaca visualmente pero no compite con código de sala

**Nota:** Los cambios son puramente visuales + control de estado. No afecta lógica de networking.

### Criterios de aceptación

- [ ] Existe botón "Abandonar sala" (o similar) visibilidad clara en el lobby
- [ ] Hacer clic en botón abandona sala sin confirmación (pero navega a /)
- [ ] Código de sala y botón de salida están horizontalmente alineados
- [ ] Código de sala es copiable (click para copiar o selector de texto)
- [ ] La sala se cierra correctamente en el servidor WebSocket
- [ ] El oponente (si existe) recibe notificación de desconexión
- [ ] No hay regresiones en navegación o estado de matchStore
- [ ] UI es responsiva en 1280×720 (resolución mínima soportada)

### Notas de implementación

- Actualizar componente `LobbyPage` para reorganizar flex layout
- Agregar acción en `matchStore.ts`: `leaveLobby() { closeWebSocket(); resetMatch(); }`
- Si el oponente estaba conectado, emitir evento por WebSocket antes de cerrar

---

## Sprint 6 — Enforcer restricción: una partida activa a la vez

### Problema

El usuario puede crear o unirse a múltiples partidas simultáneamente. Esto causa confusión sobre cuál es la partida activa y puede desincronizar el estado. Requerimiento: solo una partida activa a la vez en toda la aplicación.

### Descripción técnica

**Validación en frontend:**
- Antes de permitir crear una nueva partida (ruta `/create`), validar que `matchStore.activeMatch` sea null
- Antes de permitir unirse a una sala (ruta `/join`), validar que `matchStore.activeMatch` sea null
- Si hay partida activa, mostrar diálogo modal elegante bloqueando la acción

**Validación en backend (Supabase):**
- Consulta en trigger o función que valide que el usuario no tenga otra partida `status = 'active'`
- Retorna error si viola la restricción

**Modal de bloqueo:**
- Título: "Partida en progreso"
- Mensaje: "Debe terminar o abandonar la partida actual para jugar otra"
- Botones: "Volver a partida activa" (navega a `/game`) o "Revisar opciones" (muestra acciones)
- Estilo: consistente con modales de victoria/derrota existentes

### Criterios de aceptación

- [ ] Si existe `matchStore.activeMatch`, página `/create` muestra modal de bloqueo
- [ ] Si existe `matchStore.activeMatch`, página `/join` muestra modal de bloqueo
- [ ] Modal de bloqueo tiene opción de volver a partida activa (navega a `/game`)
- [ ] Modal tiene el mismo estilo/animación que otros modales de juego
- [ ] Backend (Supabase) rechaza intentos de crear segundo match en paralelo
- [ ] Después de terminar partida, `matchStore.activeMatch` se limpia
- [ ] Usuario puede crear nueva partida inmediatamente después de terminar anterior
- [ ] No hay regresiones en flujo normal de juego

### Notas de implementación

- Agregar guard en React Router para rutas `/create` y `/join`: verificar `!matchStore.activeMatch`
- Crear componente modal reusable `ActiveMatchBlockedModal`
- En `matchStore.ts`: asegurarse que acción `endMatch()` limpia `activeMatch`

---

## Sprint 7 — Registrar partidas contra IA (Flattie) en historial

### Problema

Las partidas jugadas contra el motor de IA "Flattie" (que usa FVMC) no se están guardando en la base de datos de historial. El usuario termina una partida contra IA pero no la ve luego en la sección de historial.

### Descripción técnica

**Flujo actual (incompleto):**
1. Usuario crea partida en modo "vs IA" (dificultad: fácil, medio, difícil, experto)
2. Juega contra Flattie en `/game`
3. Partida termina (victoria, derrota, empate)
4. Datos de la partida no se persisten en SQLite

**Flujo esperado:**
1. Cuando la partida termina (cualquier modo), llamar a comando Tauri `save_match(MatchRecord)`
2. `MatchRecord` debe incluir: modo ('ai'), jugador X, Flattie como jugador O, resultado, movimientos completos, timestamp
3. La partida aparece inmediatamente en el historial

**Nota:** El problema es probablemente que el servicio de IA no llama a `saveMatch` al terminar. Revisar `src/services/gameService.ts` y `src/services/aiService.ts` para identificar dónde se está perdiendo la llamada.

### Criterios de aceptación

- [ ] Partida contra Flattie (cualquier dificultad) termina y se guarda en SQLite
- [ ] La partida aparece en el historial con metadatos correctos (fecha, dificultad, resultado)
- [ ] Historial muestra "Flattie (Experto)" o similar en lugar de nombre genérico
- [ ] Se incluyen todos los movimientos de la partida en tabla `moves`
- [ ] Se registra duración correcta de la partida
- [ ] Partidas locales (1v1) siguen guardándose sin regresión
- [ ] Partidas online guardan correctamente (fase multiplayer)

### Notas de implementación

- Auditar `src/services/aiService.ts` para verificar si existe llamada a `tauriService.saveMatch()`
- Si no existe: agregar llamada al final de `playAiGame()` o en manejador de victoria/derrota
- Asegurarse que `MatchRecord` tenga campo `mode: 'ai'` y nombre del jugador IA
- Puede ser que `gameStore` no esté limpiándose correctamente después de Victoria, revisar acción `endGame()`

---

## Sprint 8 — Sistema de agentes Python personalizados (vista de desarrollador)

### Problema

Actualmente solo se puede jugar contra "Flattie" (IA hardcodeada en Rust). Para usuarios que están aprendiendo desarrollo de agentes, necesitan una forma de cargar agentes propios escritos en Python y jugar contra ellos.

### Descripción técnica

**Requisitos técnicos:**
- Crear interfaz estándar que agentes Python deben implementar: métodos `mount()` (inicializar) y `act(game_state: dict) -> tuple[int, int]` (retorna movimiento)
- Agentes solo pueden usar librerías estándar (numpy permitida, pero no torch, tensorflow, etc.) para mantener portabilidad
- Cargar dinámicamente archivos Python en directorio `~/.tricki/agents/` y ejecutarlos en proceso separado Rust
- Vista de desarrollador accesible solo si `VITE_FEATURE_DEVELOPER_MODE === 'true'`

**Flujo:**
1. Usuario accede a vista `/developer/agents` (feature flag)
2. Ve lista de agentes disponibles (cargados de filesystem)
3. Puede crear partida contra agente custom (ruta: modo 'custom_agent', agente_name)
4. Durante partida: Rust invoca subprocess de Python para computar movimiento del agente
5. Agente retorna movimiento validado, se aplica al tablero
6. Partida se guarda en historial con etiqueta 'custom_agent'

**Nota de complejidad:** Este sprint es el más exigente. El manejo de subprocesses Python, serialización de estado del juego y manejo de errores de agentes requiere cuidado. Considerar implementar en fases:
- Fase A: Sistema de carga de archivos Python + boilerplate
- Fase B: Ejecución segura en subprocess (with timeouts)
- Fase C: UI de desarrollador y gestión de agentes

### Criterios de aceptación

- [ ] Interfaz estándar de agente Python documentada en `docs/agent-interface.md`
- [ ] Directorio `~/.tricki/agents/` es monitorizado y listado dinámicamente
- [ ] Usuario puede seleccionar agente custom desde UI cuando modo es 'custom_agent'
- [ ] Rust ejecuta agente Python en subprocess con timeout (máximo 5s por movimiento)
- [ ] Si agente falla (timeout, excepción): movimiento inválido registrado y turno pasado al oponente
- [ ] Vista `/developer/agents` muestra lista de agentes y permite inspeccionar última partida contra cada uno
- [ ] Partida contra agente custom se guarda en historial con `mode: 'custom_agent'` y nombre del agente
- [ ] Feature flag `VITE_FEATURE_DEVELOPER_MODE` controla accesibilidad de vista
- [ ] Documentación clara sobre cómo escribir un agente custom (template proporcionado)
- [ ] TypeScript: sin errores en tipos de sesión de agente

### Notas de implementación

**Interfaz Python esperada:**
```python
# agents/my_agent.py
class Agent:
    def mount(self):
        """Inicializa el agente. Llamado una sola vez al inicio."""
        pass
    
    def act(self, game_state: dict) -> tuple[int, int]:
        """
        Recibe estado del juego, retorna movimiento.
        game_state: {
          'board': list[list[int]] (9x9),
          'active_subboard': (int, int),
          'player': 1 (X) o -1 (O),
          ...
        }
        Retorna: (macro_row, macro_col)
        """
        return (0, 0)
```

**Estructura Rust:**
- Crear `src-tauri/src/agents/` con módulos:
  - `loader.rs` — descubre y lista archivos `.py`
  - `executor.rs` — invoca subprocess Python con timeout y serializa/deserializa estado
  - `commands/agent.rs` — comando Tauri `play_against_agent(agent_name: String, difficulty?: String)`

**TypeScript:**
- Crear `src/services/agentService.ts` que envuelva comandos de agente
- Crear `src/pages/DeveloperAgentsPage.tsx` (solo accesible si feature flag)
- Agregar ruta en `src/routes/` (protected by feature flag)

**Testing:**
- Agente de ejemplo que juega siempre en (0, 0) — verificar que funciona el sistema
- Agente que espera 10s — verificar timeout funciona

---

## Notas generales de ejecución

### Orden recomendado

1. **Sprint 2** (decisión arquitectónica, paralelo)
2. **Sprint 1** (bloquea Sprint 3)
3. **Sprint 3** (depende de Sprint 1)
4. **Sprint 5** (independiente, bajo riesgo)
5. **Sprint 6** (independiente, bajo-medio riesgo)
6. **Sprint 7** (auditoría + fix, medio riesgo)
7. **Sprint 4** (medio riesgo, requiere Supabase schema)
8. **Sprint 8** (alto riesgo, alto esfuerzo, ejecutar en fases)

### Criterios de aceptación comunes

- Todos los sprints deben compilar sin errores TypeScript
- Respetarse convenciones de nombres en `.claude/coding-rules.md`
- No crear código muerto; todo código debe ser alcanzable y probado
- Documentar decisiones arquitectónicas en `docs/architecture.md` si aplican
