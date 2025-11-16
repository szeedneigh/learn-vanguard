/**
 * Recently Viewed Storage Utility
 *
 * Manages localStorage for tracking recently viewed items.
 * Implements LRU (Least Recently Used) eviction strategy to maintain a reasonable size.
 *
 * Features:
 * - Automatic deduplication (viewing same item updates timestamp)
 * - Size limit (default: 30 items)
 * - localStorage feature detection with fallback
 * - Data versioning for future migrations
 * - Type safety with JSDoc
 */

const STORAGE_KEY = 'learn_vanguard_recently_viewed';
const MAX_ITEMS = 30;
const STORAGE_VERSION = 1;

/**
 * @typedef {Object} RecentlyViewedItem
 * @property {string} id - Unique identifier
 * @property {'resource'|'task'|'event'|'user'|'page'} type - Item type
 * @property {string} title - Display title
 * @property {string} path - Navigation path
 * @property {string} icon - Icon name (lucide-react)
 * @property {number} timestamp - Unix timestamp
 * @property {Object} [metadata] - Type-specific metadata
 */

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('localStorage is not available:', e.message);
    return false;
  }
}

/**
 * Get all recently viewed items
 * @returns {RecentlyViewedItem[]}
 */
export function getRecentlyViewed() {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);

    // Version check for future migrations
    if (data.version !== STORAGE_VERSION) {
      console.warn('Recently viewed data version mismatch, clearing...');
      clearRecentlyViewed();
      return [];
    }

    return data.items || [];
  } catch (error) {
    console.error('Failed to get recently viewed items:', error);
    return [];
  }
}

/**
 * Add an item to recently viewed
 * Automatically deduplicates and maintains sort order (most recent first)
 *
 * @param {RecentlyViewedItem} item - Item to add
 */
export function addRecentlyViewed(item) {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    let items = getRecentlyViewed();

    // Remove existing entry if present (deduplicate)
    items = items.filter((i) => i.id !== item.id || i.type !== item.type);

    // Add new item at the beginning (most recent)
    items.unshift({
      ...item,
      timestamp: Date.now(),
    });

    // Limit to MAX_ITEMS
    if (items.length > MAX_ITEMS) {
      items = items.slice(0, MAX_ITEMS);
    }

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      })
    );
  } catch (error) {
    console.error('Failed to add recently viewed item:', error);
    // If storage is full, try clearing old items
    if (error.name === 'QuotaExceededError') {
      try {
        const items = getRecentlyViewed().slice(0, MAX_ITEMS / 2);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: STORAGE_VERSION,
            items,
          })
        );
      } catch (retryError) {
        console.error('Failed to recover from quota error:', retryError);
      }
    }
  }
}

/**
 * Remove an item from recently viewed
 *
 * @param {string} id - Item ID
 * @param {string} type - Item type
 */
export function removeRecentlyViewed(id, type) {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const items = getRecentlyViewed().filter(
      (item) => !(item.id === id && item.type === type)
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      })
    );
  } catch (error) {
    console.error('Failed to remove recently viewed item:', error);
  }
}

/**
 * Clear all recently viewed items
 */
export function clearRecentlyViewed() {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recently viewed:', error);
  }
}

/**
 * Get recently viewed items filtered by type
 *
 * @param {string} type - Item type to filter by
 * @param {number} [limit] - Maximum number of items to return
 * @returns {RecentlyViewedItem[]}
 */
export function getRecentlyViewedByType(type, limit) {
  const items = getRecentlyViewed().filter((item) => item.type === type);

  if (limit && limit > 0) {
    return items.slice(0, limit);
  }

  return items;
}

/**
 * Get recently viewed items from the last N days
 *
 * @param {number} days - Number of days to look back
 * @returns {RecentlyViewedItem[]}
 */
export function getRecentlyViewedSince(days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return getRecentlyViewed().filter((item) => item.timestamp >= cutoff);
}

/**
 * Export recently viewed data as JSON
 * Useful for debugging or data portability
 *
 * @returns {string} - JSON string
 */
export function exportRecentlyViewed() {
  const items = getRecentlyViewed();
  return JSON.stringify({ version: STORAGE_VERSION, items }, null, 2);
}

/**
 * Import recently viewed data from JSON
 * Merges with existing data, deduplicating by ID and type
 *
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} - Success status
 */
export function importRecentlyViewed(jsonString) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const data = JSON.parse(jsonString);

    if (data.version !== STORAGE_VERSION) {
      console.warn('Import data version mismatch');
      return false;
    }

    if (!Array.isArray(data.items)) {
      console.warn('Import data has invalid format');
      return false;
    }

    // Merge with existing items
    const existing = getRecentlyViewed();
    const merged = [...data.items, ...existing];

    // Deduplicate by ID + type, keeping most recent
    const deduped = Array.from(
      merged
        .reduce((map, item) => {
          const key = `${item.type}:${item.id}`;
          const current = map.get(key);
          if (!current || item.timestamp > current.timestamp) {
            map.set(key, item);
          }
          return map;
        }, new Map())
        .values()
    );

    // Sort by timestamp (most recent first)
    deduped.sort((a, b) => b.timestamp - a.timestamp);

    // Limit and save
    const limited = deduped.slice(0, MAX_ITEMS);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items: limited,
      })
    );

    return true;
  } catch (error) {
    console.error('Failed to import recently viewed:', error);
    return false;
  }
}
