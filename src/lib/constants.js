export const ROLES = {
  STUDENT: "STUDENT",
  PIO: "PIO",
  ADMIN: "ADMIN",
};

/**
 * Permission constants for specific actions
 */
export const PERMISSIONS = {
  // Resource permissions
  VIEW_RESOURCES: "VIEW_RESOURCES",
  CREATE_RESOURCE: "CREATE_RESOURCE",
  EDIT_RESOURCE: "EDIT_RESOURCE",
  DELETE_RESOURCE: "DELETE_RESOURCE",
  UPLOAD_LECTURES: "UPLOAD_LECTURES",
  DELETE_LECTURES: "DELETE_LECTURES",

  // Task permissions
  VIEW_TASKS: "VIEW_TASKS",
  CREATE_TASK: "CREATE_TASK",
  EDIT_TASK: "EDIT_TASK",
  DELETE_TASK: "DELETE_TASK",
  ASSIGN_TASK: "ASSIGN_TASK",
  COMPLETE_TASK: "COMPLETE_TASK",

  // Event permissions
  VIEW_EVENTS: "VIEW_EVENTS",
  CREATE_EVENT: "CREATE_EVENT",
  EDIT_EVENT: "EDIT_EVENT",
  DELETE_EVENT: "DELETE_EVENT",

  // Archive permissions
  VIEW_ARCHIVE: "VIEW_ARCHIVE",
  MANAGE_ARCHIVE: "MANAGE_ARCHIVE",

  // User permissions
  VIEW_USERS: "VIEW_USERS",
  CREATE_USER: "CREATE_USER",
  EDIT_USER: "EDIT_USER",
  DELETE_USER: "DELETE_USER",
  ASSIGN_ROLES: "ASSIGN_ROLES",

  // Student permissions
  VIEW_STUDENTS: "VIEW_STUDENTS",
  MANAGE_STUDENTS: "MANAGE_STUDENTS",

  // Subject and announcement permissions
  CREATE_SUBJECT: "CREATE_SUBJECT",
  DELETE_SUBJECT: "DELETE_SUBJECT",
  ANNOUNCE_SUBJECT: "ANNOUNCE_SUBJECT",

  // System permissions
  MANAGE_SYSTEM: "MANAGE_SYSTEM",
};

/**
 * Role-based permissions matrix
 * Maps each role to its allowed permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Resource permissions - full access
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.CREATE_RESOURCE,
    PERMISSIONS.EDIT_RESOURCE,
    PERMISSIONS.DELETE_RESOURCE,
    PERMISSIONS.UPLOAD_LECTURES,
    PERMISSIONS.DELETE_LECTURES,

    // Task permissions - full access (admin can see all tasks across courses)
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.ASSIGN_TASK,

    // Event permissions - full access
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.CREATE_EVENT,
    PERMISSIONS.EDIT_EVENT,
    PERMISSIONS.DELETE_EVENT,

    // Archive permissions - full access
    PERMISSIONS.VIEW_ARCHIVE,
    PERMISSIONS.MANAGE_ARCHIVE,

    // User management - full access
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.ASSIGN_ROLES,

    // Student management
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_STUDENTS,

    // Subject management
    PERMISSIONS.CREATE_SUBJECT,
    PERMISSIONS.DELETE_SUBJECT,
    PERMISSIONS.ANNOUNCE_SUBJECT,

    // System management
    PERMISSIONS.MANAGE_SYSTEM,
  ],

  [ROLES.PIO]: [
    // Resource permissions
    PERMISSIONS.VIEW_RESOURCES,
    PERMISSIONS.CREATE_RESOURCE,
    PERMISSIONS.EDIT_RESOURCE,
    PERMISSIONS.UPLOAD_LECTURES,
    PERMISSIONS.DELETE_LECTURES,

    // Task permissions
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.CREATE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,
    PERMISSIONS.ASSIGN_TASK,

    // Event permissions
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.CREATE_EVENT,
    PERMISSIONS.EDIT_EVENT,
    PERMISSIONS.DELETE_EVENT,

    // Archive permissions
    PERMISSIONS.VIEW_ARCHIVE,
    PERMISSIONS.MANAGE_ARCHIVE,

    // Student management
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.MANAGE_STUDENTS,

    // Subject management
    PERMISSIONS.CREATE_SUBJECT,
    PERMISSIONS.DELETE_SUBJECT,
    PERMISSIONS.ANNOUNCE_SUBJECT,
  ],

  [ROLES.STUDENT]: [
    // Resource permissions - read only
    PERMISSIONS.VIEW_RESOURCES,

    // Task permissions - limited
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.COMPLETE_TASK,
    PERMISSIONS.EDIT_TASK,
    PERMISSIONS.DELETE_TASK,

    // Event permissions - read only
    PERMISSIONS.VIEW_EVENTS,

    // Archive permissions - read only
    PERMISSIONS.VIEW_ARCHIVE,
    PERMISSIONS.MANAGE_ARCHIVE,
  ],
};

/**
 * Feature flags to enable/disable specific functionality
 */
export const FEATURES = {
  ANALYTICS_DASHBOARD: true,
  TASK_NOTIFICATIONS: true,
  RESOURCE_RATINGS: false,
  ADVANCED_SEARCH: true,
};

/**
 * Programs data for the application
 */
export const programsData = [
  { id: "bsis", name: "Bachelor of Science in Information Systems", years: 4 },
  { id: "act", name: "Associate in Computer Technology", years: 2 },
];
