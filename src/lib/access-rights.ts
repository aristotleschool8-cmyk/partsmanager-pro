/**
 * Access Rights and Permission Management System for Admin Dashboard
 * 
 * Defines granular permissions for admin users, allowing control over:
 * - Dashboard access
 * - User management
 * - Analytics
 * - Reports
 * - Audit Logs
 * - System Settings
 * - Data Management
 * - Security
 * - Access Rights management
 */

/**
 * Granular access right for a specific admin page/feature
 */
export interface AdminAccessRight {
  view: boolean;
  edit?: boolean; // For settings pages that allow editing
}

/**
 * Complete access rights profile for an admin
 * Determines what admin dashboard pages and features they can access
 */
export interface AccessRightProfile {
  id: string;
  name: string;
  description: string;
  isTemplate: boolean; // true for predefined templates, false for custom profiles
  permissions: {
    dashboard: AdminAccessRight;
    users: AdminAccessRight & {
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
    analytics: AdminAccessRight;
    reports: AdminAccessRight;
    auditLogs: AdminAccessRight;
    systemSettings: AdminAccessRight;
    dataManagement: AdminAccessRight;
    security: AdminAccessRight;
    accessRights: AdminAccessRight & {
      create?: boolean;
      edit?: boolean;
      delete?: boolean;
    };
  };
  createdAt: any; // Timestamp
  createdBy: string; // Admin user ID who created this profile
  modifiedAt?: any; // Timestamp
  modifiedBy?: string; // Admin user ID who last modified
}

/**
 * Predefined access right templates
 */
export const ACCESS_RIGHT_TEMPLATES: Record<string, Omit<AccessRightProfile, 'id' | 'createdAt' | 'createdBy' | 'modifiedAt' | 'modifiedBy'>> = {
  'super-admin': {
    name: 'Super Admin',
    description: 'Full access to all admin features',
    isTemplate: true,
    permissions: {
      dashboard: { view: true },
      users: { view: true, create: true, edit: true, delete: true },
      analytics: { view: true },
      reports: { view: true },
      auditLogs: { view: true },
      systemSettings: { view: true, edit: true },
      dataManagement: { view: true },
      security: { view: true },
      accessRights: { view: true, create: true, edit: true, delete: true },
    },
  },
  'admin': {
    name: 'Admin',
    description: 'Full access to admin dashboard and user management',
    isTemplate: true,
    permissions: {
      dashboard: { view: true },
      users: { view: true, create: true, edit: true, delete: false },
      analytics: { view: true },
      reports: { view: true },
      auditLogs: { view: true },
      systemSettings: { view: true, edit: true },
      dataManagement: { view: true },
      security: { view: true },
      accessRights: { view: true, create: true, edit: true, delete: true },
    },
  },
  'manager': {
    name: 'Manager',
    description: 'Manage analytics, reports, and users (view only)',
    isTemplate: true,
    permissions: {
      dashboard: { view: true },
      users: { view: true, create: false, edit: false, delete: false },
      analytics: { view: true },
      reports: { view: true },
      auditLogs: { view: true },
      systemSettings: { view: false },
      dataManagement: { view: false },
      security: { view: false },
      accessRights: { view: false, create: false, edit: false, delete: false },
    },
  },
  'operator': {
    name: 'Operator',
    description: 'Limited access to analytics and audit logs',
    isTemplate: true,
    permissions: {
      dashboard: { view: true },
      users: { view: false, create: false, edit: false, delete: false },
      analytics: { view: true },
      reports: { view: false },
      auditLogs: { view: true },
      systemSettings: { view: false },
      dataManagement: { view: false },
      security: { view: false },
      accessRights: { view: false, create: false, edit: false, delete: false },
    },
  },
  'viewer': {
    name: 'Viewer',
    description: 'Read-only access to dashboard and reports',
    isTemplate: true,
    permissions: {
      dashboard: { view: true },
      users: { view: false, create: false, edit: false, delete: false },
      analytics: { view: true },
      reports: { view: true },
      auditLogs: { view: false },
      systemSettings: { view: false },
      dataManagement: { view: false },
      security: { view: false },
      accessRights: { view: false, create: false, edit: false, delete: false },
    },
  },
};

/**
 * Get all available access right templates + custom profiles
 */
export const getAllAccessRightTemplates = () => {
  return Object.entries(ACCESS_RIGHT_TEMPLATES).map(([id, template]) => ({
    id,
    ...template,
    createdAt: new Date(),
    createdBy: 'system',
  }));
};

/**
 * Get a specific template by ID
 */
export const getAccessRightTemplate = (templateId: string) => {
  return ACCESS_RIGHT_TEMPLATES[templateId];
};

/**
 * Check if an admin has permission for a specific action
 */
export const hasPermission = (
  accessRightProfile: AccessRightProfile | null,
  resource: keyof AccessRightProfile['permissions'],
  action: 'view' | 'edit' | 'create' | 'delete'
): boolean => {
  if (!accessRightProfile) return false;
  
  const permission = accessRightProfile.permissions[resource];
  if (!permission) return false;
  
  // Check if the action exists in the permission object
  if (action in permission) {
    return (permission as any)[action] === true;
  }
  
  return false;};