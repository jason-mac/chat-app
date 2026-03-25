import { useEffect, useRef } from 'react';
import { WS_URL } from '../config';

export const useWebSocket = (
  userId: string,
  onMessage: (msg: string) => void
) => {
  const ws = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    ws.current = new WebSocket(`${WS_URL}/ws/${userId}?token=${token}`);
    ws.current.onmessage = (event) => {
      onMessageRef.current(event.data);
    };
    ws.current.onopen = () => console.log('connected');
    ws.current.onclose = () => console.log('disconnected');
    return () => {
      ws.current?.close();
    };
  }, [userId]);

  const sendMessage = (msg: string) => {
    ws.current?.send(msg);
  };

  return { sendMessage };
};
