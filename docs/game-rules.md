# Reglas del juego

Ver `.claude/game-domain.md` para el modelo de dominio técnico completo (tipos, invariantes, algoritmos).

## Resumen para jugadores

**Ultimate Tic Tac Toe** es Tic Tac Toe dentro de Tic Tac Toe.

El tablero principal es una cuadrícula 3×3 de 9 subtableros. Cada subtablero es a su vez un Tic Tac Toe 3×3.

### Cómo ganar

Gana quien complete una línea de 3 subtableros en el tablero principal (horizontal, vertical o diagonal), igual que en Tic Tac Toe clásico.

Para ganar un subtablero, completa una línea de 3 en ese mini-tablero.

### La regla clave

**Tu movimiento determina dónde juega el oponente.**

Si juegas en la celda posición `(fila, columna)` dentro de un subtablero, tu oponente debe jugar en el subtablero en la posición `(fila, columna)` del tablero principal.

**Ejemplo:** Juegas en la celda central (fila 1, col 1) de cualquier subtablero → tu oponente debe jugar en el subtablero central del tablero principal.

### Excepción

Si el subtablero destino ya fue ganado o está en empate (completo), el oponente puede jugar en **cualquier subtablero disponible**.

### Empate

Si todos los subtableros están completos y ningún jugador tiene 3 en línea en el tablero principal, la partida termina en empate.
