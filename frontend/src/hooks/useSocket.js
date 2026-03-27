import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    allowedRequests: 0
  });

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to Prompt Firewall backend');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from backend');
    });

    newSocket.on('security_event', (event) => {
      setSecurityEvents(prev => [event, ...prev].slice(0, 100));
    });

    newSocket.on('initial_events', (events) => {
      setSecurityEvents(events);
    });

    newSocket.on('stats_update', (newStats) => {
      setStats(newStats);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = useCallback(async (message) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: socket?.id || 'anonymous'
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: 'Failed to connect to security gateway'
      };
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    securityEvents,
    stats,
    sendMessage
  };
};
