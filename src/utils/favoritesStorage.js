/**
 * Favorites Storage Utility
 *
 * Manages localStorage for tracking favorite/pinned items.
 * Similar to recently viewed but focused on user-curated content.
 *
 * Features:
 * - Add/remove favorites
 * - localStorage with fallback
 * - Data versioning
 * - Category/type filtering
 * - Export/import functionality
 */

const STORAGE_KEY = 'learn_vanguard_favorites';
const STORAGE_VERSION = 1;

/**
 * @typedef {Object} FavoriteItem
 * @property {string} id - Unique identifier
 * @property {'resource'|'task'|'event'|'user'|'page'} type - Item type
 * @property {string} title - Display title
 * @property {string} path - Navigation path
 * @property {string} icon - Icon name (lucide-react)
 * @property {number} timestamp - Unix timestamp when favorited
 * @property {Object} [metadata] - Type-specific metadata
 * @property {string} [category] - Optional category for organization
 * @property {string[]} [tags] - Optional tags
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
    logger.warn('localStorage is not available:', e.message);
    return false;
  }
}

/**
 * Get all favorite items
 * @returns {FavoriteItem[]}
 */
export function getFavorites() {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);

    // Version check
    if (data.version !== STORAGE_VERSION) {
      logger.warn('Favorites data version mismatch, clearing...');
      clearFavorites();
      return [];
    }

    return data.items || [];
  } catch (error) {
    logger.error('Failed to get favorites:', error);
    return [];
  }
}

/**
 * Add an item to favorites
 *
 * @param {FavoriteItem} item - Item to favorite
 * @returns {boolean} - Success status
 */
export function addFavorite(item) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    let items = getFavorites();

    // Check if already favorited
    const exists = items.some(
      (i) => i.id === item.id && i.type === item.type
    );

    if (exists) {
      logger.log('Item already favorited');
      return true; // Not an error, just already exists
    }

    // Add new favorite
    items.unshift({
      ...item,
      timestamp: Date.now(),
    });

    // Save to localStorage
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to add favorite:', error);

    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      try {
        // Remove oldest half of favorites
        const items = getFavorites().slice(0, Math.floor(getFavorites().length / 2));
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: STORAGE_VERSION,
            items,
          })
        );
        // Try adding again
        return addFavorite(item);
      } catch (retryError) {
        logger.error('Failed to recover from quota error:', retryError);
      }
    }

    return false;
  }
}

/**
 * Remove an item from favorites
 *
 * @param {string} id - Item ID
 * @param {string} type - Item type
 * @returns {boolean} - Success status
 */
export function removeFavorite(id, type) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const items = getFavorites().filter(
      (item) => !(item.id === id && item.type === type)
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to remove favorite:', error);
    return false;
  }
}

/**
 * Check if an item is favorited
 *
 * @param {string} id - Item ID
 * @param {string} type - Item type
 * @returns {boolean}
 */
export function isFavorite(id, type) {
  const items = getFavorites();
  return items.some((item) => item.id === id && item.type === type);
}

/**
 * Toggle favorite status
 *
 * @param {FavoriteItem} item - Item to toggle
 * @returns {boolean} - New favorite status (true = now favorited, false = now removed)
 */
export function toggleFavorite(item) {
  if (isFavorite(item.id, item.type)) {
    removeFavorite(item.id, item.type);
    return false;
  } else {
    addFavorite(item);
    return true;
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites() {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logger.error('Failed to clear favorites:', error);
  }
}

/**
 * Get favorites filtered by type
 *
 * @param {string} type - Item type to filter by
 * @returns {FavoriteItem[]}
 */
export function getFavoritesByType(type) {
  return getFavorites().filter((item) => item.type === type);
}

/**
 * Get favorites filtered by category
 *
 * @param {string} category - Category to filter by
 * @returns {FavoriteItem[]}
 */
export function getFavoritesByCategory(category) {
  return getFavorites().filter((item) => item.category === category);
}

/**
 * Get favorites filtered by tag
 *
 * @param {string} tag - Tag to filter by
 * @returns {FavoriteItem[]}
 */
export function getFavoritesByTag(tag) {
  return getFavorites().filter(
    (item) => item.tags && item.tags.includes(tag)
  );
}

/**
 * Update favorite metadata (category, tags, etc.)
 *
 * @param {string} id - Item ID
 * @param {string} type - Item type
 * @param {Object} updates - Fields to update
 * @returns {boolean} - Success status
 */
export function updateFavorite(id, type, updates) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const items = getFavorites().map((item) => {
      if (item.id === id && item.type === type) {
        return { ...item, ...updates };
      }
      return item;
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to update favorite:', error);
    return false;
  }
}

/**
 * Reorder favorites (for drag-and-drop)
 *
 * @param {number} fromIndex - Source index
 * @param {number} toIndex - Destination index
 * @returns {boolean} - Success status
 */
export function reorderFavorites(fromIndex, toIndex) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const items = [...getFavorites()];

    if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
      return false;
    }

    // Remove from old position
    const [movedItem] = items.splice(fromIndex, 1);
    // Insert at new position
    items.splice(toIndex, 0, movedItem);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items,
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to reorder favorites:', error);
    return false;
  }
}

/**
 * Export favorites as JSON
 *
 * @returns {string} - JSON string
 */
export function exportFavorites() {
  const items = getFavorites();
  return JSON.stringify({ version: STORAGE_VERSION, items }, null, 2);
}

/**
 * Import favorites from JSON
 *
 * @param {string} jsonString - JSON string to import
 * @param {boolean} [merge=true] - Merge with existing or replace
 * @returns {boolean} - Success status
 */
export function importFavorites(jsonString, merge = true) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const data = JSON.parse(jsonString);

    if (data.version !== STORAGE_VERSION) {
      logger.warn('Import data version mismatch');
      return false;
    }

    if (!Array.isArray(data.items)) {
      logger.warn('Import data has invalid format');
      return false;
    }

    let finalItems = data.items;

    if (merge) {
      // Merge with existing items
      const existing = getFavorites();
      const merged = [...data.items, ...existing];

      // Deduplicate by ID + type
      const deduped = Array.from(
        merged
          .reduce((map, item) => {
            const key = `${item.type}:${item.id}`;
            if (!map.has(key)) {
              map.set(key, item);
            }
            return map;
          }, new Map())
          .values()
      );

      finalItems = deduped;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        items: finalItems,
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to import favorites:', error);
    return false;
  }
}

/**
 * Get favorites count
 *
 * @returns {number}
 */
export function getFavoritesCount() {
  return getFavorites().length;
}

/**
 * Get favorites count by type
 *
 * @param {string} type - Item type
 * @returns {number}
 */
export function getFavoritesCountByType(type) {
  return getFavoritesByType(type).length;
}
