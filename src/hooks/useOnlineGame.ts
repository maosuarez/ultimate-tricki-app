import { useEffect } from 'react';
import { wsService } from '@/services/wsService';
import { supabaseService } from '@/services/supabase.service';
import { useNetworkStore } from '@/stores/network.store';
import { useGameStore } from '@/stores/gameStore';
import { playMatchFound } from '@/services/audioService';
import type { ScreenName } from '@/types/game';

function nowTime(): string {
  return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export function useOnlineGame(navigate: (s: ScreenName) => void): {
  createRoom: (playerName: string, isPublic?: boolean, hostElo?: number, timeControl?: string) => string;
  joinRoom: (code: string, playerName: string) => void;
  sendReady: (ready: boolean) => void;
  sendStartGame: () => void;
  sendMove: (sb: number, cell: number) => void;
  sendChat: (text: string) => void;
  cleanupRoom: () => void;
  reset: () => void;
} {
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
            const updatedPlayers = [...players, joiner];
            wsService.send({ type: 'room_state', players: updatedPlayers });
            // Auto-start for public rooms when 2 players are present
            const { isPublic, roomCode } = useNetworkStore.getState();
            if (isPublic && updatedPlayers.length >= 2 && roomCode) {
              void supabaseService.rooms.updateStatus(roomCode, 'playing').catch(() => {});
              wsService.send({ type: 'game_started' });
            }
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
          playMatchFound();
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

  const createRoom = (playerName: string, isPublic = false, hostElo = 0, timeControl = 'blitz'): string => {
    const code = useNetworkStore.getState().createRoom(playerName, isPublic, hostElo, timeControl);
    void (async () => {
      try {
        await wsService.connect(playerName);
        wsService.joinGroup(code);
        wsService.send({ type: 'host_joined', name: playerName, side: 'X' });
        if (isPublic) {
          await supabaseService.rooms.create({ code, hostName: playerName, hostElo, timeControl, isPublic: true });
        }
      } catch (err) {
        console.error('[WS] createRoom failed:', err);
        useNetworkStore.getState().setStatus('error');
      }
    })();
    return code;
  };

  const joinRoom = (code: string, playerName: string): void => {
    useNetworkStore.getState().joinRoom(code, playerName);
    void (async () => {
      try {
        await wsService.connect(playerName);
        wsService.joinGroup(code);
        wsService.send({ type: 'player_joined', name: playerName });
      } catch (err) {
        console.error('[WS] joinRoom failed:', err);
        useNetworkStore.getState().setStatus('error');
      }
    })();
  };

  const sendReady = (ready: boolean): void => {
    const { myName } = useNetworkStore.getState();
    useNetworkStore.getState().sendReady(ready);
    wsService.send({ type: 'ready', name: myName, ready });
  };

  const sendStartGame = (): void => {
    wsService.send({ type: 'game_started' });
  };

  const sendMove = (sb: number, cell: number): void => {
    wsService.send({ type: 'move', sb, cell });
  };

  const sendChat = (text: string): void => {
    const { myName } = useNetworkStore.getState();
    const t = nowTime();
    useNetworkStore.getState().sendChat(text);
    wsService.send({ type: 'chat', from: myName, text, t });
  };

  const cleanupRoom = (): void => {
    const { roomCode, isHost } = useNetworkStore.getState();
    if (isHost && roomCode) {
      void supabaseService.rooms.delete(roomCode).catch((err) => {
        console.warn('[Supabase] cleanupRoom failed:', err);
      });
    }
  };

  const reset = (): void => {
    wsService.disconnect();
    useNetworkStore.getState().reset();
  };

  return { createRoom, joinRoom, sendReady, sendStartGame, sendMove, sendChat, cleanupRoom, reset };
}
