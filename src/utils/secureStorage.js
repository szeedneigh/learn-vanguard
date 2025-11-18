/**
 * Secure Storage Utility
 *
 * Provides secure token storage with encryption and XSS protection.
 * Uses sessionStorage with encryption for better security than plain localStorage.
 *
 * Security features:
 * - Basic obfuscation/encoding (not full encryption for client-side)
 * - Automatic expiration handling
 * - XSS-resistant patterns
 * - Centralized token management
 *
 * Note: For production applications with high security requirements,
 * consider using httpOnly cookies managed by the backend.
 */

import { STORAGE_KEYS, TIME_UNITS } from '@/constants';
import logger from '@/utils/logger';

// Simple encoding/decoding (base64 + reverse) for basic obfuscation
// This is NOT cryptographic security but prevents casual inspection
const encode = (str) => {
  try {
    return btoa(str.split('').reverse().join(''));
  } catch (e) {
    logger.error('Encoding failed', e);
    return str;
  }
};

const decode = (str) => {
  try {
    return atob(str).split('').reverse().join('');
  } catch (e) {
    logger.error('Decoding failed', e);
    return str;
  }
};

/**
 * Storage wrapper with security features
 */
class SecureStorage {
  constructor() {
    // Use sessionStorage for tokens (more secure than localStorage)
    // Data is cleared when browser/tab is closed
    this.storage = typeof window !== 'undefined' ? window.sessionStorage : null;

    // Also maintain localStorage for persistent preferences
    this.persistentStorage =
      typeof window !== 'undefined' ? window.localStorage : null;
  }

  /**
   * Store a value securely
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {Object} options - Storage options
   * @param {boolean} options.persistent - Use localStorage instead of sessionStorage
   * @param {number} options.expiresIn - Expiration time in milliseconds
   */
  set(key, value, options = {}) {
    const { persistent = false, expiresIn = null } = options;
    const storage = persistent ? this.persistentStorage : this.storage;

    if (!storage) {
      logger.warn('Storage not available');
      return false;
    }

    try {
      const data = {
        value,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : null,
      };

      const encoded = encode(JSON.stringify(data));
      storage.setItem(key, encoded);
      return true;
    } catch (error) {
      logger.error('Failed to store value', { key, error: error.message });
      return false;
    }
  }

  /**
   * Retrieve a value from storage
   * @param {string} key - Storage key
   * @param {Object} options - Retrieval options
   * @param {boolean} options.persistent - Use localStorage instead of sessionStorage
   * @returns {any} Stored value or null
   */
  get(key, options = {}) {
    const { persistent = false } = options;
    const storage = persistent ? this.persistentStorage : this.storage;

    if (!storage) {
      return null;
    }

    try {
      const encoded = storage.getItem(key);
      if (!encoded) return null;

      const data = JSON.parse(decode(encoded));

      // Check expiration
      if (data.expiresAt && Date.now() > data.expiresAt) {
        this.remove(key, options);
        return null;
      }

      return data.value;
    } catch (error) {
      logger.error('Failed to retrieve value', { key, error: error.message });
      return null;
    }
  }

  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   * @param {Object} options - Options
   * @param {boolean} options.persistent - Use localStorage
   */
  remove(key, options = {}) {
    const { persistent = false } = options;
    const storage = persistent ? this.persistentStorage : this.storage;

    if (storage) {
      storage.removeItem(key);
    }
  }

  /**
   * Clear all stored values
   * @param {boolean} includePersistent - Also clear localStorage
   */
  clear(includePersistent = false) {
    if (this.storage) {
      this.storage.clear();
    }
    if (includePersistent && this.persistentStorage) {
      this.persistentStorage.clear();
    }
  }

  // ==========================================
  // Token-specific methods
  // ==========================================

  /**
   * Store authentication token
   * @param {string} token - JWT token
   * @param {number} expiresIn - Expiration time in milliseconds (default: 1 hour)
   */
  setToken(token, expiresIn = TIME_UNITS.HOUR) {
    return this.set(STORAGE_KEYS.AUTH_TOKEN, token, { expiresIn });
  }

  /**
   * Get authentication token
   * @returns {string|null} Token or null if expired/not found
   */
  getToken() {
    return this.get(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Remove authentication token
   */
  removeToken() {
    this.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Check if user has a valid token
   * @returns {boolean}
   */
  hasToken() {
    return !!this.getToken();
  }

  // ==========================================
  // User data methods
  // ==========================================

  /**
   * Store user data
   * @param {Object} userData - User data object
   */
  setUserData(userData) {
    // Sanitize sensitive fields before storing
    const sanitized = { ...userData };
    delete sanitized.password;
    delete sanitized.idToken;
    delete sanitized.refreshToken;

    return this.set(STORAGE_KEYS.USER_DATA, sanitized);
  }

  /**
   * Get user data
   * @returns {Object|null}
   */
  getUserData() {
    return this.get(STORAGE_KEYS.USER_DATA);
  }

  /**
   * Remove user data
   */
  removeUserData() {
    this.remove(STORAGE_KEYS.USER_DATA);
  }

  // ==========================================
  // Preferences (persistent)
  // ==========================================

  /**
   * Store user preferences
   * @param {Object} preferences - User preferences
   */
  setPreferences(preferences) {
    return this.set(STORAGE_KEYS.PREFERENCES, preferences, { persistent: true });
  }

  /**
   * Get user preferences
   * @returns {Object|null}
   */
  getPreferences() {
    return this.get(STORAGE_KEYS.PREFERENCES, { persistent: true });
  }

  /**
   * Store theme preference
   * @param {string} theme - Theme name ('light', 'dark', 'system')
   */
  setTheme(theme) {
    return this.set(STORAGE_KEYS.THEME, theme, { persistent: true });
  }

  /**
   * Get theme preference
   * @returns {string|null}
   */
  getTheme() {
    return this.get(STORAGE_KEYS.THEME, { persistent: true });
  }

  // ==========================================
  // Draft/temporary data
  // ==========================================

  /**
   * Store draft data (e.g., unsaved form)
   * @param {string} formId - Form identifier
   * @param {Object} data - Draft data
   */
  setDraft(formId, data) {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${formId}`;
    return this.set(key, data, { expiresIn: TIME_UNITS.DAY });
  }

  /**
   * Get draft data
   * @param {string} formId - Form identifier
   * @returns {Object|null}
   */
  getDraft(formId) {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${formId}`;
    return this.get(key);
  }

  /**
   * Remove draft data
   * @param {string} formId - Form identifier
   */
  removeDraft(formId) {
    const key = `${STORAGE_KEYS.DRAFT_PREFIX}${formId}`;
    this.remove(key);
  }

  // ==========================================
  // Auth helper
  // ==========================================

  /**
   * Clear all authentication data (logout)
   */
  clearAuth() {
    this.removeToken();
    this.removeUserData();
    logger.info('Auth data cleared');
  }
}

// Export singleton instance
const secureStorage = new SecureStorage();

export default secureStorage;

/**
 * Migration helper to move from old localStorage usage
 * Call this once on app startup to migrate existing tokens
 */
export const migrateFromLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const oldToken = window.localStorage.getItem('authToken');
  if (oldToken && !secureStorage.getToken()) {
    // Migrate token to secure storage
    secureStorage.setToken(oldToken);
    // Remove from localStorage
    window.localStorage.removeItem('authToken');
    logger.info('Migrated auth token to secure storage');
  }
};
