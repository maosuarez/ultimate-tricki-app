# Visión del producto

## Propósito

Tricki Avanzado nace de una premisa simple: Ultimate Tic Tac Toe es un juego estratégicamente rico que no tiene una implementación de referencia en escritorio. Queremos que sea ese referente.

No es un juego casual. Es una herramienta para jugadores que quieren mejorar, analizar partidas y competir. El estándar de calidad es Chess.com en su dominio: limpio, rápido, sin distracciones, con todo lo necesario.

## Usuario objetivo

**Jugador principal:** 17–35 años, familiarizado con juegos de estrategia digitales, cómodo con interfaces densas de información cuando están bien organizadas. Puede ser un jugador casual que descubre el juego o un competidor que quiere analizar aperturas y mejorar.

**Jugador secundario:** Cualquier persona con interés en juegos de mesa y lógica.

## Principios del producto

1. **El tablero no espera.** El tiempo entre decidir un movimiento y verlo reflejado es imperceptible.
2. **Nada sobra.** Cada elemento en pantalla tiene un propósito. Si no lo tiene, no está.
3. **Offline primero.** La partida local es completamente funcional sin internet. Siempre.
4. **El jugador controla.** Configuración accesible, sin opciones enterradas. La experiencia por defecto es buena; la personalizada es mejor.

## Objetivos a largo plazo

- **Fase 1 (actual):** Partida local perfecta + IA que reta. Base sólida para todo lo demás.
- **Fase 2:** Motor de IA avanzado (MCTS + ML), análisis de partidas, sugerencias de mejora.
- **Fase 3:** Multiplayer online con sistema de salas, ELO, torneos.
- **Fase 4:** Sistema de cuentas, ranking global, comunidad.

## Métricas de éxito

| Métrica | Objetivo |
|---------|---------|
| Tiempo de arranque (cold start) | < 2 segundos |
| Latencia de input durante partida | < 16ms (60fps) |
| Crash rate | < 0.1% de sesiones |
| Retención (sesión 2+) | > 60% |
| Rating en tiendas | ≥ 4.5/5 |
