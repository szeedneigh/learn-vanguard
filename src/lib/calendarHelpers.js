/**
 * Helper functions and constants for the calendar components
 */

/**
 * Map of course names to color classes
 */
export const courseColors = {
  ALL: "bg-blue-500",
  "Associate in Computer Technology": "bg-green-500",
  "Bachelor of Science in Information Systems": "bg-purple-500",
  "Computer Science": "bg-blue-500",
  Mathematics: "bg-green-500",
  Physics: "bg-amber-500",
  Chemistry: "bg-red-500",
  Biology: "bg-emerald-500",
  English: "bg-indigo-500",
  History: "bg-purple-500",
  Economics: "bg-pink-500",
  General: "bg-blue-500",
  // Default color for unknown courses
  default: "bg-gray-500",
};

/**
 * Map of task status to CSS classes
 */
export const statusClasses = {
  completed: "bg-green-100 text-green-800 border-green-300",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
  "not-started": "bg-gray-100 text-gray-800 border-gray-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  upcoming: "bg-blue-100 text-blue-800 border-blue-300",
  default: "bg-slate-100 border-slate-200 hover:bg-slate-200",
};

/**
 * Get task color based on priority and status (matches main task page)
 * @param {string} priority - Task priority (High Priority, Medium Priority, Low Priority, High, Medium, Low)
 * @param {string} status - Task status (Completed, On-hold, On Hold, etc.)
 * @returns {string} Hex color code
 */
export const getTaskColor = (priority, status) => {
  // Normalize status to handle different formats
  const normalizedStatus = normalizeStatus(status);

  // Status overrides priority color
  if (normalizedStatus === "Completed") return "#10B981"; // Green
  if (normalizedStatus === "On Hold") return "#F59E0B"; // Yellow/Amber

  // Normalize priority to handle different formats
  const normalizedPriority = normalizePriority(priority);

  switch (normalizedPriority) {
    case "High":
      return "#EF4444"; // Red (matches main task page)
    case "Medium":
      return "#F59E0B"; // Amber (matches main task page)
    case "Low":
      return "#10B981"; // Green (matches main task page)
    default:
      return "#6366F1"; // Blue (default)
  }
};

/**
 * Normalize status to handle different formats from backend
 * @param {string} status - Task status
 * @returns {string} Normalized status
 */
export const normalizeStatus = (status) => {
  if (!status) return "Unknown";

  const statusLower = typeof status === "string" ? status.toLowerCase() : "";

  if (
    statusLower === "not yet started" ||
    statusLower === "not-started" ||
    statusLower === "not started"
  ) {
    return "Not Started";
  } else if (statusLower === "in progress" || statusLower === "in-progress") {
    return "In Progress";
  } else if (statusLower === "on hold" || statusLower === "on-hold") {
    return "On Hold";
  } else if (statusLower === "completed") {
    return "Completed";
  }

  return status; // Return original if no match
};

/**
 * Normalize priority to handle different formats from backend
 * @param {string} priority - Task priority
 * @returns {string} Normalized priority
 */
export const normalizePriority = (priority) => {
  if (!priority) return null;

  if (priority && priority.includes && priority.includes("Priority")) {
    return priority.replace(" Priority", "");
  }
  return priority;
};

/**
 * Get task background color classes based on priority and status (matches main task page)
 * @param {string} priority - Task priority
 * @param {string} status - Task status
 * @returns {string} CSS classes for background and text
 */
export const getTaskColorClasses = (priority, status) => {
  const normalizedStatus = normalizeStatus(status);
  const normalizedPriority = normalizePriority(priority);

  // Status overrides priority color (matches main task page)
  if (normalizedStatus === "Completed") return "bg-green-100 text-green-800"; // Matches TaskCard
  if (normalizedStatus === "On Hold") return "bg-amber-100 text-amber-800"; // Matches TaskCard

  switch (normalizedPriority) {
    case "High":
      return "bg-red-100 text-red-700"; // Matches TaskCard
    case "Medium":
      return "bg-amber-100 text-amber-700"; // Matches TaskCard
    case "Low":
      return "bg-green-100 text-green-700"; // Matches TaskCard
    default:
      return "bg-blue-50 border-blue-200 text-blue-800"; // Default
  }
};

/**
 * Get status color classes (matches main task page)
 * @param {string} status - Task status
 * @returns {string} CSS classes for status display
 */
export const getStatusColorClasses = (status) => {
  const normalizedStatus = normalizeStatus(status);

  switch (normalizedStatus) {
    case "Not Started":
      return "bg-gray-100 text-gray-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "On Hold":
      return "bg-amber-100 text-amber-800";
    case "Completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Check if a task is completed
 * @param {string} status - Task status
 * @returns {boolean} True if task is completed
 */
export const isTaskCompleted = (status) => {
  const normalizedStatus = normalizeStatus(status);
  return normalizedStatus === "Completed";
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
    const dayEvents = events.filter((event) => {
      // Try to get the event date from various possible properties
      let eventDate;

      if (event.date) {
        // Handle YYYY-MM-DD format
        eventDate = new Date(event.date + "T00:00:00");
      } else if (event.scheduleDate) {
        // Handle ISO date string or date object
        eventDate = new Date(event.scheduleDate);
      } else if (event.startDate) {
        // Some events might use startDate instead
        eventDate = new Date(event.startDate);
      } else {
        return false;
      }

      // Check if the event is on this day
      return toLocaleDateStringISO(eventDate) === dateString;
    });

    week.push({
      day: currentDate.getDate(),
      dateString,
      isCurrentMonth: currentDate.getMonth() === month,
      tasks: dayEvents.map((event) => {
        // Normalize event properties to ensure consistent interface
        return {
          ...event,
          id: event.id || event._id,
          title: event.title,
          status: event.status || "upcoming",
          date: dateString,
          // Ensure we have a consistent date property for display
          displayDate:
            event.date ||
            (event.scheduleDate
              ? toLocaleDateStringISO(new Date(event.scheduleDate))
              : dateString),
        };
      }),
    });

    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }

  return grid;
}
