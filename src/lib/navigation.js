import {
  Home,
  ListTodo,
  BookOpen,
  Calendar,
  Archive,
  Users,
} from "lucide-react";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "./constants";

/**
 * Central navigation configuration for the application.
 * This is the single source of truth for all navigation-related data.
 *
 * Each item includes:
 * - name: Display name for the navigation item
 * - href: Route path
 * - icon: Lucide icon component
 * - roles: Array of roles allowed to access this route
 * - permissions: Array of permissions required to access this route
 * - description: Optional description for tooltips or accessibility
 */
export const navigationConfig = [
  {
    name: "Home",
    href: "/dashboard/home",
    icon: Home,
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    description: "Dashboard overview",
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: ListTodo,
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    permissions: [PERMISSIONS.VIEW_TASKS],
    description: "Manage and view tasks",
  },
  {
    name: "Resources",
    href: "/dashboard/resources",
    icon: BookOpen,
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    permissions: [PERMISSIONS.VIEW_RESOURCES],
    description: "Access learning materials",
  },
  {
    name: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    permissions: [PERMISSIONS.VIEW_EVENTS],
    description: "Calendar and upcoming events",
  },
  {
    name: "Archive",
    href: "/dashboard/archive",
    icon: Archive,
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    permissions: [PERMISSIONS.VIEW_ARCHIVE],
    description: "Access archived resources",
  },
  {
    name: "Students",
    href: "/dashboard/students",
    icon: Users,
    roles: [ROLES.PIO],
    permissions: [PERMISSIONS.VIEW_STUDENTS],
    description: "Manage student users",
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: [ROLES.ADMIN],
    permissions: [PERMISSIONS.VIEW_USERS],
    description: "Manage all system users",
  },
];

/**
 * Get navigation items filtered by user role and permissions
 * @param {Object} user - User object with role property
 * @returns {Array} - Filtered navigation items
 */
export const getNavigationByRole = (user) => {
  if (!user || !user.role) {
    console.log("getNavigationByRole: No user or role provided");
    return [];
  }

  // Normalize user role to uppercase for consistent comparison
  const normalizedUserRole = user.role.toUpperCase();
  console.log("getNavigationByRole: User role normalized:", {
    original: user.role,
    normalized: normalizedUserRole,
  });

  return navigationConfig.filter((item) => {
    // Normalize item roles to uppercase for comparison
    const normalizedItemRoles = item.roles.map((role) => role.toUpperCase());

    // Check role access
    const hasRoleAccess = normalizedItemRoles.includes(normalizedUserRole);
    if (!hasRoleAccess) {
      console.log(`Navigation item ${item.name} denied: role mismatch`, {
        userRole: normalizedUserRole,
        allowedRoles: normalizedItemRoles,
      });
      return false;
    }

    // No permission check needed if permissions not specified
    if (!item.permissions) return true;

    // Check for permissions using the ROLE_PERMISSIONS mapping
    const userPermissions = ROLE_PERMISSIONS[normalizedUserRole] || [];
    const hasRequiredPermissions = item.permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasRequiredPermissions) {
      console.log(`Navigation item ${item.name} denied: missing permissions`, {
        requiredPermissions: item.permissions,
        userPermissions,
      });
    }

    return hasRequiredPermissions;
  });
};

/**
 * Route configuration for the dashboard
 * Maps routes to components and permissions
 */
export const dashboardRoutes = [
  {
    path: "home",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [],
  },
  {
    path: "tasks",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_TASKS],
  },
  {
    path: "resources",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_RESOURCES],
  },
  {
    path: "resources/topics/:topicId",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_RESOURCES],
  },
  {
    path: "resources/announcements/:announcementId",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_RESOURCES],
  },
  {
    path: "events",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_EVENTS],
  },
  {
    path: "archive",
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_ARCHIVE],
  },
  {
    path: "students",
    allowedRoles: [ROLES.PIO],
    requiredPermissions: [PERMISSIONS.VIEW_STUDENTS],
  },
  {
    path: "users",
    allowedRoles: [ROLES.ADMIN],
    requiredPermissions: [PERMISSIONS.VIEW_USERS],
  },
];

/**
 * Check if a user has permission to access a route
 * @param {Object} user - User object with role property
 * @param {string} path - Route path
 * @returns {boolean} - True if user has permission
 */
export const hasRoutePermission = (user, path) => {
  if (!user || !user.role) {
    return false;
  }

  const route = dashboardRoutes.find((route) => route.path === path);
  if (!route) {
    return false;
  }

  // Normalize roles for case-insensitive comparison
  const normalizedUserRole = user.role.toUpperCase();
  const normalizedRouteRoles = route.allowedRoles.map((role) =>
    role.toUpperCase()
  );

  // First check role-based access
  const hasRoleAccess = normalizedRouteRoles.includes(normalizedUserRole);
  if (!hasRoleAccess) {
    return false;
  }

  // If no required permissions, role access is sufficient
  if (!route.requiredPermissions || route.requiredPermissions.length === 0) {
    return true;
  }

  // Check required permissions
  const userPermissions = ROLE_PERMISSIONS[normalizedUserRole] || [];
  return route.requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
};
