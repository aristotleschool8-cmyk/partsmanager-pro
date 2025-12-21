'use client';

import { useAdminAccessRights } from '@/hooks/use-admin-access-rights';
import { Loader2, Lock } from 'lucide-react';
import { AccessRightProfile } from '@/lib/access-rights';

interface PageAccessGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof AccessRightProfile['permissions'];
  requiredActions?: ('view' | 'create' | 'edit' | 'delete')[];
  fallback?: React.ReactNode;
}

/**
 * Component that wraps a page and checks if the admin has required permissions
 * Shows "Not Authorized" if they don't have access
 */
export function PageAccessGuard({
  children,
  requiredPermission,
  requiredActions = ['view'],
  fallback,
}: PageAccessGuardProps) {
  const { accessRights, isLoading, canView, hasPermission } = useAdminAccessRights();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If no specific permission required, allow access
  if (!requiredPermission) {
    return <>{children}</>;
  }

  // Check if user has required permission
  const hasAccess = hasPermission(requiredPermission, requiredActions);

  if (!hasAccess) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
            <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              You don't have permission to access this page. Contact your administrator if you believe this is an error.
            </p>
            <p className="text-xs text-muted-foreground">
              Required: {requiredActions.join(', ')} access to {requiredPermission}
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
