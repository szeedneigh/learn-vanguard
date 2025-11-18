import logger from "@/utils/logger";
import { useState, useEffect, useCallback } from 'react';
import {
  getFavorites,
  addFavorite as addToStorage,
  removeFavorite as removeFromStorage,
  toggleFavorite as toggleInStorage,
  isFavorite as checkIsFavorite,
  clearFavorites as clearStorage,
  getFavoritesByType,
  getFavoritesByCategory,
  updateFavorite as updateInStorage,
  reorderFavorites as reorderInStorage,
} from '@/utils/favoritesStorage';

/**
 * useFavorites Hook
 *
 * React hook for managing user favorites.
 * Provides reactive interface to favorites storage.
 * @param {Object} [options] - Hook options
 * @param {string} [options.type] - Filter by item type
 * @param {string} [options.category] - Filter by category
 * @returns {Object} - Hook interface
 * @example
 * // Get all favorites
 * const { favorites, addFavorite, removeFavorite } = useFavorites();
 * // Get only resource favorites
 * const { favorites } = useFavorites({ type: 'resource' });
 */
export function useFavorites(options = {}) {
  const { type, category } = options;
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Load favorites from storage
  const loadFavorites = useCallback(() => {
    setIsLoading(true);
    try {
      let loadedFavorites;
      if (type) {
        loadedFavorites = getFavoritesByType(type);
      } else if (category) {
        loadedFavorites = getFavoritesByCategory(category);
      } else {
        loadedFavorites = getFavorites();
      }
      setFavorites(loadedFavorites);
    } catch (error) {
      logger.error('Failed to load favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, category]);
  // Load on mount and when options change
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'learn_vanguard_favorites') {
        loadFavorites();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  // Listen for custom events from same tab
    const handleFavoritesUpdate = () => {
      loadFavorites();
    window.addEventListener('favorites-updated', handleFavoritesUpdate);
    return () =>
      window.removeEventListener('favorites-updated', handleFavoritesUpdate);
  /**
   * Add an item to favorites
   */
  const addFavorite = useCallback(
    (item) => {
      const success = addToStorage(item);
      if (success) {
        window.dispatchEvent(new Event('favorites-updated'));
      return success;
    },
    [loadFavorites]
  );
   * Remove an item from favorites
  const removeFavorite = useCallback(
    (id, itemType) => {
      const success = removeFromStorage(id, itemType);
   * Toggle favorite status
  const toggleFavorite = useCallback(
      const newStatus = toggleInStorage(item);
      window.dispatchEvent(new Event('favorites-updated'));
      return newStatus;
   * Clear all favorites
  const clearAll = useCallback(() => {
    clearStorage();
    window.dispatchEvent(new Event('favorites-updated'));
   * Update favorite metadata
  const updateFavorite = useCallback(
    (id, itemType, updates) => {
      const success = updateInStorage(id, itemType, updates);
   * Reorder favorites
  const reorderFavorites = useCallback(
    (fromIndex, toIndex) => {
      const success = reorderInStorage(fromIndex, toIndex);
  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAll,
    updateFavorite,
    reorderFavorites,
    refresh: loadFavorites,
  };
}
 * useFavoriteStatus Hook
 * Check if a single item is favorited.
 * Useful for favorite buttons that need to show active state.
 * @param {string} id - Item ID
 * @param {string} type - Item type
 * const { isFavorited, toggle } = useFavoriteStatus(resource.id, 'resource');
export function useFavoriteStatus(id, type) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Check favorite status
  const checkStatus = useCallback(() => {
    if (id && type) {
      setIsFavorited(checkIsFavorite(id, type));
  }, [id, type]);
  // Check on mount and when id/type changes
    checkStatus();
  }, [checkStatus]);
  // Listen for favorites updates
    const handleUpdate = () => {
      checkStatus();
    window.addEventListener('favorites-updated', handleUpdate);
    return () => window.removeEventListener('favorites-updated', handleUpdate);
  const toggle = useCallback(
      if (!id || !type) {
        logger.warn('useFavoriteStatus: id and type are required');
        return false;
      setIsUpdating(true);
      try {
        const newStatus = toggleInStorage({
          id,
          type,
          ...item, // Allow passing additional data (title, path, etc.)
        });
        setIsFavorited(newStatus);
        return newStatus;
      } catch (error) {
        logger.error('Failed to toggle favorite:', error);
        return isFavorited; // Return current status on error
      } finally {
        setIsUpdating(false);
    [id, type, isFavorited]
    isFavorited,
    isUpdating,
    toggle,
    refresh: checkStatus,
