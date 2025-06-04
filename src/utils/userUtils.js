/**
 * User-related utility functions for the application
 */

/**
 * Get user initials from name
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} fallbackName - Fallback full name if firstName and lastName are not provided
 * @returns {string} User initials (max 2 characters)
 */
export const getUserInitials = (firstName, lastName, fallbackName) => {
  // If firstName and lastName are provided, use them
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  // If only firstName is provided
  if (firstName && !lastName) {
    return firstName.charAt(0).toUpperCase();
  }

  // If only lastName is provided
  if (!firstName && lastName) {
    return lastName.charAt(0).toUpperCase();
  }

  // Use fallbackName if provided
  if (fallbackName) {
    const nameParts = fallbackName.split(" ").filter((part) => part.length > 0);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
  }

  // Default return if no name data is available
  return "U";
};

/**
 * Format user role for display
 * @param {string} role - User role
 * @returns {string} Formatted role
 */
export const formatUserRole = (role) => {
  if (!role) return "User";

  switch (role.toLowerCase()) {
    case "admin":
      return "Administrator";
    case "pio":
      return "Public Information Officer";
    case "student":
      return "Student";
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
};

/**
 * Checks if a user has a specific permission based on their role
 * @param {Object} user - User object with role property
 * @param {Array<string>} allowedRoles - Array of roles that have permission
 * @returns {boolean} - True if user has permission
 * @example
 * // Returns true if user.role is "ADMIN" or "PIO"
 * hasPermission(user, ["ADMIN", "PIO"])
 */
export const hasPermission = (user, allowedRoles) => {
  if (!user || !user.role || !allowedRoles) {
    return false;
  }

  return allowedRoles.includes(user.role);
};
