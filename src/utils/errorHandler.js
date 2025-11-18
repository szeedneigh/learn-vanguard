/**
 * Standardized Error Handling Utilities
 *
 * This module provides consistent error handling patterns across the application.
 * All API calls should use these utilities for uniform error responses.
 */

import { HTTP_STATUS, ERROR_MESSAGES, EVENTS } from '@/constants';
import logger from '@/utils/logger';

/**
 * Standard API response structure
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the operation succeeded
 * @property {any} data - Response data (null on failure)
 * @property {string|null} error - Error message (null on success)
 * @property {number|null} statusCode - HTTP status code
 * @property {Object|null} metadata - Additional metadata (pagination, etc.)
 */

/**
 * Custom API Error class with additional context
 */
export class ApiError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Extract user-friendly error message from API error response
 * @param {Error} error - The error object from API call
 * @returns {string} User-friendly error message
 */
export const extractErrorMessage = (error) => {
  // Check for Axios error response
  if (error.response?.data) {
    const data = error.response.data;

    // Handle various backend error formats
    if (typeof data === 'string') return data;
    if (data.error?.message) return data.error.message;
    if (data.message) return data.message;
    if (data.error && typeof data.error === 'string') return data.error;
    if (Array.isArray(data.errors)) {
      return data.errors.map(e => e.message || e).join(', ');
    }
  }

  // Check for network errors
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.TIMEOUT;
  }

  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Map status codes to messages
  const statusCode = error.response?.status;
  switch (statusCode) {
    case HTTP_STATUS.BAD_REQUEST:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case HTTP_STATUS.UNAUTHORIZED:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.FORBIDDEN:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case HTTP_STATUS.NOT_FOUND:
      return ERROR_MESSAGES.NOT_FOUND;
    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return 'Too many requests. Please wait and try again.';
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
    case HTTP_STATUS.SERVICE_UNAVAILABLE:
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

/**
 * Create a standardized success response
 * @param {any} data - Response data
 * @param {Object} metadata - Optional metadata (pagination, etc.)
 * @returns {ApiResponse}
 */
export const createSuccessResponse = (data, metadata = null) => ({
  success: true,
  data,
  error: null,
  statusCode: HTTP_STATUS.OK,
  metadata,
});

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {any} data - Optional data to include
 * @returns {ApiResponse}
 */
export const createErrorResponse = (message, statusCode = null, data = null) => ({
  success: false,
  data,
  error: message,
  statusCode,
  metadata: null,
});

/**
 * Wrap an async API call with standardized error handling
 * @param {Function} apiCall - Async function to execute
 * @param {Object} options - Options for error handling
 * @param {string} options.context - Context for logging (e.g., 'getUserProfile')
 * @param {any} options.fallbackData - Data to return on failure
 * @param {boolean} options.silent - Don't log errors
 * @returns {Promise<ApiResponse>}
 */
export const withErrorHandling = async (apiCall, options = {}) => {
  const { context = 'API call', fallbackData = null, silent = false } = options;

  try {
    const response = await apiCall();

    // Handle axios response
    const data = response?.data ?? response;
    const metadata = response?.pagination ?? response?.meta ?? null;

    return createSuccessResponse(data, metadata);
  } catch (error) {
    const message = extractErrorMessage(error);
    const statusCode = error.response?.status ?? null;

    if (!silent) {
      logger.error(`${context} failed`, {
        message,
        statusCode,
        error: error.message,
      });
    }

    // Dispatch events for specific error types
    if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
      window.dispatchEvent(new CustomEvent(EVENTS.AUTH_REQUIRED));
    } else if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
      window.dispatchEvent(
        new CustomEvent(EVENTS.API_SERVER_ERROR, {
          detail: { message, context },
        })
      );
    }

    return createErrorResponse(message, statusCode, fallbackData);
  }
};

/**
 * Retry an API call with exponential backoff
 * @param {Function} apiCall - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.baseDelay - Base delay in milliseconds
 * @param {Function} options.shouldRetry - Function to determine if should retry
 * @returns {Promise<any>}
 */
export const withRetry = async (apiCall, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    shouldRetry = (error) => {
      // Retry on network errors or 5xx server errors
      return !error.response || error.response.status >= 500;
    },
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      logger.debug(`Retrying API call in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Handle form submission errors and return field-specific errors
 * @param {Error} error - The error from API
 * @returns {Object} Object with fieldErrors and generalError
 */
export const handleFormError = (error) => {
  const result = {
    fieldErrors: {},
    generalError: null,
  };

  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    // Handle validation errors with field names
    error.response.data.errors.forEach((err) => {
      if (err.field) {
        result.fieldErrors[err.field] = err.message;
      } else {
        result.generalError = err.message;
      }
    });
  } else {
    result.generalError = extractErrorMessage(error);
  }

  return result;
};

/**
 * Check if error is a specific HTTP status
 * @param {Error} error - The error object
 * @param {number} status - HTTP status to check
 * @returns {boolean}
 */
export const isHttpStatus = (error, status) => {
  return error.response?.status === status;
};

/**
 * Common status checks
 */
export const isUnauthorized = (error) => isHttpStatus(error, HTTP_STATUS.UNAUTHORIZED);
export const isNotFound = (error) => isHttpStatus(error, HTTP_STATUS.NOT_FOUND);
export const isBadRequest = (error) => isHttpStatus(error, HTTP_STATUS.BAD_REQUEST);
export const isServerError = (error) => {
  const status = error.response?.status;
  return status && status >= 500;
};

export default {
  ApiError,
  extractErrorMessage,
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  withRetry,
  handleFormError,
  isHttpStatus,
  isUnauthorized,
  isNotFound,
  isBadRequest,
  isServerError,
};
