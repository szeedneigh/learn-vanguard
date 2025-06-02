/**
 * Helper functions and constants for the calendar components
 */

/**
 * Map of course names to color classes
 */
export const courseColors = {
  "Computer Science": "bg-blue-500",
  "Mathematics": "bg-green-500",
  "Physics": "bg-amber-500",
  "Chemistry": "bg-red-500",
  "Biology": "bg-emerald-500",
  "English": "bg-indigo-500",
  "History": "bg-purple-500",
  "Economics": "bg-pink-500",
  "General": "bg-blue-500",
  // Default color for unknown courses
  "default": "bg-gray-500"
};

/**
 * Map of task status to CSS classes
 */
export const statusClasses = {
  "completed": "bg-green-100 text-green-800 border-green-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
  "not-started": "bg-gray-100 text-gray-800 border-gray-300",
  "cancelled": "bg-red-100 text-red-800 border-red-300",
  "pending": "bg-amber-100 text-amber-800 border-amber-300",
  "default": "bg-slate-100 border-slate-200 hover:bg-slate-200"
};

/**
 * Capitalizes the first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @return {string} The capitalized string
 */
export function capitalize(str) {
  if (!str) return "";
  
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Converts a Date object to a localized ISO date string (YYYY-MM-DD)
 * @param {Date} date - The date to convert
 * @return {string} The formatted date string
 */
export function toLocaleDateStringISO(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets the first day of the month for a given date
 * @param {Date} date - The reference date
 * @return {Date} The first day of the month
 */
export function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Gets the last day of the month for a given date
 * @param {Date} date - The reference date
 * @return {Date} The last day of the month
 */
export function getLastDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Gets the start of the week for a given date (Sunday)
 * @param {Date} date - The reference date
 * @return {Date} The start of the week (Sunday)
 */
export function getStartOfWeek(date) {
  const newDate = new Date(date);
  const day = newDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  newDate.setDate(newDate.getDate() - day);
  return newDate;
}

/**
 * Gets the end of the week for a given date (Saturday)
 * @param {Date} date - The reference date
 * @return {Date} The end of the week (Saturday)
 */
export function getEndOfWeek(date) {
  const newDate = new Date(date);
  const day = newDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  newDate.setDate(newDate.getDate() + (6 - day));
  return newDate;
}

/**
 * Checks if two dates are the same day
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @return {boolean} True if the dates are the same day
 */
export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Generates a calendar grid for a month view
 * @param {Date} date - The reference date
 * @param {Array} events - The events to include in the grid
 * @return {Array} A 2D array representing the calendar grid
 */
export function generateCalendarGrid(date, events) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const grid = [];
  let week = [];
  
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dateString = toLocaleDateStringISO(currentDate);
    
    // Filter events for this day
    const dayEvents = events.filter(event => {
      let eventDate;
      if (event.date) {
        eventDate = new Date(event.date + 'T00:00:00');
      } else if (event.scheduleDate) {
        eventDate = new Date(event.scheduleDate);
      } else {
        return false;
      }
      
      return toLocaleDateStringISO(eventDate) === dateString;
    });
    
    week.push({
      day: currentDate.getDate(),
      dateString,
      isCurrentMonth: currentDate.getMonth() === month,
      tasks: dayEvents
    });
    
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  
  return grid;
} 