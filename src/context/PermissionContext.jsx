import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions, 
  getUserPermissions 
} from '@/utils/permissionUtils';

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
    
    return {
      // Check for a single permission
      hasPermission: (permission) => hasPermission(user, permission),
      
      // Check if user has any of the provided permissions
      hasAnyPermission: (permissions) => hasAnyPermission(user, permissions),
      
      // Check if user has all of the provided permissions
      hasAllPermissions: (permissions) => hasAllPermissions(user, permissions),
      
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
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  
  return context;
}; 