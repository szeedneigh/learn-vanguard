import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Extend dayjs with required plugins
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * Format date as a relative time (e.g. "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return dayjs(date).fromNow();
};

/**
 * Format date in standard display format (e.g. "Jan 1, 2023")
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (defaults to "MMM D, YYYY")
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'MMM D, YYYY') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * Format date with time (e.g. "Jan 1, 2023 10:00 AM")
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (defaults to "MMM D, YYYY h:mm A")
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date, format = 'MMM D, YYYY h:mm A') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * Format date for calendar views
 * @param {Date|string} date - The date to format
 * @param {'day'|'week'|'month'} view - The calendar view type
 * @returns {string} Formatted date string
 */
export const formatDateForCalendarView = (date, view) => {
  if (!date) return '';
  
  const dateObj = dayjs(date);
  
  if (view === 'day') {
    return dateObj.format('MMMM D, YYYY');
  } else if (view === 'week') {
    const startOfWeek = dateObj.startOf('week');
    const endOfWeek = dateObj.endOf('week');
    return `${startOfWeek.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`;
  } else {
    return dateObj.format('MMMM YYYY');
  }
};

/**
 * Checks if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Convert a date to ISO date string in local timezone (YYYY-MM-DD)
 * @param {Date} date - Date object to convert
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const toLocaleDateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 