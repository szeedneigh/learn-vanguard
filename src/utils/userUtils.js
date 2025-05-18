/**
 * User-related utility functions for the application
 */

/**
 * Extracts initials from a user's full name
 * @param {string} name - User's full name
 * @returns {string} - One or two character initials
 * @example
 * // Returns "JD"
 * getUserInitials("John Doe")
 * // Returns "J"
 * getUserInitials("John")
 * // Returns "?"
 * getUserInitials("")
 */
export const getUserInitials = (name) => {
  if (!name) return "?";
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
};

/**
 * Formats a user role for display
 * @param {string} role - User role (typically uppercase)
 * @returns {string} - Formatted role for display (capitalized)
 * @example
 * // Returns "Admin"
 * formatUserRole("ADMIN")
 */
export const formatUserRole = (role) => {
  if (!role) return '';
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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