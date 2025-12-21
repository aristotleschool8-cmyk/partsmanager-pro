/**
 * Access Rights and Permission Management System
 * 
 * Defines granular permissions for admin users, allowing control over:
 * - User management (view, create, edit, delete, manage roles, manage subscriptions)
 * - Inventory management (products, suppliers, customers)
 * - Sales & Purchases (view, create, edit, delete)
 * - Invoices (view, create, edit, delete)
 * - Settings (view, edit)
 * - Access Rights management (view, create, edit, delete)
 */

/**
 * Granular access right for a specific resource
 */
export interface AccessRight {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

/**
 * Granular access right for settings (no create/delete)
 */
export interface SettingsAccessRight {
  view: boolean;
  edit: boolean;
}

/**
 * Complete access rights profile for an admin
 * Determines what operations they can perform across the system
 */
export interface AccessRightProfile {
  id: string;
  name: string;
  description: string;
  isTemplate: boolean; // true for predefined templates, false for custom profiles
  permissions: {
    users: AccessRight & {
      manageRoles: boolean;
      manageSubscriptions: boolean;
      manageSuspension: boolean;
    };
    products: AccessRight;
    suppliers: AccessRight;
    customers: AccessRight;
    sales: AccessRight;
    purchases: AccessRight;
    invoices: AccessRight;
    settings: SettingsAccessRight;
    accessRights: AccessRight;
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
    description: 'Full access to all features and user management',
    isTemplate: true,
    permissions: {
      users: {
        view: true,
        create: true,
        edit: true,
        delete: true,
        manageRoles: true,
        manageSubscriptions: true,
        manageSuspension: true,
      },
      products: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      suppliers: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      customers: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      sales: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      purchases: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      invoices: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      settings: {
        view: true,
        edit: true,
      },
      accessRights: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
    },
  },
  'admin': {
    name: 'Admin',
    description: 'Full access to business operations and user management',
    isTemplate: true,
    permissions: {
      users: {
        view: true,
        create: true,
        edit: true,
        delete: false,
        manageRoles: false,
        manageSubscriptions: true,
        manageSuspension: true,
      },
      products: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      suppliers: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      customers: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      sales: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      purchases: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      invoices: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      settings: {
        view: true,
        edit: true,
      },
      accessRights: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
    },
  },
  'manager': {
    name: 'Manager',
    description: 'Manage business operations but no user management',
    isTemplate: true,
    permissions: {
      users: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        manageRoles: false,
        manageSubscriptions: false,
        manageSuspension: false,
      },
      products: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      suppliers: {
        view: true,
        create: true,
        edit: true,
        delete: false,
      },
      customers: {
        view: true,
        create: true,
        edit: true,
        delete: false,
      },
      sales: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      purchases: {
        view: true,
        create: true,
        edit: true,
        delete: true,
      },
      invoices: {
        view: true,
        create: true,
        edit: true,
        delete: false,
      },
      settings: {
        view: true,
        edit: false,
      },
      accessRights: {
        view: false,
        create: false,
        edit: false,
        delete: false,
      },
    },
  },
  'operator': {
    name: 'Operator',
    description: 'Limited access to sales and inventory operations',
    isTemplate: true,
    permissions: {
      users: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        manageRoles: false,
        manageSubscriptions: false,
        manageSuspension: false,
      },
      products: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      suppliers: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      customers: {
        view: true,
        create: true,
        edit: true,
        delete: false,
      },
      sales: {
        view: true,
        create: true,
        edit: true,
        delete: false,
      },
      purchases: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      invoices: {
        view: true,
        create: true,
        edit: false,
        delete: false,
      },
      settings: {
        view: true,
        edit: false,
      },
      accessRights: {
        view: false,
        create: false,
        edit: false,
        delete: false,
      },
    },
  },
  'viewer': {
    name: 'Viewer',
    description: 'Read-only access to all data',
    isTemplate: true,
    permissions: {
      users: {
        view: true,
        create: false,
        edit: false,
        delete: false,
        manageRoles: false,
        manageSubscriptions: false,
        manageSuspension: false,
      },
      products: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      suppliers: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      customers: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      sales: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      purchases: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      invoices: {
        view: true,
        create: false,
        edit: false,
        delete: false,
      },
      settings: {
        view: true,
        edit: false,
      },
      accessRights: {
        view: false,
        create: false,
        edit: false,
        delete: false,
      },
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
  action: 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  if (!accessRightProfile) return false;
  
  const permission = accessRightProfile.permissions[resource];
  if (!permission) return false;
  
  // For settings resource (which only has view and edit)
  if (resource === 'settings') {
    if (action === 'view' || action === 'edit') {
      return (permission as SettingsAccessRight)[action] === true;
    }
    return false;
  }
  
  // For regular resources
  return (permission as AccessRight)[action] === true;
};

/**
 * Check if an admin has special user management permissions
 */
export const hasUserPermission = (
  accessRightProfile: AccessRightProfile | null,
  action: 'manageRoles' | 'manageSubscriptions' | 'manageSuspension' | 'view' | 'create' | 'edit' | 'delete'
): boolean => {
  if (!accessRightProfile) return false;
  
  const userPermission = accessRightProfile.permissions.users;
  return userPermission[action] === true;
};

/**
 * Check if an admin can manage access rights
 */
export const canManageAccessRights = (accessRightProfile: AccessRightProfile | null): boolean => {
  if (!accessRightProfile) return false;
  return accessRightProfile.permissions.accessRights.view === true;
};
