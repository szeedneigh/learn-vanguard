import { API_BASE_URL } from '@/lib/utils';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.subscribers = new Map();
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
  }

  connect(token) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws';
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.connectionStatus = 'connected';
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        // Send authentication
        this.ws.send(JSON.stringify({
          type: 'auth',
          token
        }));

        // Notify subscribers
        this.notifySubscribers('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'task_update':
            case 'announcement':
            case 'event_reminder':
              this.notifySubscribers(data.type, data);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }

          // Send acknowledgment if required
          if (data.id) {
            this.ws.send(JSON.stringify({
              type: 'ack',
              id: data.id
            }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.connectionStatus = 'disconnected';
        this.notifySubscribers('connection', { status: 'disconnected' });
        this.attemptReconnect(token);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus = 'error';
        this.notifySubscribers('connection', { status: 'error', error });
      };

      // Start heartbeat
      this.startHeartbeat();

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.attemptReconnect(token);
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionStatus = 'failed';
      this.notifySubscribers('connection', { 
        status: 'failed',
        message: 'Max reconnection attempts reached'
      });
      return;
    }

    this.connectionStatus = 'reconnecting';
    this.notifySubscribers('connection', { status: 'reconnecting' });

    setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectDelay *= 2; // Exponential backoff
      this.connect(token);
    }, this.reconnectDelay);
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  notifySubscribers(eventType, data) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.isConnected = false;
    this.connectionStatus = 'disconnected';
    this.subscribers.clear();
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      status: this.connectionStatus
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService;

// Example usage:
/*
// In your component:
useEffect(() => {
  const token = localStorage.getItem('token');
  websocketService.connect(token);

  const unsubscribe = websocketService.subscribe('task_update', (data) => {
    console.log('Task updated:', data);
    // Handle task update
  });

  return () => {
    unsubscribe();
  };
}, []);
*/ 