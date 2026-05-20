# Coding Standards

Ver `.claude/coding-rules.md` para las reglas completas de código (TypeScript, React, Zustand, servicios, Rust, testing, Git).

## Resumen ejecutivo

- **Tipos primero:** Ninguna implementación sin tipos definidos.
- **No `any`:** Usar `unknown` con narrowing o tipos específicos.
- **Componentes puros:** Sin lógica de negocio. Sin llamadas directas a Tauri.
- **Stores delegantes:** Las acciones llaman servicios. No contienen lógica compleja.
- **Servicios puros:** Funciones sin side effects donde sea posible.
- **Rust seguro:** Sin `unwrap()` en producción. `Result<T, AppError>` siempre.
- **Tests primero para lógica de juego:** Cobertura ≥ 95% en `gameEngine.service.ts`.

## Herramientas de calidad configuradas

| Herramienta | Propósito |
|-------------|-----------|
| TypeScript strict mode | Detección de errores en compilación |
| ESLint + Airbnb config | Estilo y patrones |
| Prettier | Formato consistente |
| Vitest | Tests unitarios e integración |
| Playwright | Tests e2e |
| `clippy` (Rust) | Linting de código Rust |
| `cargo test` | Tests unitarios Rust |
