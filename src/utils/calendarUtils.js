import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend dayjs with ISO week plugin
dayjs.extend(isoWeek);

/**
 * Formats a date for display based on the calendar view
 * @param {dayjs.Dayjs} date - The date to format
 * @param {'day' | 'week' | 'month'} view - The calendar view
 * @returns {string} Formatted date string
 * @example
 * // Returns "January 1, 2024"
 * formatDateForView(dayjs('2024-01-01'), 'day')
 * // Returns "Jan 1 - Jan 7, 2024"
 * formatDateForView(dayjs('2024-01-01'), 'week')
 * // Returns "January 2024"
 * formatDateForView(dayjs('2024-01-01'), 'month')
 */
export const formatDateForView = (date, view) => {
  if (view === 'day') {
    return date.format('MMMM D, YYYY');
  } else if (view === 'week') {
    const startOfWeek = date.startOf('isoWeek');
    const endOfWeek = date.endOf('isoWeek');
    return `${startOfWeek.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`;
  } else {
    return date.format('MMMM YYYY');
  }
};

/**
 * Checks if a date is today
 * @param {dayjs.Dayjs} date - The date to check
 * @returns {boolean} True if the date is today
 * @example
 * // Returns true if today is 2024-01-01
 * isToday(dayjs('2024-01-01'))
 */
export const isToday = (date) => {
  return date.isSame(dayjs(), 'day');
};

/**
 * Checks if a date is in the current month
 * @param {dayjs.Dayjs} date - The date to check
 * @param {dayjs.Dayjs} currentDate - The current date to compare against
 * @returns {boolean} True if the date is in the current month
 * @example
 * // Returns true if both dates are in January 2024
 * isCurrentMonth(dayjs('2024-01-15'), dayjs('2024-01-01'))
 */
export const isCurrentMonth = (date, currentDate) => {
  return date.isSame(currentDate, 'month');
};

/**
 * Gets the start and end dates for a calendar view
 * @param {dayjs.Dayjs} date - The current date
 * @param {'day' | 'week' | 'month'} view - The calendar view
 * @returns {{start: dayjs.Dayjs, end: dayjs.Dayjs}} Object containing start and end dates
 * @example
 * // Returns {start: dayjs('2024-01-01'), end: dayjs('2024-01-01')}
 * getViewDates(dayjs('2024-01-01'), 'day')
 */
export const getViewDates = (date, view) => {
  if (view === 'day') {
    return {
      start: date.startOf('day'),
      end: date.endOf('day')
    };
  } else if (view === 'week') {
    return {
      start: date.startOf('isoWeek'),
      end: date.endOf('isoWeek')
    };
  } else {
    return {
      start: date.startOf('month'),
      end: date.endOf('month')
    };
  }
}; 