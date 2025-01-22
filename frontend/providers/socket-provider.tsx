'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { createSocket } from '@/config/socket-config';

interface WebSocketContextProps {
  socket: WebSocket | null;
  closeSocket: () => void;
}

const WebSocketContext = createContext<WebSocketContextProps>({
  socket: null,
  closeSocket: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const newSocket = createSocket(token, (data: string) => {
      console.log('Received WebSocket message:', data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const closeSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  return (
    <WebSocketContext.Provider value={{ socket, closeSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
