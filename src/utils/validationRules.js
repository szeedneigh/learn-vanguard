/**
 * Validation Rules Utilities
 *
 * Reusable validation functions for forms.
 * Each validator returns null if valid, or error message if invalid.
 */

/**
 * Required field validator
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const required = (message = 'This field is required') => (value) => {
  if (value === null || value === undefined || value === '') {
    return message;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return message;
  }
  if (Array.isArray(value) && value.length === 0) {
    return message;
  }
  return null;
};

/**
 * Email format validator
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const email = (message = 'Invalid email address') => (value) => {
  if (!value) return null; // Optional field, use required() separately

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : message;
};

/**
 * Minimum length validator
 * @param {number} min - Minimum length
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const minLength = (min, message) => (value) => {
  if (!value) return null; // Optional field

  const defaultMessage = `Minimum ${min} characters required`;
  const length = typeof value === 'string' ? value.trim().length : value.length;

  return length >= min ? null : (message || defaultMessage);
};

/**
 * Maximum length validator
 * @param {number} max - Maximum length
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const maxLength = (max, message) => (value) => {
  if (!value) return null; // Optional field

  const defaultMessage = `Maximum ${max} characters allowed`;
  const length = typeof value === 'string' ? value.length : value.length;

  return length <= max ? null : (message || defaultMessage);
};

/**
 * Pattern/regex validator
 * @param {RegExp} pattern - Regex pattern to match
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const pattern = (pattern, message = 'Invalid format') => (value) => {
  if (!value) return null; // Optional field

  return pattern.test(value) ? null : message;
};

/**
 * Minimum value validator (for numbers)
 * @param {number} min - Minimum value
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const minValue = (min, message) => (value) => {
  if (value === null || value === undefined || value === '') return null;

  const num = Number(value);
  const defaultMessage = `Minimum value is ${min}`;

  return num >= min ? null : (message || defaultMessage);
};

/**
 * Maximum value validator (for numbers)
 * @param {number} max - Maximum value
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const maxValue = (max, message) => (value) => {
  if (value === null || value === undefined || value === '') return null;

  const num = Number(value);
  const defaultMessage = `Maximum value is ${max}`;

  return num <= max ? null : (message || defaultMessage);
};

/**
 * Match field validator (for password confirmation, etc.)
 * @param {string} fieldName - Name of field to match
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const matchField = (fieldName, message) => (value, allValues) => {
  const defaultMessage = `Must match ${fieldName}`;
  return value === allValues[fieldName] ? null : (message || defaultMessage);
};

/**
 * URL validator
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const url = (message = 'Invalid URL') => (value) => {
  if (!value) return null;

  try {
    new URL(value);
    return null;
  } catch {
    return message;
  }
};

/**
 * Phone number validator (basic)
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const phone = (message = 'Invalid phone number') => (value) => {
  if (!value) return null;

  // Basic phone validation (10+ digits)
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(value) ? null : message;
};

/**
 * Date validator
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const date = (message = 'Invalid date') => (value) => {
  if (!value) return null;

  const dateObj = new Date(value);
  return isNaN(dateObj.getTime()) ? message : null;
};

/**
 * Future date validator
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const futureDate = (message = 'Date must be in the future') => (value) => {
  if (!value) return null;

  const dateObj = new Date(value);
  const now = new Date();

  return dateObj > now ? null : message;
};

/**
 * Past date validator
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const pastDate = (message = 'Date must be in the past') => (value) => {
  if (!value) return null;

  const dateObj = new Date(value);
  const now = new Date();

  return dateObj < now ? null : message;
};

/**
 * File size validator
 * @param {number} maxSize - Maximum size in bytes
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const fileSize = (maxSize, message) => (file) => {
  if (!file) return null;

  const sizeMB = (maxSize / (1024 * 1024)).toFixed(1);
  const defaultMessage = `File size must be less than ${sizeMB}MB`;

  return file.size <= maxSize ? null : (message || defaultMessage);
};

/**
 * File type validator
 * @param {string[]} allowedTypes - Array of allowed MIME types or extensions
 * @param {string} message - Custom error message
 * @returns {Function} Validator function
 */
export const fileType = (allowedTypes, message) => (file) => {
  if (!file) return null;

  const defaultMessage = `File type must be: ${allowedTypes.join(', ')}`;

  const fileType = file.type;
  const fileExt = file.name.split('.').pop().toLowerCase();

  const isAllowed = allowedTypes.some((type) => {
    if (type.startsWith('.')) {
      return fileExt === type.substring(1);
    }
    return fileType === type || fileType.startsWith(type);
  });

  return isAllowed ? null : (message || defaultMessage);
};

/**
 * Custom validator wrapper
 * @param {Function} validatorFn - Custom validation function
 * @param {string} message - Error message
 * @returns {Function} Validator function
 */
export const custom = (validatorFn, message = 'Invalid value') => (value, allValues) => {
  try {
    const isValid = validatorFn(value, allValues);
    return isValid ? null : message;
  } catch (error) {
    console.error('Validation error:', error);
    return message;
  }
};

/**
 * Async validator wrapper
 * @param {Function} asyncFn - Async validation function
 * @param {string} message - Error message
 * @returns {Function} Async validator function
 */
export const async = (asyncFn, message = 'Validation failed') => async (value) => {
  try {
    const isValid = await asyncFn(value);
    return isValid ? null : message;
  } catch (error) {
    console.error('Async validation error:', error);
    return message;
  }
};

/**
 * Compose multiple validators
 * @param {...Function} validators - Validator functions to compose
 * @returns {Function} Composed validator function
 */
export const compose = (...validators) => async (value, allValues) => {
  for (const validator of validators) {
    const error = await validator(value, allValues);
    if (error) return error;
  }
  return null;
};
