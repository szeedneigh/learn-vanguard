import { useState, useCallback, useMemo } from 'react';

/**
 * useBulkSelection Hook
 *
 * Manages bulk selection state for lists with checkboxes.
 * Provides methods for selecting/deselecting items, select all, etc.
 *
 * @param {Array} items - All items in the list
 * @param {Function} [getItemId] - Function to get item ID (defaults to item => item.id || item._id)
 * @returns {Object} - Hook interface
 *
 * @example
 * const {
 *   selectedIds,
 *   selectedItems,
 *   isSelected,
 *   isAllSelected,
 *   isSomeSelected,
 *   toggleItem,
 *   toggleAll,
 *   selectAll,
 *   clearSelection,
 *   selectRange,
 * } = useBulkSelection(resources);
 */
export function useBulkSelection(items = [], getItemId = (item) => item.id || item._id) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  // Get all item IDs
  const allIds = useMemo(() => {
    return items.map(getItemId);
  }, [items, getItemId]);

  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  // Check if an item is selected
  const isSelected = useCallback(
    (itemOrId) => {
      const id = typeof itemOrId === 'object' ? getItemId(itemOrId) : itemOrId;
      return selectedIds.has(id);
    },
    [selectedIds, getItemId]
  );

  // Check if all items are selected
  const isAllSelected = useMemo(() => {
    return items.length > 0 && selectedIds.size === items.length;
  }, [items.length, selectedIds.size]);

  // Check if some (but not all) items are selected
  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < items.length;
  }, [items.length, selectedIds.size]);

  // Toggle a single item
  const toggleItem = useCallback(
    (itemOrId, index = null) => {
      const id = typeof itemOrId === 'object' ? getItemId(itemOrId) : itemOrId;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });

      if (index !== null) {
        setLastSelectedIndex(index);
      }
    },
    [getItemId]
  );

  // Toggle all items
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }, [isAllSelected, allIds]);

  // Select all items
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  // Select a range of items (Shift+Click)
  const selectRange = useCallback(
    (currentIndex) => {
      if (lastSelectedIndex === null) {
        // No previous selection, just select current
        const id = getItemId(items[currentIndex]);
        setSelectedIds(new Set([id]));
        setLastSelectedIndex(currentIndex);
        return;
      }

      // Select range from lastSelectedIndex to currentIndex
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        for (let i = start; i <= end; i++) {
          if (items[i]) {
            newSet.add(getItemId(items[i]));
          }
        }
        return newSet;
      });

      setLastSelectedIndex(currentIndex);
    },
    [lastSelectedIndex, items, getItemId]
  );

  // Select multiple specific items
  const selectItems = useCallback(
    (itemsOrIds) => {
      const ids = itemsOrIds.map((itemOrId) =>
        typeof itemOrId === 'object' ? getItemId(itemOrId) : itemOrId
      );
      setSelectedIds(new Set(ids));
    },
    [getItemId]
  );

  // Deselect specific items
  const deselectItems = useCallback(
    (itemsOrIds) => {
      const ids = itemsOrIds.map((itemOrId) =>
        typeof itemOrId === 'object' ? getItemId(itemOrId) : itemOrId
      );

      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        ids.forEach((id) => newSet.delete(id));
        return newSet;
      });
    },
    [getItemId]
  );

  return {
    selectedIds: Array.from(selectedIds),
    selectedIdsSet: selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleItem,
    toggleAll,
    selectAll,
    clearSelection,
    selectRange,
    selectItems,
    deselectItems,
  };
}
