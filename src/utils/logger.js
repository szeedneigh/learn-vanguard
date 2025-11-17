/**
 * Logger Utility
 * Centralized logging system with environment-aware output
 *
 * Features:
 * - Environment-aware (dev vs production)
 * - Multiple log levels (log, info, warn, error, debug)
 * - Structured logging support
 * - Performance monitoring
 * - Conditional output based on environment
 *
 * Usage:
 *   import logger from '@/utils/logger';
 *   logger.log('User logged in', { userId: 123 });
 *   logger.error('Failed to fetch data', error);
 *   logger.debug('Component rendered', { props });
 */

import { environment } from '@/config/environment';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  LOG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};

// Current log level (can be configured)
const CURRENT_LOG_LEVEL = environment.IS_DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN;

// Enable/disable logging by type
const LOGGING_CONFIG = {
  debug: environment.IS_DEV,
  log: environment.IS_DEV,
  info: true, // Always enabled for important info
  warn: true, // Always enabled for warnings
  error: true, // Always enabled for errors
};

/**
 * Format log message with timestamp and optional data
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Optional additional data
 * @returns {Array} Formatted log arguments
 */
const formatLog = (level, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data !== undefined) {
    return [prefix, message, data];
  }
  return [prefix, message];
};

/**
 * Check if logging is enabled for a given level
 * @param {string} level - Log level
 * @returns {boolean}
 */
const isEnabled = (level) => {
  const levelValue = LOG_LEVELS[level.toUpperCase()];
  return LOGGING_CONFIG[level] && levelValue >= CURRENT_LOG_LEVEL;
};

/**
 * Logger class with various logging methods
 */
class Logger {
  /**
   * Debug logging (only in development)
   * Use for detailed debugging information
   * @param {string} message - Log message
   * @param {any} data - Optional additional data
   */
  debug(message, data) {
    if (isEnabled('debug')) {
      const args = formatLog('debug', message, data);
      console.debug(...args);
    }
  }

  /**
   * General logging (only in development)
   * Use for general informational messages
   * @param {string} message - Log message
   * @param {any} data - Optional additional data
   */
  log(message, data) {
    if (isEnabled('log')) {
      const args = formatLog('log', message, data);
      console.log(...args);
    }
  }

  /**
   * Info logging (enabled in all environments)
   * Use for important informational messages
   * @param {string} message - Log message
   * @param {any} data - Optional additional data
   */
  info(message, data) {
    if (isEnabled('info')) {
      const args = formatLog('info', message, data);
      console.info(...args);
    }
  }

  /**
   * Warning logging (enabled in all environments)
   * Use for warning messages that aren't critical errors
   * @param {string} message - Log message
   * @param {any} data - Optional additional data
   */
  warn(message, data) {
    if (isEnabled('warn')) {
      const args = formatLog('warn', message, data);
      console.warn(...args);
    }
  }

  /**
   * Error logging (enabled in all environments)
   * Use for error messages and exceptions
   * @param {string} message - Log message
   * @param {Error|any} error - Error object or additional data
   */
  error(message, error) {
    if (isEnabled('error')) {
      const args = formatLog('error', message, error);
      console.error(...args);

      // In production, you might want to send errors to a logging service
      if (environment.IS_PROD && error instanceof Error) {
        // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
        // errorTrackingService.captureException(error, { message });
      }
    }
  }

  /**
   * Group logs together
   * @param {string} label - Group label
   */
  group(label) {
    if (environment.IS_DEV) {
      console.group(label);
    }
  }

  /**
   * End log group
   */
  groupEnd() {
    if (environment.IS_DEV) {
      console.groupEnd();
    }
  }

  /**
   * Log a table (development only)
   * @param {any} data - Data to display in table format
   */
  table(data) {
    if (environment.IS_DEV && console.table) {
      console.table(data);
    }
  }

  /**
   * Start a performance timer
   * @param {string} label - Timer label
   */
  time(label) {
    if (environment.IS_DEV) {
      console.time(label);
    }
  }

  /**
   * End a performance timer
   * @param {string} label - Timer label
   */
  timeEnd(label) {
    if (environment.IS_DEV) {
      console.timeEnd(label);
    }
  }

  /**
   * Assert a condition and log if false
   * @param {boolean} condition - Condition to assert
   * @param {string} message - Message to display if condition is false
   */
  assert(condition, message) {
    if (environment.IS_DEV) {
      console.assert(condition, message);
    }
  }

  /**
   * Log API request details (development only)
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {any} data - Request data
   */
  api(method, url, data) {
    if (environment.IS_DEV) {
      this.group(`API ${method} ${url}`);
      if (data) {
        this.log('Request data:', data);
      }
      this.groupEnd();
    }
  }

  /**
   * Log component lifecycle (development only)
   * @param {string} componentName - Component name
   * @param {string} lifecycle - Lifecycle event (mount, update, unmount)
   * @param {any} data - Optional data
   */
  component(componentName, lifecycle, data) {
    if (environment.IS_DEV) {
      const message = `[${componentName}] ${lifecycle}`;
      this.debug(message, data);
    }
  }

  /**
   * Log navigation events (development only)
   * @param {string} from - Previous route
   * @param {string} to - New route
   */
  navigation(from, to) {
    if (environment.IS_DEV) {
      this.log(`Navigation: ${from} → ${to}`);
    }
  }

  /**
   * Log authentication events
   * @param {string} event - Auth event (login, logout, etc.)
   * @param {any} data - Optional data (be careful not to log sensitive info!)
   */
  auth(event, data) {
    // Only log auth events in development, and sanitize data
    if (environment.IS_DEV) {
      const sanitizedData = data ? this._sanitizeAuthData(data) : undefined;
      this.info(`Auth: ${event}`, sanitizedData);
    }
  }

  /**
   * Sanitize authentication data to avoid logging sensitive information
   * @private
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  _sanitizeAuthData(data) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'idToken', 'accessToken', 'refreshToken', 'secret'];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

// Create and export singleton instance
const logger = new Logger();

export default logger;

/**
 * Usage Examples:
 *
 * // Basic logging
 * logger.log('User data loaded');
 * logger.info('Application started');
 * logger.warn('API rate limit approaching');
 * logger.error('Failed to save data', error);
 *
 * // Structured logging with data
 * logger.log('User logged in', { userId: 123, email: 'user@example.com' });
 * logger.error('API request failed', { url: '/api/tasks', status: 500 });
 *
 * // Performance monitoring
 * logger.time('data-fetch');
 * // ... perform operation
 * logger.timeEnd('data-fetch');
 *
 * // Grouped logs
 * logger.group('User Profile Update');
 * logger.log('Validating data...');
 * logger.log('Sending to API...');
 * logger.log('Update successful');
 * logger.groupEnd();
 *
 * // API logging
 * logger.api('POST', '/api/tasks', { title: 'New Task' });
 *
 * // Component lifecycle
 * logger.component('TaskList', 'mount', { taskCount: 10 });
 *
 * // Navigation
 * logger.navigation('/tasks', '/tasks/123');
 *
 * // Authentication (automatically sanitizes sensitive data)
 * logger.auth('login', { userId: 123, token: 'secret123' }); // token will be redacted
 */
