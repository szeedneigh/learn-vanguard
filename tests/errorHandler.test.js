/**
 * Error Handler Tests
 *
 * Tests for standardized error handling utilities.
 */

import {
  ApiError,
  extractErrorMessage,
  createSuccessResponse,
  createErrorResponse,
  withErrorHandling,
  withRetry,
  handleFormError,
  isUnauthorized,
  isNotFound,
  isBadRequest,
  isServerError,
} from '../src/utils/errorHandler';

import { HTTP_STATUS, ERROR_MESSAGES } from '../src/constants';

describe('Error Handler', () => {
  // ==========================================
  // ApiError Class
  // ==========================================
  describe('ApiError', () => {
    it('should create error with message', () => {
      const error = new ApiError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ApiError');
    });

    it('should include status code', () => {
      const error = new ApiError('Not found', 404);
      expect(error.statusCode).toBe(404);
    });

    it('should include original error', () => {
      const original = new Error('Original');
      const error = new ApiError('Wrapped', 500, original);
      expect(error.originalError).toBe(original);
    });

    it('should convert to JSON', () => {
      const error = new ApiError('Test', 400);
      const json = error.toJSON();
      expect(json.message).toBe('Test');
      expect(json.statusCode).toBe(400);
      expect(json.timestamp).toBeDefined();
    });
  });

  // ==========================================
  // extractErrorMessage
  // ==========================================
  describe('extractErrorMessage', () => {
    it('should extract message from response.data.error.message', () => {
      const error = {
        response: {
          data: {
            error: { message: 'Custom error message' }
          }
        }
      };
      expect(extractErrorMessage(error)).toBe('Custom error message');
    });

    it('should extract message from response.data.message', () => {
      const error = {
        response: {
          data: { message: 'API error' }
        }
      };
      expect(extractErrorMessage(error)).toBe('API error');
    });

    it('should extract string error from response.data.error', () => {
      const error = {
        response: {
          data: { error: 'String error' }
        }
      };
      expect(extractErrorMessage(error)).toBe('String error');
    });

    it('should join array of errors', () => {
      const error = {
        response: {
          data: {
            errors: [
              { message: 'Error 1' },
              { message: 'Error 2' }
            ]
          }
        }
      };
      expect(extractErrorMessage(error)).toBe('Error 1, Error 2');
    });

    it('should return timeout message for ECONNABORTED', () => {
      const error = { code: 'ECONNABORTED' };
      expect(extractErrorMessage(error)).toBe(ERROR_MESSAGES.TIMEOUT);
    });

    it('should return network error for no response', () => {
      const error = { message: 'Network error' };
      expect(extractErrorMessage(error)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('should map status codes to messages', () => {
      expect(extractErrorMessage({
        response: { status: HTTP_STATUS.UNAUTHORIZED }
      })).toBe(ERROR_MESSAGES.UNAUTHORIZED);

      expect(extractErrorMessage({
        response: { status: HTTP_STATUS.NOT_FOUND }
      })).toBe(ERROR_MESSAGES.NOT_FOUND);

      expect(extractErrorMessage({
        response: { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      })).toBe(ERROR_MESSAGES.SERVER_ERROR);
    });
  });

  // ==========================================
  // createSuccessResponse
  // ==========================================
  describe('createSuccessResponse', () => {
    it('should create success response', () => {
      const response = createSuccessResponse({ id: 1 });
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ id: 1 });
      expect(response.error).toBeNull();
      expect(response.statusCode).toBe(HTTP_STATUS.OK);
    });

    it('should include metadata', () => {
      const response = createSuccessResponse({ id: 1 }, { page: 1, total: 10 });
      expect(response.metadata).toEqual({ page: 1, total: 10 });
    });
  });

  // ==========================================
  // createErrorResponse
  // ==========================================
  describe('createErrorResponse', () => {
    it('should create error response', () => {
      const response = createErrorResponse('Failed', 400);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed');
      expect(response.statusCode).toBe(400);
      expect(response.data).toBeNull();
    });

    it('should include fallback data', () => {
      const response = createErrorResponse('Failed', 500, []);
      expect(response.data).toEqual([]);
    });
  });

  // ==========================================
  // withErrorHandling
  // ==========================================
  describe('withErrorHandling', () => {
    it('should return success response for successful call', async () => {
      const apiCall = jest.fn().mockResolvedValue({ data: { id: 1 } });
      const result = await withErrorHandling(apiCall);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should return error response for failed call', async () => {
      const apiCall = jest.fn().mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Server error' }
        }
      });

      const result = await withErrorHandling(apiCall, { silent: true });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
      expect(result.statusCode).toBe(500);
    });

    it('should include fallback data on error', async () => {
      const apiCall = jest.fn().mockRejectedValue(new Error());
      const result = await withErrorHandling(apiCall, {
        silent: true,
        fallbackData: []
      });

      expect(result.data).toEqual([]);
    });

    it('should dispatch auth event for 401', async () => {
      const dispatchEvent = jest.spyOn(window, 'dispatchEvent');
      const apiCall = jest.fn().mockRejectedValue({
        response: { status: 401 }
      });

      await withErrorHandling(apiCall, { silent: true });

      expect(dispatchEvent).toHaveBeenCalled();
    });
  });

  // ==========================================
  // withRetry
  // ==========================================
  describe('withRetry', () => {
    it('should return result on success', async () => {
      const apiCall = jest.fn().mockResolvedValue('success');
      const result = await withRetry(apiCall);
      expect(result).toBe('success');
      expect(apiCall).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const apiCall = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(apiCall, {
        maxRetries: 3,
        baseDelay: 1
      });

      expect(result).toBe('success');
      expect(apiCall).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const apiCall = jest.fn().mockRejectedValue(new Error('Fail'));

      await expect(
        withRetry(apiCall, { maxRetries: 2, baseDelay: 1 })
      ).rejects.toThrow('Fail');

      expect(apiCall).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry when shouldRetry returns false', async () => {
      const apiCall = jest.fn().mockRejectedValue({
        response: { status: 400 }
      });

      await expect(
        withRetry(apiCall, {
          maxRetries: 3,
          baseDelay: 1,
          shouldRetry: (error) => error.response?.status >= 500
        })
      ).rejects.toBeDefined();

      expect(apiCall).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // handleFormError
  // ==========================================
  describe('handleFormError', () => {
    it('should extract field-specific errors', () => {
      const error = {
        response: {
          data: {
            errors: [
              { field: 'email', message: 'Invalid email' },
              { field: 'password', message: 'Too short' }
            ]
          }
        }
      };

      const result = handleFormError(error);

      expect(result.fieldErrors.email).toBe('Invalid email');
      expect(result.fieldErrors.password).toBe('Too short');
    });

    it('should set general error for non-field errors', () => {
      const error = {
        response: {
          data: {
            errors: [{ message: 'General error' }]
          }
        }
      };

      const result = handleFormError(error);

      expect(result.generalError).toBe('General error');
      expect(Object.keys(result.fieldErrors)).toHaveLength(0);
    });

    it('should extract general error from standard format', () => {
      const error = {
        response: {
          data: { message: 'Something went wrong' }
        }
      };

      const result = handleFormError(error);

      expect(result.generalError).toBe('Something went wrong');
    });
  });

  // ==========================================
  // Status Check Functions
  // ==========================================
  describe('status checks', () => {
    it('isUnauthorized should detect 401', () => {
      expect(isUnauthorized({ response: { status: 401 } })).toBe(true);
      expect(isUnauthorized({ response: { status: 403 } })).toBe(false);
    });

    it('isNotFound should detect 404', () => {
      expect(isNotFound({ response: { status: 404 } })).toBe(true);
      expect(isNotFound({ response: { status: 200 } })).toBe(false);
    });

    it('isBadRequest should detect 400', () => {
      expect(isBadRequest({ response: { status: 400 } })).toBe(true);
      expect(isBadRequest({ response: { status: 422 } })).toBe(false);
    });

    it('isServerError should detect 5xx', () => {
      expect(isServerError({ response: { status: 500 } })).toBe(true);
      expect(isServerError({ response: { status: 502 } })).toBe(true);
      expect(isServerError({ response: { status: 400 } })).toBe(false);
    });
  });
});
