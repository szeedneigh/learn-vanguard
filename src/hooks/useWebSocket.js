import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import websocketService from '@/services/websocketService';

/**
 * Custom hook for WebSocket integration
 * Provides real-time updates across the application
 */
export const useWebSocket = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState(websocketService.getStatus());

  useEffect(() => {
    if (!user?.token) return;

    // Connect to WebSocket when component mounts
    websocketService.connect(user.token);

    // Subscribe to connection status changes
    const unsubscribe = websocketService.subscribe('connection', (data) => {
      setStatus({
        isConnected: websocketService.isConnected,
        connectionStatus: data.status
      });
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [user]);

  return {
    isConnected: status.isConnected,
    connectionStatus: status.connectionStatus,
    subscribe: websocketService.subscribe.bind(websocketService)
  };
};

// Example usage:
/*
const MyComponent = () => {
  const { isConnected, connectionStatus, subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe('task_update', (data) => {
      // Handle task update
    });

    return () => unsubscribe();
  }, [subscribe]);

  return (
    <div>
      Connection status: {connectionStatus}
    </div>
  );
};
*/

export default useWebSocket; 