import { useEffect } from 'react';
import { wsService } from '@/services/wsService';
import { useNetworkStore } from '@/stores/network.store';
import { useGameStore } from '@/stores/gameStore';
import type { ScreenName } from '@/types/game';

function nowTime(): string {
  return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function useOnlineGame(navigate: (s: ScreenName) => void): void {
  const setStatus = useNetworkStore((s) => s.setStatus);
  const setPlayers = useNetworkStore((s) => s.setPlayers);
  const addPlayer = useNetworkStore((s) => s.addPlayer);
  const setPlayerReady = useNetworkStore((s) => s.setPlayerReady);
  const setPhase = useNetworkStore((s) => s.setPhase);
  const addChatItem = useNetworkStore((s) => s.addChatItem);
  const setPendingRemoteMove = useNetworkStore((s) => s.setPendingRemoteMove);
  const startOnlineGame = useGameStore((s) => s.startOnlineGame);

  useEffect(() => {
    const unsubMsg = wsService.onMessage((msg) => {
      const { isHost, myName, players, mySide } = useNetworkStore.getState();

      switch (msg.type) {
        case 'host_joined':
          // Received by joiner when host was already in the group
          addPlayer({ name: msg.name, side: msg.side, isHost: true, ready: false, elo: 0, ping: 0 });
          addChatItem('sistema', `${msg.name} creó la sala`, nowTime(), 'sys');
          break;

        case 'player_joined': {
          // Received by host — add joiner and broadcast full room state
          const joiner = { name: msg.name, side: 'O' as const, isHost: false, ready: false, elo: 0, ping: 0 };
          addPlayer(joiner);
          addChatItem('sistema', `${msg.name} se unió`, nowTime(), 'sys');
          if (isHost) {
            // Broadcast current room state so joiner gets the full picture
            const updatedPlayers = [...players, joiner];
            wsService.send({ type: 'room_state', players: updatedPlayers });
          }
          break;
        }

        case 'room_state':
          setPlayers(msg.players);
          addChatItem('sistema', 'Sala sincronizada', nowTime(), 'sys');
          break;

        case 'ready':
          setPlayerReady(msg.name, msg.ready);
          break;

        case 'game_started': {
          const opponent = players.find(p => p.name !== myName);
          const nameX = mySide === 'X' ? myName : (opponent?.name ?? 'Oponente');
          const nameO = mySide === 'O' ? myName : (opponent?.name ?? 'Oponente');
          setPhase('playing');
          startOnlineGame(nameX, nameO);
          navigate('game');
          break;
        }

        case 'move':
          setPendingRemoteMove({ sb: msg.sb, cell: msg.cell });
          break;

        case 'chat':
          addChatItem(msg.from, msg.text, msg.t);
          break;
      }
    });

    const unsubStatus = wsService.onStatus((s) => {
      if (s === 'connected') setStatus('connected');
      else if (s === 'disconnected') setStatus('disconnected');
      else setStatus('error');
    });

    return () => {
      unsubMsg();
      unsubStatus();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
