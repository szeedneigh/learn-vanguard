import logger from "@/utils/logger";
import { useState, useEffect, useCallback } from 'react';
import {
  getRecentlyViewed,
  addRecentlyViewed as addToStorage,
  removeRecentlyViewed as removeFromStorage,
  clearRecentlyViewed as clearStorage,
  getRecentlyViewedByType,
  getRecentlyViewedSince,
} from '@/utils/recentlyViewedStorage';

/**
 * useRecentlyViewed Hook
 *
 * React hook for tracking and retrieving recently viewed items.
 * Automatically syncs with localStorage and provides a reactive interface.
 * @param {Object} [options] - Hook options
 * @param {string} [options.type] - Filter by item type
 * @param {number} [options.limit] - Limit number of items returned
 * @param {number} [options.sinceDays] - Only show items from last N days
 * @returns {Object} - Hook interface
 * @example
 * // Get all recently viewed items
 * const { items, addItem, removeItem, clearAll } = useRecentlyViewed();
 * // Get recently viewed resources only, limit to 5
 * const { items } = useRecentlyViewed({ type: 'resource', limit: 5 });
 * // Track a page view
 * const { trackPageView } = useRecentlyViewed();
 * useEffect(() => {
 *   trackPageView({
 *     id: resource.id,
 *     type: 'resource',
 *     title: resource.title,
 *     path: `/dashboard/resources/${resource.id}`,
 *     icon: 'BookOpen',
 *     metadata: { category: resource.category }
 *   });
 * }, [resource.id]);
 */
export function useRecentlyViewed(options = {}) {
  const { type, limit, sinceDays } = options;
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Load items from storage
  const loadItems = useCallback(() => {
    setIsLoading(true);
    try {
      let loadedItems;
      if (type) {
        loadedItems = getRecentlyViewedByType(type, limit);
      } else if (sinceDays) {
        loadedItems = getRecentlyViewedSince(sinceDays);
        if (limit) {
          loadedItems = loadedItems.slice(0, limit);
        }
      } else {
        loadedItems = getRecentlyViewed();
      }
      setItems(loadedItems);
    } catch (error) {
      logger.error('Failed to load recently viewed items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, limit, sinceDays]);
  // Load on mount and when options change
  useEffect(() => {
    loadItems();
  }, [loadItems]);
  // Listen for storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'learn_vanguard_recently_viewed') {
        loadItems();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  // Listen for custom events from same tab
    const handleRecentlyViewedUpdate = () => {
      loadItems();
    window.addEventListener('recently-viewed-updated', handleRecentlyViewedUpdate);
    return () =>
      window.removeEventListener('recently-viewed-updated', handleRecentlyViewedUpdate);
  /**
   * Add an item to recently viewed
   */
  const addItem = useCallback(
    (item) => {
      addToStorage(item);
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new Event('recently-viewed-updated'));
    },
    [loadItems]
  );
   * Remove an item from recently viewed
  const removeItem = useCallback(
    (id, itemType) => {
      removeFromStorage(id, itemType);
   * Clear all recently viewed items
  const clearAll = useCallback(() => {
    clearStorage();
    window.dispatchEvent(new Event('recently-viewed-updated'));
   * Convenience method to track a page view
   * Automatically called from page components
  const trackPageView = useCallback(
      // Validate required fields
      if (!item.id || !item.type || !item.title || !item.path) {
        logger.warn('trackPageView called with incomplete item data:', item);
        return;
      addItem(item);
    [addItem]
  return {
    items,
    isLoading,
    addItem,
    removeItem,
    clearAll,
    trackPageView,
    refresh: loadItems,
  };
}
 * useTrackView Hook
 * Automatically tracks a view when component mounts.
 * Useful for page components that want to automatically log their view.
 * @param {Object} item - Item to track (omit timestamp, it's added automatically)
 * @param {Object} [options] - Options
 * @param {boolean} [options.enabled=true] - Whether tracking is enabled
 * @param {Array} [options.deps=[]] - Dependencies array (like useEffect)
 * // In a resource detail page
 * useTrackView({
 *   id: resource.id,
 *   type: 'resource',
 *   title: resource.title,
 *   path: location.pathname,
 *   icon: 'BookOpen',
 *   metadata: { category: resource.category }
 * });
export function useTrackView(item, options = {}) {
  const { enabled = true, deps = [] } = options;
  const { trackPageView } = useRecentlyViewed();
    if (enabled && item) {
      trackPageView(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);
