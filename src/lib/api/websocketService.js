import { environment } from '@/config/environment';

/**
 * WebSocket Service for Real-time Features
 * Handles WebSocket connections and real-time updates
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.messageQueue = [];
    this.heartbeatInterval = null;
    this.lastPong = Date.now();
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - Authentication token
   */
  connect(token) {
    if (this.ws && this.isConnected) {
      console.warn('WebSocket already connected');
      return;
    }

    try {
      // Use the production WebSocket URL
      const wsUrl = environment.WS_URL || 'wss://learn-vanguard-server.onrender.com/ws';
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Send authentication
        this.authenticate(token);
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Process queued messages
        this.processMessageQueue();
        
        // Notify listeners
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        
        // Notify listeners
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Attempt reconnection if not manually closed
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(token);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.emit('error', error);
    }
  }

  /**
   * Authenticate with the WebSocket server
   * @param {string} token - JWT token
   */
  authenticate(token) {
    if (!token) {
      console.error('No authentication token provided');
      return;
    }

    this.send({
      type: 'auth',
      token: token
    });
  }

  /**
   * Handle incoming WebSocket messages
   * @param {Object} data - Message data
   */
  handleMessage(data) {
    this.lastPong = Date.now();

    switch (data.type) {
      case 'auth_success':
        console.log('WebSocket authentication successful');
        this.emit('authenticated', data);
        break;
        
      case 'auth_error':
        console.error('WebSocket authentication failed:', data.message);
        this.emit('auth_error', data);
        break;
        
      case 'notification':
        console.log('Received notification:', data);
        this.handleNotification(data);
        break;
        
      case 'task_update':
        console.log('Task updated:', data);
        this.emit('task_update', data);
        break;
        
      case 'event_update':
        console.log('Event updated:', data);
        this.emit('event_update', data);
        break;
        
      case 'announcement':
        console.log('New announcement:', data);
        this.emit('announcement', data);
        break;
        
      case 'user_activity':
        this.emit('user_activity', data);
        break;
        
      case 'ping':
        this.send({ type: 'pong' });
        break;
        
      case 'pong':
        this.lastPong = Date.now();
        break;
        
      default:
        console.log('Unknown message type:', data.type, data);
        this.emit('message', data);
    }
  }

  /**
   * Handle notification messages
   * @param {Object} notification - Notification data
   */
  handleNotification(notification) {
    // Send acknowledgment
    if (notification.id) {
      this.send({
        type: 'ack',
        id: notification.id
      });
    }

    // Emit to listeners
    this.emit('notification', notification);
    
    // Emit specific notification types
    if (notification.notificationType) {
      this.emit(`notification_${notification.notificationType.toLowerCase()}`, notification);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
        // Check if we received a pong recently
        const timeSinceLastPong = Date.now() - this.lastPong;
        if (timeSinceLastPong > 60000) { // 1 minute timeout
          console.warn('WebSocket heartbeat timeout, closing connection');
          this.ws.close();
          return;
        }
        
        this.send({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  /**
   * Stop heartbeat interval
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send message to WebSocket server
   * @param {Object} message - Message to send
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Schedule reconnection attempt
   * @param {string} token - Authentication token
   */
  scheduleReconnect(token) {
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(token);
      }
    }, delay);
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.messageQueue = [];
    }
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length
    };
  }
}

// Create and export singleton instance
const websocketService = new WebSocketService();
export default websocketService; 