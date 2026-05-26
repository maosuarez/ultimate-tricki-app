# Agente de ejemplo: juega siempre en el primer movimiento válido
class Agent:
    def mount(self):
        pass

    def act(self, game_state: dict) -> tuple[int, int]:
        valid = game_state.get('valid_moves', [])
        if valid:
            return tuple(valid[0])
        return (0, 0)
