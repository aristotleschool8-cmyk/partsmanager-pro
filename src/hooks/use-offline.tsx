/**
 * useOffline Hook - Detects online/offline status and triggers sync
 */

'use client';

import { useEffect, useState } from 'react';
import { Firestore } from 'firebase/firestore';
import { setupOfflineListener, startBackgroundSync, getSyncProgress } from '@/lib/sync-service';

interface UseOfflineProps {
  firestore?: Firestore;
  userId?: string;
  enabled?: boolean;
}

export function useOffline({ firestore, userId, enabled = true }: UseOfflineProps) {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine);
  const [syncProgress, setSyncProgress] = useState(getSyncProgress());

  useEffect(() => {
    if (!enabled) return;

    // Handle online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled]);

  // Setup automatic sync when coming back online
  useEffect(() => {
    if (!enabled || !firestore || !userId) return;

    if (isOnline) {
      // Start sync
      const cleanup = startBackgroundSync(firestore, userId, 30000);
      return cleanup;
    }
  }, [isOnline, firestore, userId, enabled]);

  // Poll sync progress
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSyncProgress(getSyncProgress());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return {
    isOnline,
    syncProgress,
  };
}
