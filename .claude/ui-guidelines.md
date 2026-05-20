# UI Guidelines

Sistema de diseño de Tricki Avanzado. Todo componente nuevo debe seguir estas guías.

---

## Principios

1. **El tablero domina.** Ningún elemento UI compite visualmente con el tablero durante la partida.
2. **Claridad antes que decoración.** Cada elemento tiene un propósito. Sin adorno.
3. **Feedback inmediato.** Cada acción del usuario tiene respuesta visual < 100ms.
4. **Densidad controlada.** Información necesaria visible. Sin scroll innecesario en la vista de juego.

---

## Sistema de color

```css
/* Paleta base — tema oscuro por defecto */
--color-bg-base: #0f0f10;          /* Fondo principal */
--color-bg-surface: #18181b;       /* Cards, paneles */
--color-bg-elevated: #27272a;      /* Dropdowns, tooltips */
--color-bg-hover: #3f3f46;         /* Estados hover */

/* Tablero */
--color-board-bg: #1c1c1f;
--color-board-line: #3f3f46;
--color-board-active: #2d2d31;     /* Subtablero activo */
--color-board-inactive: #141416;   /* Subtableros bloqueados */
--color-board-won-x: rgba(239, 68, 68, 0.12);
--color-board-won-o: rgba(59, 130, 246, 0.12);

/* Jugadores */
--color-player-x: #ef4444;         /* Rojo intenso */
--color-player-x-dim: #7f1d1d;
--color-player-o: #3b82f6;         /* Azul eléctrico */
--color-player-o-dim: #1e3a5f;

/* UI */
--color-accent: #f59e0b;           /* Acento — victorias, highlights */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-text-primary: #fafafa;
--color-text-secondary: #a1a1aa;
--color-text-muted: #52525b;
--color-border: #27272a;
--color-border-focus: #71717a;
```

**Tema claro:** Será un override completo definido en `src/styles/theme-light.css`. El tema oscuro es el default y el prioritario.

---

## Tipografía

```css
/* Fuentes — importar desde Google Fonts o incluir en assets/fonts/ */
--font-display: 'Syne', sans-serif;       /* Títulos, logotipo */
--font-body: 'DM Sans', sans-serif;       /* Cuerpo, UI general */
--font-mono: 'JetBrains Mono', monospace; /* Timers, coordenadas, stats */

/* Escala tipográfica */
--text-xs: 0.75rem;    /* 12px — labels, badges */
--text-sm: 0.875rem;   /* 14px — body secundario */
--text-base: 1rem;     /* 16px — body principal */
--text-lg: 1.125rem;   /* 18px — subtítulos */
--text-xl: 1.25rem;    /* 20px — títulos de sección */
--text-2xl: 1.5rem;    /* 24px — títulos de página */
--text-3xl: 1.875rem;  /* 30px — display */
--text-4xl: 2.25rem;   /* 36px — hero */
```

---

## Espaciado y layout

El tablero ocupa idealmente **60-70% del viewport** en la vista de partida.

```
Vista de partida (1280×720):
┌──────────────────────────────────────┐
│  Header (48px)                       │
├─────────────────┬────────────────────┤
│                 │                    │
│   Tablero       │   Panel lateral    │
│   (60% ancho)   │   (40% ancho)      │
│                 │   - Jugadores      │
│                 │   - Timer          │
│                 │   - Historial      │
│                 │   - Controles      │
│                 │                    │
└─────────────────┴────────────────────┘
```

Breakpoints definidos:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px (mínimo soportado)
- `2xl`: 1536px
- `4xl`: 2560px (ultrawide)

---

## Componentes del design system

### Botones

```
Variantes: primary | secondary | ghost | danger | success
Tamaños: sm | md | lg
Estados: default | hover | active | disabled | loading
```

Reglas:
- `primary` solo para la acción principal de cada vista. Máximo 1 por pantalla.
- `ghost` para acciones secundarias en el tablero (rendirse, proponer tablas).
- Nunca usar texto genérico ("Click aquí"). Siempre verbo + objeto ("Iniciar partida").

### Modales

- Máximo un modal activo simultáneamente.
- Siempre con backdrop con `blur(4px)`.
- Escape key cierra el modal.
- Focus trap implementado.

### Notificaciones / Toasts

- Posición: esquina inferior derecha.
- Duración: 3s informativo, 5s error, manual para crítico.
- Máximo 3 activos simultáneamente.

### Indicador de turno

El indicador de turno es el elemento más dinámico durante la partida. Debe ser inequívoco e inmediato. Usa color de jugador + animación sutil de pulso.

---

## Animaciones

```css
/* Duraciones estándar */
--duration-instant: 50ms;
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;

/* Easing estándar */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);  /* Entradas */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);   /* Salidas */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Rebotes */
```

Reglas de animación:
- Movimiento en el tablero: `150ms ease-out` — rápido, preciso.
- Transiciones de página: `250ms ease-out` — fluido pero no lento.
- Victoria: secuencia elaborada hasta `600ms` — es el momento culminante.
- Respetar `prefers-reduced-motion`.

---

## Estados de celda del tablero

Cada celda del subtablero tiene los siguientes estados visuales:

| Estado | Visual |
|--------|--------|
| Vacía, subtablero activo | Hover highlight en color del turno actual |
| Vacía, subtablero inactivo | Muted, no hover |
| Ocupada por X | Símbolo rojo, sin hover |
| Ocupada por O | Símbolo azul, sin hover |
| Victoria X (subtablero) | Overlay rojo translúcido + X grande |
| Victoria O (subtablero) | Overlay azul translúcido + O grande |
| Empate (subtablero) | Overlay gris translúcido |

---

## Accesibilidad mínima

- Contraste mínimo WCAG AA (4.5:1 para texto, 3:1 para UI).
- Todos los botones con `aria-label` descriptivo.
- Tablero navegable via teclado (arrow keys + Enter).
- Focus rings visibles y consistentes.
- No depender solo del color para transmitir estado.
