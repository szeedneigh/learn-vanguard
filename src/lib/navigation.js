import {
  Home,
  ListTodo,
  BookOpen,
  Calendar,
  Archive,
  Users
} from "lucide-react";
import { ROLES } from "./constants";

/**
 * Central navigation configuration for the application.
 * This is the single source of truth for all navigation-related data.
 * 
 * Each item includes:
 * - name: Display name for the navigation item
 * - href: Route path
 * - icon: Lucide icon component
 * - roles: Array of roles allowed to access this route
 * - description: Optional description for tooltips or accessibility
 */
export const navigationConfig = [
  { 
    name: "Home", 
    href: "/dashboard/home", 
    icon: Home, 
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    description: "Dashboard overview"
  },
  { 
    name: "Tasks", 
    href: "/dashboard/tasks", 
    icon: ListTodo, 
    roles: [ROLES.STUDENT, ROLES.PIO],
    description: "Manage and view tasks"
  },
  { 
    name: "Resources", 
    href: "/dashboard/resources", 
    icon: BookOpen, 
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    description: "Access learning materials"
  },
  { 
    name: "Events", 
    href: "/dashboard/events", 
    icon: Calendar, 
    roles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN],
    description: "Calendar and upcoming events"
  },
  { 
    name: "Archive", 
    href: "/dashboard/archive", 
    icon: Archive, 
    roles: [ROLES.STUDENT, ROLES.PIO],
    description: "Access archived resources"
  },
  { 
    name: "Students", 
    href: "/dashboard/students", 
    icon: Users, 
    roles: [ROLES.PIO],
    description: "Manage student users"
  },
  { 
    name: "Users", 
    href: "/dashboard/users", 
    icon: Users, 
    roles: [ROLES.ADMIN],
    description: "Manage all system users"
  },
];

/**
 * Get navigation items filtered by user role
 * @param {Object} user - User object with role property
 * @returns {Array} - Filtered navigation items
 */
export const getNavigationByRole = (user) => {
  if (!user || !user.role) {
    return [];
  }
  
  return navigationConfig.filter(item => item.roles.includes(user.role));
};

/**
 * Route configuration for the dashboard
 * Maps routes to components and permissions
 */
export const dashboardRoutes = [
  { 
    path: "home", 
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN] 
  },
  { 
    path: "tasks", 
    allowedRoles: [ROLES.STUDENT, ROLES.PIO] 
  },
  { 
    path: "resources", 
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN] 
  },
  { 
    path: "events", 
    allowedRoles: [ROLES.STUDENT, ROLES.PIO, ROLES.ADMIN] 
  },
  { 
    path: "archive", 
    allowedRoles: [ROLES.STUDENT, ROLES.PIO] 
  },
  { 
    path: "students", 
    allowedRoles: [ROLES.PIO] 
  },
  { 
    path: "users", 
    allowedRoles: [ROLES.ADMIN] 
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
  
  const route = dashboardRoutes.find(route => route.path === path);
  if (!route) {
    return false;
  }
  
  return route.allowedRoles.includes(user.role);
}; 