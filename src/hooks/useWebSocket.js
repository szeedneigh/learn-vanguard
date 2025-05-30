import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import websocketService from '@/lib/api/websocketService';

/**
 * Custom hook for WebSocket integration
 * Provides real-time updates across the application
 */
export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const reconnectRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Connect to WebSocket
    websocketService.connect(token);

    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      toast({
        title: 'Connected',
        description: 'Real-time updates enabled',
        duration: 3000,
      });
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const handleAuthenticated = () => {
      setConnectionStatus('authenticated');
      console.log('WebSocket authenticated successfully');
    };

    const handleAuthError = (error) => {
      setConnectionStatus('auth_error');
      console.error('WebSocket authentication error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to authenticate real-time connection',
        variant: 'destructive',
      });
    };

    const handleError = (error) => {
      setConnectionStatus('error');
      console.error('WebSocket error:', error);
    };

    // Real-time update handlers
    const handleTaskUpdate = (data) => {
      console.log('Task updated via WebSocket:', data);
      // Invalidate tasks queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      toast({
        title: 'Task Updated',
        description: `Task "${data.taskName}" has been updated`,
        duration: 4000,
      });
    };

    const handleEventUpdate = (data) => {
      console.log('Event updated via WebSocket:', data);
      // Invalidate events queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      toast({
        title: 'Event Updated',
        description: `Event "${data.title}" has been updated`,
        duration: 4000,
      });
    };

    const handleAnnouncement = (data) => {
      console.log('New announcement via WebSocket:', data);
      // Invalidate subjects/announcements queries
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      
      toast({
        title: 'New Announcement',
        description: data.text || 'A new announcement has been posted',
        duration: 5000,
      });
    };

    const handleNotification = (notification) => {
      console.log('Notification received:', notification);
      setLastMessage(notification);
      
      // Handle different notification types
      switch (notification.type) {
        case 'TASK':
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
          break;
          
        case 'EVENT':
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
          break;
          
        case 'SUBJECT':
          toast({
            title: notification.title,
            description: notification.message,
            duration: 5000,
          });
          break;
          
        default:
          toast({
            title: 'Notification',
            description: notification.message || 'You have a new notification',
            duration: 4000,
          });
      }
    };

    const handleUserActivity = (data) => {
      console.log('User activity update:', data);
      // Could be used for showing online users, etc.
    };

    // Register event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('authenticated', handleAuthenticated);
    websocketService.on('auth_error', handleAuthError);
    websocketService.on('error', handleError);
    websocketService.on('task_update', handleTaskUpdate);
    websocketService.on('event_update', handleEventUpdate);
    websocketService.on('announcement', handleAnnouncement);
    websocketService.on('notification', handleNotification);
    websocketService.on('user_activity', handleUserActivity);

    // Cleanup function
    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('authenticated', handleAuthenticated);
      websocketService.off('auth_error', handleAuthError);
      websocketService.off('error', handleError);
      websocketService.off('task_update', handleTaskUpdate);
      websocketService.off('event_update', handleEventUpdate);
      websocketService.off('announcement', handleAnnouncement);
      websocketService.off('notification', handleNotification);
      websocketService.off('user_activity', handleUserActivity);
      
      websocketService.disconnect();
    };
  }, [user, queryClient]);

  // Manual reconnection function
  const reconnect = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      websocketService.disconnect();
      setTimeout(() => {
        websocketService.connect(token);
      }, 1000);
    }
  };

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    reconnect,
    status: websocketService.getConnectionStatus()
  };
};

export default useWebSocket; 