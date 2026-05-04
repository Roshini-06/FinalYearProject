import { useEffect, useRef, useState } from 'react';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 3000;

export const useWebSocket = (userEmail) => {
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const socketRef = useRef(null);
  const isMountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;

    isMountedRef.current = true;
    retryCountRef.current = 0;

    const connect = () => {
      if (!isMountedRef.current) return;

      const url = `${SOCKET_URL}/${userEmail}`;
      console.log(`🔌 Connecting to WebSocket: ${url} (attempt ${retryCountRef.current + 1})`);

      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) { ws.close(); return; }
        retryCountRef.current = 0; // reset on successful connect
        console.log('✅ WebSocket Connected');
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          console.log('📩 WebSocket Message Received:', data);
          setLastMessage(data);
          setMessages((prev) => [...prev, data]);
        } catch (parseErr) {
          console.warn('⚠️ Could not parse WebSocket message:', event.data);
        }
      };

      ws.onerror = (err) => {
        console.error('⚠️ WebSocket Error:', err);
        // Let onclose handle reconnect — don't double-close
      };

      ws.onclose = (event) => {
        if (!isMountedRef.current) return;

        retryCountRef.current += 1;
        if (retryCountRef.current > MAX_RETRIES) {
          console.warn(`🛑 WebSocket: max retries (${MAX_RETRIES}) reached. Giving up.`);
          return;
        }

        const delay = BASE_DELAY_MS * retryCountRef.current; // exponential-ish backoff
        console.log(`❌ WebSocket Disconnected (code=${event.code}). Reconnecting in ${delay / 1000}s... (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
        reconnectTimerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isMountedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userEmail]);

  return { messages, lastMessage };
};
