/**
 * Permission Utils Tests
 *
 * Tests for the permission checking system.
 */

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
} from '../src/utils/permissionUtils';

// Mock the logger
jest.mock('../src/utils/logger', () => ({
  default: {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock ROLE_PERMISSIONS
jest.mock('../src/lib/constants', () => ({
  ROLE_PERMISSIONS: {
    ADMIN: [
      'view_resources',
      'create_resource',
      'edit_resource',
      'delete_resource',
      'view_tasks',
      'create_task',
      'edit_task',
      'delete_task',
      'manage_users',
      'view_analytics',
    ],
    PIO: [
      'view_resources',
      'create_resource',
      'edit_resource',
      'view_tasks',
      'create_task',
      'view_analytics',
    ],
    STUDENT: [
      'view_resources',
      'view_tasks',
      'update_task_status',
    ],
  },
}));

describe('Permission Utils', () => {
  // ==========================================
  // hasPermission
  // ==========================================
  describe('hasPermission', () => {
    it('should return true for admin with admin permission', () => {
      const user = { role: 'ADMIN' };
      expect(hasPermission(user, 'manage_users')).toBe(true);
    });

    it('should return true for admin with any permission', () => {
      const user = { role: 'ADMIN' };
      expect(hasPermission(user, 'view_resources')).toBe(true);
      expect(hasPermission(user, 'delete_task')).toBe(true);
    });

    it('should return false for student with admin-only permission', () => {
      const user = { role: 'STUDENT' };
      expect(hasPermission(user, 'manage_users')).toBe(false);
      expect(hasPermission(user, 'delete_task')).toBe(false);
    });

    it('should return true for student with student permission', () => {
      const user = { role: 'STUDENT' };
      expect(hasPermission(user, 'view_resources')).toBe(true);
      expect(hasPermission(user, 'view_tasks')).toBe(true);
    });

    it('should return true for PIO with PIO permission', () => {
      const user = { role: 'PIO' };
      expect(hasPermission(user, 'create_resource')).toBe(true);
      expect(hasPermission(user, 'view_analytics')).toBe(true);
    });

    it('should return false for PIO without admin-only permission', () => {
      const user = { role: 'PIO' };
      expect(hasPermission(user, 'manage_users')).toBe(false);
      expect(hasPermission(user, 'delete_task')).toBe(false);
    });

    it('should handle lowercase role names', () => {
      const user = { role: 'admin' };
      expect(hasPermission(user, 'manage_users')).toBe(true);
    });

    it('should handle mixed case role names', () => {
      const user = { role: 'Admin' };
      expect(hasPermission(user, 'manage_users')).toBe(true);
    });

    it('should return false for null user', () => {
      expect(hasPermission(null, 'view_resources')).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasPermission(undefined, 'view_resources')).toBe(false);
    });

    it('should return false for user without role', () => {
      const user = { email: 'test@example.com' };
      expect(hasPermission(user, 'view_resources')).toBe(false);
    });

    it('should return false for null permission', () => {
      const user = { role: 'ADMIN' };
      expect(hasPermission(user, null)).toBe(false);
    });

    it('should return false for undefined permission', () => {
      const user = { role: 'ADMIN' };
      expect(hasPermission(user, undefined)).toBe(false);
    });

    it('should return false for unknown role', () => {
      const user = { role: 'UNKNOWN' };
      expect(hasPermission(user, 'view_resources')).toBe(false);
    });

    it('should return false for permission not in any role', () => {
      const user = { role: 'ADMIN' };
      expect(hasPermission(user, 'nonexistent_permission')).toBe(false);
    });
  });

  // ==========================================
  // hasAnyPermission
  // ==========================================
  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      const user = { role: 'STUDENT' };
      const permissions = ['manage_users', 'view_resources'];
      expect(hasAnyPermission(user, permissions)).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const user = { role: 'STUDENT' };
      const permissions = ['manage_users', 'delete_task'];
      expect(hasAnyPermission(user, permissions)).toBe(false);
    });

    it('should return true if user has all of the permissions', () => {
      const user = { role: 'ADMIN' };
      const permissions = ['manage_users', 'delete_task'];
      expect(hasAnyPermission(user, permissions)).toBe(true);
    });

    it('should return false for empty permissions array', () => {
      const user = { role: 'ADMIN' };
      expect(hasAnyPermission(user, [])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasAnyPermission(null, ['view_resources'])).toBe(false);
    });

    it('should return false for user without role', () => {
      const user = { email: 'test@example.com' };
      expect(hasAnyPermission(user, ['view_resources'])).toBe(false);
    });

    it('should handle single permission', () => {
      const user = { role: 'STUDENT' };
      expect(hasAnyPermission(user, ['view_resources'])).toBe(true);
      expect(hasAnyPermission(user, ['manage_users'])).toBe(false);
    });
  });

  // ==========================================
  // hasAllPermissions
  // ==========================================
  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const user = { role: 'ADMIN' };
      const permissions = ['view_resources', 'manage_users'];
      expect(hasAllPermissions(user, permissions)).toBe(true);
    });

    it('should return false if user is missing one permission', () => {
      const user = { role: 'PIO' };
      const permissions = ['view_resources', 'manage_users'];
      expect(hasAllPermissions(user, permissions)).toBe(false);
    });

    it('should return true for single permission user has', () => {
      const user = { role: 'STUDENT' };
      expect(hasAllPermissions(user, ['view_resources'])).toBe(true);
    });

    it('should return false for single permission user lacks', () => {
      const user = { role: 'STUDENT' };
      expect(hasAllPermissions(user, ['manage_users'])).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      const user = { role: 'ADMIN' };
      expect(hasAllPermissions(user, [])).toBe(false);
    });

    it('should return false for null user', () => {
      expect(hasAllPermissions(null, ['view_resources'])).toBe(false);
    });

    it('should return false for user without role', () => {
      const user = { email: 'test@example.com' };
      expect(hasAllPermissions(user, ['view_resources'])).toBe(false);
    });
  });

  // ==========================================
  // getUserPermissions
  // ==========================================
  describe('getUserPermissions', () => {
    it('should return all admin permissions', () => {
      const user = { role: 'ADMIN' };
      const permissions = getUserPermissions(user);
      expect(permissions).toContain('manage_users');
      expect(permissions).toContain('view_resources');
      expect(permissions).toContain('delete_task');
      expect(permissions.length).toBe(10);
    });

    it('should return all PIO permissions', () => {
      const user = { role: 'PIO' };
      const permissions = getUserPermissions(user);
      expect(permissions).toContain('view_resources');
      expect(permissions).toContain('create_resource');
      expect(permissions).not.toContain('manage_users');
      expect(permissions.length).toBe(6);
    });

    it('should return all student permissions', () => {
      const user = { role: 'STUDENT' };
      const permissions = getUserPermissions(user);
      expect(permissions).toContain('view_resources');
      expect(permissions).toContain('view_tasks');
      expect(permissions).not.toContain('create_task');
      expect(permissions.length).toBe(3);
    });

    it('should handle lowercase role names', () => {
      const user = { role: 'student' };
      const permissions = getUserPermissions(user);
      expect(permissions.length).toBe(3);
    });

    it('should return empty array for null user', () => {
      expect(getUserPermissions(null)).toEqual([]);
    });

    it('should return empty array for user without role', () => {
      const user = { email: 'test@example.com' };
      expect(getUserPermissions(user)).toEqual([]);
    });

    it('should return empty array for unknown role', () => {
      const user = { role: 'UNKNOWN' };
      expect(getUserPermissions(user)).toEqual([]);
    });
  });

  // ==========================================
  // Role-based Access Scenarios
  // ==========================================
  describe('Role-based Access Scenarios', () => {
    it('admin should have full access to resources', () => {
      const admin = { role: 'ADMIN' };
      expect(hasPermission(admin, 'view_resources')).toBe(true);
      expect(hasPermission(admin, 'create_resource')).toBe(true);
      expect(hasPermission(admin, 'edit_resource')).toBe(true);
      expect(hasPermission(admin, 'delete_resource')).toBe(true);
    });

    it('PIO should have limited resource access', () => {
      const pio = { role: 'PIO' };
      expect(hasPermission(pio, 'view_resources')).toBe(true);
      expect(hasPermission(pio, 'create_resource')).toBe(true);
      expect(hasPermission(pio, 'edit_resource')).toBe(true);
      expect(hasPermission(pio, 'delete_resource')).toBe(false);
    });

    it('student should have read-only resource access', () => {
      const student = { role: 'STUDENT' };
      expect(hasPermission(student, 'view_resources')).toBe(true);
      expect(hasPermission(student, 'create_resource')).toBe(false);
      expect(hasPermission(student, 'edit_resource')).toBe(false);
      expect(hasPermission(student, 'delete_resource')).toBe(false);
    });

    it('only admin should manage users', () => {
      expect(hasPermission({ role: 'ADMIN' }, 'manage_users')).toBe(true);
      expect(hasPermission({ role: 'PIO' }, 'manage_users')).toBe(false);
      expect(hasPermission({ role: 'STUDENT' }, 'manage_users')).toBe(false);
    });
  });
});
