# UI Design

Ver `.claude/ui-guidelines.md` para el sistema de diseño completo (paleta, tipografía, componentes, animaciones, accesibilidad).

## Identidad visual

**Estética:** Dark-first, precision-driven. Inspirado en la densidad informacional de Chess.com pero con la limpieza de Notion. El tablero irradia presencia sin esfuerzo.

**Personalidad:** Serio. Competente. Sin frivolidades. Pero con momentos de celebración genuina (animación de victoria).

## Resoluciones y layouts

El tablero siempre es el elemento dominante. Los layouts se adaptan así:

| Resolución | Layout |
|-----------|--------|
| 1280×720 | Board 58% / Panel 42% — compacto |
| 1920×1080 | Board 62% / Panel 38% — cómodo |
| 2560×1440 | Board 65% / Panel 35% — espacioso |
| Ultrawide | Board centrado con límite, panel flotante |
| 4K | Scaling × 1.5 vía `rem` base |

## Estados de pantalla

Cada vista debe tener diseño explícito para:
- Estado inicial / vacío
- Estado de carga (skeleton loaders, no spinners genéricos)
- Estado de error (con acción de recuperación)
- Estado vacío con datos (historial vacío, etc.)
