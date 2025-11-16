/**
 * Filter Utilities
 *
 * Helper functions for filtering arrays of items based on various criteria.
 * Supports tasks, resources, events, and other content types.
 */

import { isAfter, isBefore, isToday, isThisWeek, parseISO, startOfDay, endOfDay, addDays } from 'date-fns';
import { isFavorite } from './favoritesStorage';

/**
 * Filter items by multiple criteria
 * @param {Array} items - Items to filter
 * @param {Object} filters - Filter configuration
 * @returns {Array} - Filtered items
 */
export function applyFilters(items, filters) {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  if (!filters || Object.keys(filters).length === 0) {
    return items;
  }

  return items.filter((item) => {
    // Check each filter criterion
    for (const [key, value] of Object.entries(filters)) {
      if (!matchesFilter(item, key, value)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Check if an item matches a specific filter
 * @param {Object} item - Item to check
 * @param {string} filterKey - Filter key
 * @param {any} filterValue - Filter value
 * @returns {boolean} - Whether item matches
 */
function matchesFilter(item, filterKey, filterValue) {
  // Skip if filter value is null, undefined, or empty string
  if (filterValue === null || filterValue === undefined || filterValue === '') {
    return true;
  }

  switch (filterKey) {
    case 'search':
      return matchesSearch(item, filterValue);

    case 'category':
      return matchesCategory(item, filterValue);

    case 'type':
      return matchesType(item, filterValue);

    case 'status':
      return matchesStatus(item, filterValue);

    case 'dueDate':
      return matchesDueDate(item, filterValue);

    case 'createdDate':
      return matchesCreatedDate(item, filterValue);

    case 'tags':
      return matchesTags(item, filterValue);

    case 'isFavorite':
      return matchesFavorite(item, filterValue);

    case 'assignedTo':
      return matchesAssignedTo(item, filterValue);

    case 'assignedClass':
      return matchesAssignedClass(item, filterValue);

    default:
      // Generic equality check
      return item[filterKey] === filterValue;
  }
}

/**
 * Search filter - checks title, description, tags
 */
function matchesSearch(item, searchTerm) {
  const term = searchTerm.toLowerCase();

  const searchableFields = [
    item.title,
    item.name,
    item.description,
    item.message,
    ...(item.tags || []),
  ];

  return searchableFields.some(
    (field) => field && field.toLowerCase().includes(term)
  );
}

/**
 * Category filter
 */
function matchesCategory(item, category) {
  if (Array.isArray(category)) {
    return category.includes(item.category);
  }
  return item.category === category;
}

/**
 * Type filter (document, video, link, etc.)
 */
function matchesType(item, type) {
  if (Array.isArray(type)) {
    return type.includes(item.type || item.resourceType);
  }
  return (item.type || item.resourceType) === type;
}

/**
 * Status filter (pending, completed, overdue)
 */
function matchesStatus(item, status) {
  const itemStatus = (item.status || item.taskStatus || '').toLowerCase();

  if (status === 'overdue') {
    const isPending = itemStatus === 'pending';
    const isOverdue = item.dueDate && isAfter(new Date(), parseISO(item.dueDate));
    return isPending && isOverdue;
  }

  if (status === 'completed') {
    return itemStatus === 'completed';
  }

  if (status === 'pending') {
    const isPending = itemStatus === 'pending';
    const isNotOverdue = !item.dueDate || isBefore(new Date(), parseISO(item.dueDate));
    return isPending && isNotOverdue;
  }

  if (Array.isArray(status)) {
    return status.includes(itemStatus);
  }

  return itemStatus === status;
}

/**
 * Due date filter (today, week, custom range)
 */
function matchesDueDate(item, dateFilter) {
  if (!item.dueDate) {
    return false;
  }

  const dueDate = parseISO(item.dueDate);

  if (dateFilter === 'today') {
    return isToday(dueDate);
  }

  if (dateFilter === 'week') {
    return isThisWeek(dueDate, { weekStartsOn: 1 }); // Monday start
  }

  if (dateFilter === 'overdue') {
    return isBefore(dueDate, startOfDay(new Date()));
  }

  // Custom date range: { start, end }
  if (typeof dateFilter === 'object' && dateFilter.start && dateFilter.end) {
    const start = parseISO(dateFilter.start);
    const end = parseISO(dateFilter.end);
    return isAfter(dueDate, start) && isBefore(dueDate, end);
  }

  return true;
}

/**
 * Created date filter (last 7 days, last 30 days, custom range)
 */
function matchesCreatedDate(item, dateFilter) {
  if (!item.createdAt) {
    return false;
  }

  const createdDate = parseISO(item.createdAt);

  if (dateFilter === 'today') {
    return isToday(createdDate);
  }

  if (dateFilter === 'week') {
    return isThisWeek(createdDate, { weekStartsOn: 1 });
  }

  if (dateFilter === '7days') {
    const sevenDaysAgo = addDays(new Date(), -7);
    return isAfter(createdDate, sevenDaysAgo);
  }

  if (dateFilter === '30days') {
    const thirtyDaysAgo = addDays(new Date(), -30);
    return isAfter(createdDate, thirtyDaysAgo);
  }

  // Custom date range
  if (typeof dateFilter === 'object' && dateFilter.start && dateFilter.end) {
    const start = parseISO(dateFilter.start);
    const end = parseISO(dateFilter.end);
    return isAfter(createdDate, start) && isBefore(createdDate, end);
  }

  return true;
}

/**
 * Tags filter - item must have at least one matching tag
 */
function matchesTags(item, tags) {
  if (!item.tags || !Array.isArray(item.tags)) {
    return false;
  }

  if (Array.isArray(tags)) {
    return tags.some((tag) => item.tags.includes(tag));
  }

  return item.tags.includes(tags);
}

/**
 * Favorite filter
 */
function matchesFavorite(item, shouldBeFavorite) {
  const itemType = item.type || item.resourceType || 'resource';
  const itemId = item._id || item.id;

  if (!itemId) {
    return false;
  }

  const isItemFavorite = isFavorite(itemId, itemType);
  return shouldBeFavorite ? isItemFavorite : !isItemFavorite;
}

/**
 * Assigned to filter (for tasks)
 */
function matchesAssignedTo(item, userId) {
  if (!item.assignedTo) {
    return false;
  }

  if (Array.isArray(item.assignedTo)) {
    return item.assignedTo.includes(userId);
  }

  return item.assignedTo === userId;
}

/**
 * Assigned class filter (for students/tasks)
 */
function matchesAssignedClass(item, className) {
  if (Array.isArray(className)) {
    return className.includes(item.assignedClass);
  }
  return item.assignedClass === className;
}

/**
 * Count items by filter criteria
 * Useful for showing counts in filter UI
 */
export function countByFilter(items, filterKey, filterValue) {
  if (!items || !Array.isArray(items)) {
    return 0;
  }

  return items.filter((item) => matchesFilter(item, filterKey, filterValue)).length;
}

/**
 * Get unique values for a field
 * Useful for building filter dropdowns
 */
export function getUniqueValues(items, fieldName) {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const values = new Set();

  items.forEach((item) => {
    const value = item[fieldName];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => values.add(v));
      } else {
        values.add(value);
      }
    }
  });

  return Array.from(values).sort();
}

/**
 * Get filter counts for all categories
 * Returns object with counts per category
 */
export function getCategoryCounts(items) {
  if (!items || !Array.isArray(items)) {
    return {};
  }

  const counts = {};

  items.forEach((item) => {
    const category = item.category;
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Get filter counts for all types
 */
export function getTypeCounts(items) {
  if (!items || !Array.isArray(items)) {
    return {};
  }

  const counts = {};

  items.forEach((item) => {
    const type = item.type || item.resourceType;
    if (type) {
      counts[type] = (counts[type] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Get filter counts for all statuses
 */
export function getStatusCounts(items) {
  if (!items || !Array.isArray(items)) {
    return { pending: 0, completed: 0, overdue: 0 };
  }

  const counts = { pending: 0, completed: 0, overdue: 0 };

  items.forEach((item) => {
    const status = (item.status || item.taskStatus || '').toLowerCase();

    if (status === 'completed') {
      counts.completed++;
    } else if (status === 'pending') {
      const isOverdue = item.dueDate && isAfter(new Date(), parseISO(item.dueDate));
      if (isOverdue) {
        counts.overdue++;
      } else {
        counts.pending++;
      }
    }
  });

  return counts;
}

/**
 * Sort items by field
 */
export function sortItems(items, sortBy, sortOrder = 'asc') {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const sorted = [...items].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle dates
    if (sortBy === 'dueDate' || sortBy === 'createdAt') {
      aValue = aValue ? parseISO(aValue).getTime() : 0;
      bValue = bValue ? parseISO(bValue).getTime() : 0;
    }

    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}
