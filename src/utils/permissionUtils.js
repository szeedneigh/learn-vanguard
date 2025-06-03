import { ROLE_PERMISSIONS } from '@/lib/constants';

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role || !permission) {
    return false;
  }
  
  const userPermissions = ROLE_PERMISSIONS[user.role];
  if (!userPermissions) {
    return false;
  }
  
  return userPermissions.includes(permission);
};

/**
 * Check if a user has any of the given permissions
 * @param {Object} user - User object with role property
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - True if user has any of the permissions
 */
export const hasAnyPermission = (user, permissions = []) => {
  if (!user || !user.role || !permissions.length) {
    return false;
  }
  
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if a user has all of the given permissions
 * @param {Object} user - User object with role property
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - True if user has all of the permissions
 */
export const hasAllPermissions = (user, permissions = []) => {
  if (!user || !user.role || !permissions.length) {
    return false;
  }
  
  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all permissions for a specific user
 * @param {Object} user - User object with role property
 * @returns {Array} - Array of permission strings
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) {
    return [];
  }
  
  return ROLE_PERMISSIONS[user.role] || [];
}; 