/**
 * Centralized Constants
 * All magic numbers and commonly used strings should be defined here
 */

// ==================================
// API Configuration
// ==================================
export const API_CONFIG = {
  // Timeout for API requests (30 seconds)
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // 1 second base delay for exponential backoff

  // Rate limiting
  RATE_LIMIT_PER_MINUTE: 100,
  UPLOAD_RATE_LIMIT_PER_MINUTE: 20,
};

// ==================================
// React Query Configuration
// ==================================
export const QUERY_CONFIG = {
  // Default stale time (5 minutes)
  DEFAULT_STALE_TIME: 5 * 60 * 1000,

  // Short stale time for frequently changing data (30 seconds)
  SHORT_STALE_TIME: 30 * 1000,

  // Long stale time for rarely changing data (30 minutes)
  LONG_STALE_TIME: 30 * 60 * 1000,

  // Cache time (10 minutes)
  DEFAULT_CACHE_TIME: 10 * 60 * 1000,
};

// ==================================
// File Upload
// ==================================
export const FILE_UPLOAD = {
  // Maximum file size (10MB in bytes)
  MAX_SIZE: 10485760,

  // Common file size limits
  SIZE_5MB: 5242880,
  SIZE_10MB: 10485760,
  SIZE_20MB: 20971520,
  SIZE_50MB: 52428800,

  // Allowed file types
  ALLOWED_TYPES: [
    'pdf',
    'doc',
    'docx',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
    'txt',
    'jpg',
    'jpeg',
    'png',
    'gif',
  ],

  // MIME types
  MIME_TYPES: {
    PDF: 'application/pdf',
    DOC: 'application/msword',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    XLS: 'application/vnd.ms-excel',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    PPT: 'application/vnd.ms-powerpoint',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    TXT: 'text/plain',
    JPG: 'image/jpeg',
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    GIF: 'image/gif',
  },
};

// ==================================
// Form Validation
// ==================================
export const VALIDATION = {
  // Text field lengths
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_CONTENT_LENGTH: 5000,

  // Email domain restriction
  ALLOWED_EMAIL_DOMAIN: '@student.laverdad.edu.ph',
};

// ==================================
// Task Management
// ==================================
export const TASK_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.NOT_STARTED]: 'Not yet started',
  [TASK_STATUS.IN_PROGRESS]: 'In progress',
  [TASK_STATUS.COMPLETED]: 'Completed',
  [TASK_STATUS.OVERDUE]: 'Overdue',
  [TASK_STATUS.CANCELLED]: 'Cancelled',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
  [TASK_PRIORITY.URGENT]: 'Urgent',
};

// ==================================
// User Roles & Permissions
// ==================================
export const USER_ROLES = {
  ADMIN: 'admin',
  PIO: 'pio',
  STUDENT: 'student',
  GUEST: 'guest',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.PIO]: 'PIO Officer',
  [USER_ROLES.STUDENT]: 'Student',
  [USER_ROLES.GUEST]: 'Guest',
};

// ==================================
// Date & Time
// ==================================
export const DATE_FORMAT = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY h:mm A',
  ISO: 'YYYY-MM-DD',
  TIME: 'h:mm A',
  FULL: 'MMMM DD, YYYY h:mm:ss A',
};

export const TIME_UNITS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
};

// ==================================
// Local Storage Keys
// ==================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'userPreferences',
  RECENT_SEARCHES: 'recentSearches',
  DRAFT_PREFIX: 'draft_',
};

// ==================================
// Event Names
// ==================================
export const EVENTS = {
  AUTH_REQUIRED: 'auth:required',
  AUTH_REDIRECT_RESULT: 'auth:redirect-result',
  API_SERVER_ERROR: 'api:server-error',
  API_TIMEOUT: 'api:timeout',
  API_NETWORK_ERROR: 'api:network-error',
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  RESOURCE_UPLOADED: 'resource:uploaded',
};

// ==================================
// HTTP Status Codes
// ==================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// ==================================
// Pagination
// ==================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

// ==================================
// UI Constants
// ==================================
export const UI = {
  // Debounce delays
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_INPUT: 500,

  // Animation durations (milliseconds)
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,

  // Toast notification duration
  TOAST_DURATION: 3000,
  TOAST_ERROR_DURATION: 5000,

  // Modal z-index
  MODAL_Z_INDEX: 1000,
  TOOLTIP_Z_INDEX: 1100,

  // Breakpoints (pixels)
  BREAKPOINT_MOBILE: 640,
  BREAKPOINT_TABLET: 768,
  BREAKPOINT_DESKTOP: 1024,
  BREAKPOINT_WIDE: 1280,
};

// ==================================
// Error Messages
// ==================================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// ==================================
// Success Messages
// ==================================
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully',
  TASK_UPDATED: 'Task updated successfully',
  TASK_DELETED: 'Task deleted successfully',
  RESOURCE_UPLOADED: 'Resource uploaded successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
};

// ==================================
// Regular Expressions
// ==================================
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,

  // Password must contain at least one uppercase, lowercase, and number
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};

// ==================================
// Firebase Error Codes
// ==================================
export const FIREBASE_ERRORS = {
  POPUP_BLOCKED: 'auth/popup-blocked',
  POPUP_CLOSED: 'auth/popup-closed-by-user',
  ACCOUNT_EXISTS: 'auth/account-exists-with-different-credential',
  INVALID_EMAIL: 'auth/invalid-email',
  USER_DISABLED: 'auth/user-disabled',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  WEAK_PASSWORD: 'auth/weak-password',
  EMAIL_IN_USE: 'auth/email-already-in-use',
};

// ==================================
// Export all as default object
// ==================================
export default {
  API_CONFIG,
  QUERY_CONFIG,
  FILE_UPLOAD,
  VALIDATION,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY,
  TASK_PRIORITY_LABELS,
  USER_ROLES,
  USER_ROLE_LABELS,
  DATE_FORMAT,
  TIME_UNITS,
  STORAGE_KEYS,
  EVENTS,
  HTTP_STATUS,
  PAGINATION,
  UI,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
  FIREBASE_ERRORS,
};
