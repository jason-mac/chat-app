import { useEffect, useRef } from 'react';
import { WS_URL } from '../config';
import type { WsRequest, WsResponse } from '../types/websocket';

export const useWebSocket = (
  userId: string,
  onMessage: (msg: WsResponse) => void
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
      const parsed = JSON.parse(event.data);
      onMessageRef.current(parsed);
    };
    ws.current.onopen = () => console.log('connected');
    ws.current.onclose = () => console.log('disconnected');
    return () => {
      ws.current?.close();
    };
  }, [userId]);

  const sendMessage = (msg: WsRequest) => {
    ws.current?.send(JSON.stringify(msg));
  };

  return { sendMessage };
};
