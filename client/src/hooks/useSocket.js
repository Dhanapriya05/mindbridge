import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loungeCount, setLoungeCount] = useState(1);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to backend via relative proxy or host
    const socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('lounge_presence', (data) => {
      if (data && typeof data.activeCount === 'number') {
        setLoungeCount(Math.max(1, data.activeCount));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const emitLoungeJoin = useCallback((userMeta) => {
    if (socketRef.current) {
      socketRef.current.emit('join_lounge', userMeta);
    }
  }, []);

  const emitResonancePulse = useCallback((pulseData) => {
    if (socketRef.current) {
      socketRef.current.emit('resonance_pulse', pulseData);
    }
  }, []);

  const emitPeerJoinRoom = useCallback((roomData) => {
    if (socketRef.current) {
      socketRef.current.emit('peer_join_room', roomData);
    }
  }, []);

  const emitPeerMessage = useCallback((messageData) => {
    if (socketRef.current) {
      socketRef.current.emit('peer_message', messageData);
    }
  }, []);

  const emitPanicPurge = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('panic_purge', { roomId });
    }
  }, []);

  const onEvent = useCallback((eventName, handler) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, handler);
      return () => {
        socketRef.current?.off(eventName, handler);
      };
    }
    return () => {};
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    loungeCount,
    emitLoungeJoin,
    emitResonancePulse,
    emitPeerJoinRoom,
    emitPeerMessage,
    emitPanicPurge,
    onEvent
  };
};
