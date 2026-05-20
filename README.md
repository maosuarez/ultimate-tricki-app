# Tricki Avanzado

> Ultimate Tic Tac Toe — Aplicación de escritorio multiplataforma

[![Tauri](https://img.shields.io/badge/Tauri-v2-blue)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://typescriptlang.org)

---

## ¿Qué es Tricki Avanzado?

Una implementación de alta calidad de **Ultimate Tic Tac Toe** como aplicación de escritorio nativa, construida para durar. Soporta partidas locales, contra IA y (próximamente) online contra otros jugadores en tiempo real.

El diseño visual está inspirado en Chess.com: el tablero domina. La interfaz lo soporta sin ruido.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Aplicación nativa | Tauri v2 |
| UI | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | TailwindCSS |
| Estado | Zustand |
| Routing | React Router 6 |
| Backend nativo | Rust (stable) |
| Testing | Vitest + Playwright |

---

## Inicio rápido

### Prerrequisitos

- Node.js 20+
- Rust (stable, via [rustup](https://rustup.rs))
- Dependencias del sistema para Tauri: [ver guía oficial](https://v2.tauri.app/start/prerequisites/)

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url> tricki-avanzado
cd tricki-avanzado

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run tauri dev

# Build de producción
npm run tauri build
```

---

## Documentación

| Documento | Descripción |
|-----------|-------------|
| `docs/vision.md` | Visión del producto y objetivos a largo plazo |
| `docs/architecture.md` | Arquitectura técnica completa y diagramas |
| `docs/game-rules.md` | Reglas de Ultimate Tic Tac Toe |
| `docs/frontend.md` | Estructura del frontend, componentes, rutas |
| `docs/backend.md` | Capa Rust, comandos Tauri, persistencia |
| `docs/multiplayer.md` | Estrategia y protocolo multiplayer (fase futura) |
| `docs/ai-engine.md` | Motor de IA, algoritmos, niveles de dificultad |
| `docs/ui-design.md` | Design system, tokens, componentes |
| `docs/roadmap.md` | Fases de desarrollo y timeline |
| `docs/coding-standards.md` | Estándares de código del equipo |

### Para contribuidores / Claude Code

Ver `.claude/` para el contexto optimizado para desarrollo con IA:
- `project-context.md` — Contexto técnico completo
- `architecture-rules.md` — Decisiones arquitectónicas
- `ui-guidelines.md` — Sistema de diseño
- `coding-rules.md` — Estándares de código
- `game-domain.md` — Dominio del juego
- `tasks/` — Backlog organizado por fase

---

## Plataformas soportadas

| OS | Soporte |
|----|---------|
| Windows 10/11 | ✅ |
| macOS 12+ | ✅ |
| Linux (Ubuntu 20.04+, Fedora 35+) | ✅ |

Resoluciones soportadas: 1280×720 → 4K + ultrawide.

---

## Licencia

MIT
