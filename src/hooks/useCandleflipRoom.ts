import { useState, useEffect, useRef, useCallback } from 'react';
import { CandleflipGameState, CandleflipRoomMessage, GameStatus, WinnerType } from '@/types/candleflip';

export function useCandleflipRoom(wsUrl: string, roomId: string) {
  const [gameState, setGameState] = useState<CandleflipGameState>({
    roomId,
    gameId: '',
    status: 'waiting',
    serverSeedHash: '',
    startingPrice: 1.0,
    currentPrice: 1.0,
    priceHistory: [1.0],
    countdown: 0,
    tick: 0,
    totalTicks: 40,
  });

  const [countdownMessage, setCountdownMessage] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isFinishedRef = useRef<boolean>(false); // Track if game is finished (prevents stale closure)
  const isMountedRef = useRef<boolean>(true); // Track if component is mounted

  const connect = useCallback(() => {
    // Don't connect if component is unmounted
    if (!isMountedRef.current) {
      return;
    }

    if (wsRef.current) {
      const state = wsRef.current.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        console.log(`⚠️ Room ${roomId} already connected/connecting`);
        return;
      }
    }

    const fullUrl = `${wsUrl}?roomId=${roomId}`;
    console.log(`🔌 Connecting to Candleflip room ${roomId}:`, fullUrl);

    const ws = new WebSocket(fullUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`✅ Connected to Candleflip room ${roomId}`);
      setGameState(prev => ({ ...prev, status: 'waiting' }));
    };

    ws.onmessage = (event) => {
      try {
        const message: CandleflipRoomMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'game_start':
            console.log(`🎮 Room ${roomId} - Game starting:`, message.data.gameId);
            isFinishedRef.current = false; // Reset finished flag for new game
            setGameState(prev => ({
              ...prev,
              gameId: message.data.gameId || '',
              serverSeedHash: message.data.serverSeedHash || '',
              startingPrice: 1.0,
              currentPrice: 1.0,
              priceHistory: [1.0],
              tick: 0,
              status: 'waiting',
              winner: undefined,
              finalPrice: undefined,
              serverSeed: undefined,
            }));
            break;

          case 'countdown':
            const countdownData = message.data;
            const countdownNum = countdownData.countdown || 0;
            const textMessage = (countdownData as any).message;

            setCountdownMessage(textMessage || '');
            setGameState(prev => ({
              ...prev,
              status: 'countdown',
              countdown: textMessage ? 0 : countdownNum,
            }));
            break;

          case 'price_update':
            setGameState(prev => ({
              ...prev,
              status: 'running',
              tick: message.data.tick || 0,
              currentPrice: message.data.price || prev.currentPrice,
              priceHistory: [...prev.priceHistory, message.data.price || prev.currentPrice],
            }));
            break;

          case 'game_end':
            console.log(`🏁 Room ${roomId} - Game ended. Winner:`, message.data.winner);
            isFinishedRef.current = true; // Set ref immediately to prevent reconnection
            setGameState(prev => ({
              ...prev,
              status: 'finished',
              finalPrice: message.data.finalPrice,
              winner: message.data.winner as WinnerType,
              serverSeed: message.data.serverSeed,
              priceHistory: message.data.priceHistory || prev.priceHistory,
            }));
            break;
        }
      } catch (error) {
        console.error(`❌ Room ${roomId} - Error parsing message:`, error);
      }
    };

    ws.onerror = (error) => {
      console.error(`❌ Room ${roomId} WebSocket error:`, error);
      setGameState(prev => ({ ...prev, status: 'waiting' }));
    };

    ws.onclose = (event) => {
      console.log(`🔌 Room ${roomId} WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
      wsRef.current = null;

      // Don't reconnect if component is unmounted
      if (!isMountedRef.current) {
        console.log(`✅ Room ${roomId} component unmounted, not reconnecting`);
        return;
      }

      // Don't reconnect if game is finished (using ref to avoid stale closure)
      if (isFinishedRef.current) {
        console.log(`✅ Room ${roomId} game finished, not reconnecting`);
        return;
      }

      // Only reconnect if it wasn't a normal closure AND game not finished
      if (event.code !== 1000) {
        console.log(`🔄 Room ${roomId} attempting reconnect...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      } else {
        console.log(`✅ Room ${roomId} closed normally`);
      }
    };
  }, [wsUrl, roomId]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      // Mark as unmounted to prevent reconnections
      isMountedRef.current = false;

      // Cleanup
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsUrl, roomId]); // Only reconnect when URL or roomId changes, NOT when connect callback changes

  return { ...gameState, countdownMessage };
}
