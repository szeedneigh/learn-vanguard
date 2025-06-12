import { createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";
import { useAuth } from "./AuthContext";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
} from "@/utils/permissionUtils";

// Create the permission context
export const PermissionContext = createContext({
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  permissions: [],
});

/**
 * Permission provider component
 * Provides permission checking capabilities throughout the application
 */
export const PermissionProvider = ({ children }) => {
  const { user } = useAuth();

  // Memoize permission values to prevent unnecessary re-renders
  const value = useMemo(() => {
    const permissions = getUserPermissions(user);

    console.log("PermissionProvider: Calculating permissions", {
      user: user ? { role: user.role, id: user.id } : "No user",
      permissions,
    });

    return {
      // Check for a single permission
      hasPermission: (permission) => {
        const result = hasPermission(user, permission);
        console.log(`Permission check for "${permission}":`, result);
        return result;
      },

      // Check if user has any of the provided permissions
      hasAnyPermission: (permissions) => {
        const result = hasAnyPermission(user, permissions);
        console.log(
          `Any permission check for [${permissions.join(", ")}]:`,
          result
        );
        return result;
      },

      // Check if user has all of the provided permissions
      hasAllPermissions: (permissions) => {
        const result = hasAllPermissions(user, permissions);
        console.log(
          `All permissions check for [${permissions.join(", ")}]:`,
          result
        );
        return result;
      },

      // List of permissions the current user has
      permissions,
    };
  }, [user]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

PermissionProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for using permissions
 * @returns {Object} Permission utilities
 */
export const usePermission = () => {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }

  return context;
};
