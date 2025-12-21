'use client';

import { useEffect, useState, useCallback } from 'react';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc } from 'firebase/firestore';
import { AccessRightProfile } from '@/lib/access-rights';
import { ACCESS_RIGHT_TEMPLATES } from '@/lib/access-rights';
import { User as AppUser } from '@/lib/types';

/**
 * Hook to fetch and manage the current admin's access rights
 * Used to control what pages, features, and actions are available to them
 */
export function useAdminAccessRights() {
  const { user, firestore } = useFirebase();
  const [accessRights, setAccessRights] = useState<AccessRightProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch access rights when user changes
  useEffect(() => {
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, get the user document to find their access right ID
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!isMounted) return;

        if (!userDocSnap.exists()) {
          setError('User document not found');
          setIsLoading(false);
          return;
        }

        const userData = userDocSnap.data() as AppUser;

        // If no access right ID, use default based on role
        if (!userData.accessRightId) {
          // Default access rights based on role
          if (userData.role === 'admin') {
            const adminTemplate = ACCESS_RIGHT_TEMPLATES['admin'];
            setAccessRights({
              id: 'default-admin',
              ...adminTemplate,
              createdAt: new Date(),
              createdBy: 'system',
            } as AccessRightProfile);
          } else {
            setError('User is not an admin');
          }
          setIsLoading(false);
          return;
        }

        // Fetch the specific access right profile
        const accessRightDocRef = doc(firestore, 'accessRights', userData.accessRightId);
        const accessRightDocSnap = await getDoc(accessRightDocRef);

        if (!isMounted) return;

        if (accessRightDocSnap.exists()) {
          const accessRightData = accessRightDocSnap.data() as AccessRightProfile;
          setAccessRights(accessRightData);
        } else {
          setError('Access right profile not found');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch access rights');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user, firestore]);

  /**
   * Check if admin can view a specific resource
   */
  const canView = useCallback((resource: keyof AccessRightProfile['permissions']): boolean => {
    if (!accessRights) return false;
    const permission = accessRights.permissions[resource];
    return permission && 'view' in permission ? permission.view : false;
  }, [accessRights]);

  /**
   * Check if admin can create a specific resource
   */
  const canCreate = useCallback((resource: keyof AccessRightProfile['permissions']): boolean => {
    if (!accessRights) return false;
    const permission = accessRights.permissions[resource];
    return permission && 'create' in permission ? permission.create : false;
  }, [accessRights]);

  /**
   * Check if admin can edit a specific resource
   */
  const canEdit = useCallback((resource: keyof AccessRightProfile['permissions']): boolean => {
    if (!accessRights) return false;
    const permission = accessRights.permissions[resource];
    return permission && 'edit' in permission ? permission.edit : false;
  }, [accessRights]);

  /**
   * Check if admin can delete a specific resource
   */
  const canDelete = useCallback((resource: keyof AccessRightProfile['permissions']): boolean => {
    if (!accessRights) return false;
    const permission = accessRights.permissions[resource];
    return permission && 'delete' in permission ? permission.delete : false;
  }, [accessRights]);

  /**
   * Check multiple specific permissions at once
   */
  const hasPermission = useCallback(
    (resource: keyof AccessRightProfile['permissions'], actions: ('view' | 'create' | 'edit' | 'delete')[]): boolean => {
      if (!accessRights) return false;
      const permission = accessRights.permissions[resource];
      if (!permission) return false;

      return actions.every(action => {
        if (!(action in permission)) return false;
        return (permission as Record<string, boolean>)[action] === true;
      });
    },
    [accessRights]
  );

  return {
    accessRights,
    isLoading,
    error,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasPermission,
  };
}
