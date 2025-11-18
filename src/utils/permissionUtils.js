import logger from "@/utils/logger";
import { ROLE_PERMISSIONS } from "@/lib/constants";

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - The permission to check
 * @returns {boolean} - True if user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role || !permission) {
    logger.log(
      `hasPermission check failed: missing user, role, or permission`,
      {
        hasUser: !!user,
        hasRole: user ? !!user.role : false,
        permission,
      }
    );
    return false;
  }

  // Normalize role to uppercase for consistent lookup
  const normalizedRole = user.role.toUpperCase();
  const userPermissions = ROLE_PERMISSIONS[normalizedRole];

  if (!userPermissions) {
    logger.log(
      `hasPermission: No permissions found for role ${normalizedRole}`
    );
    return false;
  }

  const hasPermission = userPermissions.includes(permission);
  logger.log(
    `hasPermission: ${normalizedRole} checking for "${permission}": ${hasPermission}`,
    {
      availablePermissions: userPermissions,
    }
  );

  return hasPermission;
};

/**
 * Check if a user has any of the given permissions
 * @param {Object} user - User object with role property
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - True if user has any of the permissions
 */
export const hasAnyPermission = (user, permissions = []) => {
  if (!user || !user.role || !permissions.length) {
    logger.log(
      `hasAnyPermission check failed: missing user, role, or permissions`,
      {
        hasUser: !!user,
        hasRole: user ? !!user.role : false,
        permissions,
      }
    );
    return false;
  }

  const result = permissions.some((permission) =>
    hasPermission(user, permission)
  );
  logger.log(`hasAnyPermission result:`, result);
  return result;
};

/**
 * Check if a user has all of the given permissions
 * @param {Object} user - User object with role property
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean} - True if user has all of the permissions
 */
export const hasAllPermissions = (user, permissions = []) => {
  if (!user || !user.role || !permissions.length) {
    logger.log(
      `hasAllPermissions check failed: missing user, role, or permissions`,
      {
        hasUser: !!user,
        hasRole: user ? !!user.role : false,
        permissions,
      }
    );
    return false;
  }

  const result = permissions.every((permission) =>
    hasPermission(user, permission)
  );
  logger.log(
    `hasAllPermissions result for [${permissions.join(", ")}]:`,
    result
  );
  return result;
};

/**
 * Get all permissions for a specific user
 * @param {Object} user - User object with role property
 * @returns {Array} - Array of permission strings
 */
export const getUserPermissions = (user) => {
  if (!user || !user.role) {
    logger.log(`getUserPermissions: No user or role provided`, {
      hasUser: !!user,
      hasRole: user ? !!user.role : false,
    });
    return [];
  }

  // Normalize role to uppercase for consistent lookup
  const normalizedRole = user.role.toUpperCase();
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];

  logger.log(`getUserPermissions for role ${normalizedRole}:`, permissions);
  return permissions;
};
