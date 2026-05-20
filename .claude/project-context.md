# Tricki Avanzado — Project Context

## Descripción

Aplicación de escritorio multiplataforma de **Ultimate Tic Tac Toe** con soporte para partidas locales, contra IA y online. Construida para durar años, escalar a miles de usuarios y mantener un estándar de calidad cercano a Chess.com en su dominio.

El tablero es el elemento central de la experiencia. Todo lo demás lo soporta.

## Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Runtime nativo | Tauri | v2 |
| UI Framework | React | 18+ |
| Lenguaje | TypeScript | 5+ |
| Build tool | Vite | 5+ |
| Estilos | TailwindCSS | 3+ |
| Estado global | Zustand | 4+ |
| Routing | React Router | 6+ |
| Backend nativo | Rust | stable |
| Package manager | pnpm | latest |
| Base de datos cloud | Supabase | latest |
| Testing UI | Vitest + Testing Library | latest |
| Testing e2e | Playwright / WebDriver | TBD |

## Arquitectura

Ver `docs/architecture.md` para el diagrama completo.

Capas principales:
1. **UI Layer** — React components, páginas, layouts
2. **State Layer** — Zustand stores (game, user, ui, network)
3. **Service Layer** — Servicios TypeScript que encapsulan lógica de negocio y comunicación
4. **IPC Layer** — Comandos Tauri que exponen funcionalidad Rust al frontend
5. **Rust Core** — Persistencia local, crypto, sistema de archivos, lógica pesada

Comunicación: `UI → Store → Service → IPC → Rust`. Nunca al revés. Nunca saltando capas.

## Estructura de carpetas

```
src/
├── components/
│   ├── game/          # Tablero, celda, marcador — solo lógica visual del juego
│   ├── ui/            # Botones, modales, inputs — design system
│   ├── layout/        # AppShell, Sidebar, Header
│   └── shared/        # Componentes reutilizables sin dominio específico
├── pages/             # Una carpeta por vista (ver lista de vistas)
├── hooks/             # Custom hooks organizados por dominio
├── stores/            # Zustand stores (un archivo por store)
├── services/          # Servicios de negocio (un archivo por dominio)
├── types/             # Tipos TypeScript globales
├── utils/             # Funciones puras sin side effects
└── assets/            # Fuentes, imágenes, sonidos, iconos
```

## Convenciones

Ver `.claude/coding-rules.md` para las reglas completas.

Resumen rápido:
- Componentes: `PascalCase` en carpeta propia con `index.tsx` y `*.styles.ts`
- Hooks: `use` prefix, camelCase — `useGameStore`, `useMatchTimer`
- Stores: sufijo `Store` — `gameStore`, `userStore`
- Servicios: sufijo `Service` — `matchService`, `authService`
- Tipos: PascalCase, sufijo según categoría — `GameState`, `PlayerDTO`, `MatchEvent`
- Constantes: `SCREAMING_SNAKE_CASE`
- Archivos de utilidades: camelCase — `boardUtils.ts`, `timeUtils.ts`

## Restricciones técnicas

- **No usar `any` en TypeScript.** Usar `unknown` y narrowing.
- **No lógica de juego en componentes.** Va en servicios o stores.
- **No llamadas directas a Tauri IPC desde componentes.** Solo desde servicios.
- **No estados locales para datos que deberían ser globales.** Regla de oro: si dos componentes lo necesitan, va al store.
- **TailwindCSS únicamente para estilos.** No styled-components, no CSS Modules excepto para animaciones complejas.
- **React Router para toda navegación.** Sin `window.location` manipulations.
- **pnpm como package manager.** Nunca npm ni yarn.
- Soporte mínimo de resolución: **1280×720**.

## Contexto de negocio

**Usuario final:** Jugadores de Tic Tac Toe avanzado, entre 15 y 35 años, familiarizados con juegos de estrategia digitales.

**Casos de uso principales:**
1. Partida local 1v1 en el mismo equipo
2. Partida contra IA (dificultades: fácil, medio, difícil, experto)
3. Partida online contra otro jugador (fase futura)
4. Revisar historial y estadísticas
5. Ver replay de partidas anteriores

**Métricas de calidad objetivo:**
- Tiempo de arranque < 2s
- Input lag < 16ms (60fps garantizados durante la partida)
- Sin flickering en transiciones de vista
- Partida local 100% funcional sin conexión a internet
