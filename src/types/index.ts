/**
 * Core Type Definitions
 *
 * Centralized TypeScript types for the application.
 * These types can be used across the codebase for type safety.
 */

// ==========================================
// User & Authentication Types
// ==========================================

export type UserRole = 'ADMIN' | 'PIO' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  assignedClass?: string;
  profileImage?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  details?: ValidationError[];
  needsRegistration?: boolean;
  idToken?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  statusCode: number | null;
  metadata?: ApiMetadata | null;
}

export interface ApiMetadata {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: ApiMetadata;
}

// ==========================================
// Task Types
// ==========================================

export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedTo?: string[];
  createdBy: string;
  course?: string;
  subject?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  course?: string;
  subject?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  notStarted: number;
}

// ==========================================
// Resource Types
// ==========================================

export type ResourceType = 'document' | 'video' | 'image' | 'link' | 'other';

export interface Resource {
  id: string;
  title: string;
  description?: string;
  type: ResourceType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  subject?: string;
  topic?: string;
  uploadedBy: string;
  downloadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceFilters {
  type?: ResourceType;
  subject?: string;
  topic?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// Event Types
// ==========================================

export type EventType = 'academic' | 'social' | 'meeting' | 'deadline' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location?: string;
  isAllDay?: boolean;
  attendees?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  type?: EventType;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ==========================================
// Announcement Types
// ==========================================

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetAudience?: UserRole[];
  isPinned?: boolean;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// Notification Types
// ==========================================

export type NotificationType = 'task' | 'event' | 'announcement' | 'system' | 'message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ==========================================
// File & Attachment Types
// ==========================================

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

// ==========================================
// Form & Validation Types
// ==========================================

export type ValidatorFunction = (value: unknown, allValues?: Record<string, unknown>) => string | null;

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  validators?: ValidatorFunction[];
  placeholder?: string;
  defaultValue?: unknown;
}

export interface FormErrors {
  [fieldName: string]: string | undefined;
}

// ==========================================
// Permission Types
// ==========================================

export type Permission =
  | 'view_resources'
  | 'create_resource'
  | 'edit_resource'
  | 'delete_resource'
  | 'view_tasks'
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'assign_task'
  | 'view_events'
  | 'create_event'
  | 'edit_event'
  | 'delete_event'
  | 'view_announcements'
  | 'create_announcement'
  | 'edit_announcement'
  | 'delete_announcement'
  | 'manage_users'
  | 'view_analytics'
  | 'upload_lectures'
  | 'delete_lectures';

export interface RolePermissions {
  ADMIN: Permission[];
  PIO: Permission[];
  STUDENT: Permission[];
}

// ==========================================
// Navigation Types
// ==========================================

export interface NavRoute {
  path: string;
  label: string;
  icon?: React.ComponentType;
  allowedRoles: UserRole[];
  requiredPermissions?: Permission[];
  children?: NavRoute[];
}

// ==========================================
// Query Types
// ==========================================

export interface QueryConfig {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number;
}

// ==========================================
// Storage Types
// ==========================================

export interface StorageOptions {
  persistent?: boolean;
  expiresIn?: number;
}

export interface StoredData<T> {
  value: T;
  timestamp: number;
  expiresAt: number | null;
}

// ==========================================
// Logger Types
// ==========================================

export type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  debug: boolean;
  log: boolean;
  info: boolean;
  warn: boolean;
  error: boolean;
}

// ==========================================
// WebSocket Types
// ==========================================

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

// ==========================================
// Utility Types
// ==========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface KeyValue<T = string> {
  key: string;
  value: T;
}

export type AsyncFunction<T = unknown, R = unknown> = (args: T) => Promise<R>;

// Re-export for convenience
export type { React } from 'react';
