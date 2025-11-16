/**
 * Filter Presets Storage Utility
 *
 * Manages localStorage for saving custom filter configurations.
 * Users can save their frequently used filter combinations.
 *
 * Features:
 * - Save/load filter presets
 * - Default presets (My Favorites, Due Today, etc.)
 * - Custom user-defined presets
 * - localStorage persistence
 */

const STORAGE_KEY = 'learn_vanguard_filter_presets';
const STORAGE_VERSION = 1;

/**
 * @typedef {Object} FilterPreset
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {Object} filters - Filter configuration
 * @property {boolean} isDefault - Whether it's a system default
 * @property {number} timestamp - Creation timestamp
 */

/**
 * Default filter presets that cannot be deleted
 */
export const DEFAULT_PRESETS = [
  {
    id: 'favorites',
    name: '⭐ My Favorites',
    filters: { isFavorite: true },
    isDefault: true,
  },
  {
    id: 'due-today',
    name: '📅 Due Today',
    filters: { dueDate: 'today' },
    isDefault: true,
  },
  {
    id: 'due-week',
    name: '⏰ Due This Week',
    filters: { dueDate: 'week' },
    isDefault: true,
  },
  {
    id: 'new-week',
    name: '🆕 New This Week',
    filters: { createdDate: 'week' },
    isDefault: true,
  },
  {
    id: 'completed',
    name: '✅ Completed',
    filters: { status: 'completed' },
    isDefault: true,
  },
  {
    id: 'in-progress',
    name: '⏳ In Progress',
    filters: { status: 'pending' },
    isDefault: true,
  },
  {
    id: 'overdue',
    name: '🔴 Overdue',
    filters: { status: 'overdue' },
    isDefault: true,
  },
  {
    id: 'videos',
    name: '📹 Videos',
    filters: { type: 'video' },
    isDefault: true,
  },
  {
    id: 'documents',
    name: '📄 Documents',
    filters: { type: 'document' },
    isDefault: true,
  },
];

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get all filter presets (default + custom)
 * @returns {FilterPreset[]}
 */
export function getFilterPresets() {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_PRESETS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PRESETS;
    }

    const data = JSON.parse(stored);
    if (data.version !== STORAGE_VERSION) {
      return DEFAULT_PRESETS;
    }

    // Merge custom presets with defaults
    return [...DEFAULT_PRESETS, ...(data.customPresets || [])];
  } catch (error) {
    console.error('Failed to load filter presets:', error);
    return DEFAULT_PRESETS;
  }
}

/**
 * Get custom presets only
 * @returns {FilterPreset[]}
 */
export function getCustomPresets() {
  if (!isLocalStorageAvailable()) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);
    return data.customPresets || [];
  } catch (error) {
    return [];
  }
}

/**
 * Save a custom filter preset
 * @param {string} name - Preset name
 * @param {Object} filters - Filter configuration
 * @returns {FilterPreset|null} - Saved preset or null on error
 */
export function saveFilterPreset(name, filters) {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const customPresets = getCustomPresets();

    const newPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters,
      isDefault: false,
      timestamp: Date.now(),
    };

    customPresets.push(newPreset);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        customPresets,
      })
    );

    return newPreset;
  } catch (error) {
    console.error('Failed to save filter preset:', error);
    return null;
  }
}

/**
 * Delete a custom filter preset
 * @param {string} id - Preset ID
 * @returns {boolean} - Success status
 */
export function deleteFilterPreset(id) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const customPresets = getCustomPresets();
    const filtered = customPresets.filter((preset) => preset.id !== id);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        customPresets: filtered,
      })
    );

    return true;
  } catch (error) {
    console.error('Failed to delete filter preset:', error);
    return false;
  }
}

/**
 * Update a custom filter preset
 * @param {string} id - Preset ID
 * @param {Object} updates - Fields to update
 * @returns {boolean} - Success status
 */
export function updateFilterPreset(id, updates) {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const customPresets = getCustomPresets();
    const updated = customPresets.map((preset) =>
      preset.id === id ? { ...preset, ...updates } : preset
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        customPresets: updated,
      })
    );

    return true;
  } catch (error) {
    console.error('Failed to update filter preset:', error);
    return false;
  }
}

/**
 * Clear all custom presets
 */
export function clearCustomPresets() {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear presets:', error);
  }
}
