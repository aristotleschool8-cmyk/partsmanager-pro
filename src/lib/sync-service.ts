/**
 * Sync Service - Manages background synchronization to Firebase
 * Handles retry logic, throttling, and error recovery
 */

import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
  getUnsyncedItems,
  markAsSynced,
  deleteSyncQueueItem,
} from './indexeddb';

interface SyncItem {
  id: string;
  collectionName: string;
  docId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  synced: boolean;
  attempts: number;
  userId: string;
}

interface SyncProgress {
  totalItems: number;
  syncedItems: number;
  failedItems: number;
  inProgress: boolean;
  lastError?: string;
}

// Global sync state
let syncProgress: SyncProgress = {
  totalItems: 0,
  syncedItems: 0,
  failedItems: 0,
  inProgress: false,
};

// Sync callbacks for UI updates
let syncProgressCallback: ((progress: SyncProgress) => void) | null = null;

/**
 * Register callback for sync progress updates
 */
export function onSyncProgress(callback: (progress: SyncProgress) => void) {
  syncProgressCallback = callback;
}

/**
 * Force reset sync state (emergency recovery)
 */
export function resetSyncState(): void {
  console.warn('[Sync] Force resetting sync state');
  syncProgress.inProgress = false;
  syncProgress.syncedItems = 0;
  syncProgress.failedItems = 0;
  syncProgress.totalItems = 0;
  syncProgress.lastError = undefined;
  updateProgress();
}
/**
 * Get current sync progress
 */
export function getSyncProgress(): SyncProgress {
  return { ...syncProgress };
}

/**
 * Sync all pending changes to Firebase
 */
export async function syncToFirebase(
  firestore: Firestore,
  userId: string
): Promise<{ success: number; failed: number }> {
  // Prevent concurrent syncs
  if (syncProgress.inProgress) {
    console.log('Sync already in progress, skipping');
    return { success: 0, failed: 0 };
  }

  syncProgress.inProgress = true;
  syncProgress.syncedItems = 0;
  syncProgress.failedItems = 0;
  let startTime = Date.now();
  const MAX_SYNC_TIME = 5 * 60 * 1000; // 5 minute timeout

  try {
    console.log(`[Sync] Starting sync for user ${userId}`);
    
    let items: SyncItem[] = [];
    try {
      items = await getUnsyncedItems(userId);
    } catch (err) {
      console.error('[Sync] Error getting unsynced items:', err);
      syncProgress.lastError = 'Failed to retrieve sync queue';
      return { success: 0, failed: 0 };
    }

    syncProgress.totalItems = items.length;
    console.log(`[Sync] Found ${items.length} items to sync`);

    if (items.length === 0) {
      console.log('[Sync] No items to sync, clearing inProgress');
      syncProgress.inProgress = false;
      updateProgress();
      return { success: 0, failed: 0 };
    }

    // Process items with throttling
    for (const item of items) {
      // Safety: check for timeout
      if (Date.now() - startTime > MAX_SYNC_TIME) {
        console.warn('[Sync] Sync timeout reached, stopping');
        break;
      }

      try {
        console.log(`[Sync] Syncing item ${syncProgress.syncedItems + 1}/${items.length}`);
        await syncItem(firestore, item, userId);
        syncProgress.syncedItems++;
        
        // Delete the synced item from queue
        try {
          await deleteSyncQueueItem(item.id);
        } catch (delErr) {
          console.warn(`[Sync] Failed to delete synced item ${item.id}:`, delErr);
          // Don't fail the whole sync if delete fails
        }
        
        updateProgress();

        // Throttle: wait 50ms between items
        await delay(50);
      } catch (error) {
        console.error(`[Sync] Failed to sync item ${item.id}:`, error);
        syncProgress.failedItems++;
        updateProgress();
        
        // For quota errors, stop trying for now
        const errorMessage = error instanceof Error ? error.message : '';
        if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          console.warn('[Sync] Firebase quota exceeded, stopping sync');
          break;
        }
        
        // For other errors, continue but log them
        console.warn(`[Sync] Continuing despite error with ${item.id}`);
      }
    }
    
    console.log(`[Sync] Sync complete: ${syncProgress.syncedItems} synced, ${syncProgress.failedItems} failed`);
  } catch (error) {
    console.error('[Sync] Unexpected sync error:', error);
    syncProgress.lastError = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    console.log('[Sync] Setting inProgress to false');
    syncProgress.inProgress = false;
    updateProgress();
  }

  return {
    success: syncProgress.syncedItems,
    failed: syncProgress.failedItems,
  };
}

/**
 * Sync a single item to Firebase
 */
async function syncItem(firestore: Firestore, item: SyncItem, userId: string): Promise<void> {
  const { collectionName, docId, action, data } = item;

  const collRef = collection(firestore, collectionName);

  try {
    if (action === 'create') {
      // Add document with userId for security
      await addDoc(collRef, {
        ...data,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (action === 'update') {
      // Update existing document
      const docRef = doc(firestore, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else if (action === 'delete') {
      // Delete document
      const docRef = doc(firestore, collectionName, docId);
      await deleteDoc(docRef);
    }

    // Mark as synced in IndexedDB
    await markAsSynced(item.id);
  } catch (error) {
    // Check if it's a quota error
    const errorMessage = error instanceof Error ? error.message : '';
    if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
      console.warn('Firebase quota exceeded, pausing sync. Will retry later.');
      // Don't retry immediately for quota errors
      throw new Error('Firebase quota exceeded');
    }
    throw error;
  }
}

/**
 * Smart sync - only sync if online and not already syncing
 */
export async function smartSync(firestore: Firestore, userId: string): Promise<void> {
  // Check if online
  if (!navigator.onLine) {
    console.log('Offline, skipping sync');
    return;
  }

  await syncToFirebase(firestore, userId);
}

/**
 * Update sync progress and notify UI
 */
function updateProgress() {
  const progress = { ...syncProgress };
  console.log('Sync progress:', progress);

  if (syncProgressCallback) {
    syncProgressCallback(progress);
  }
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Start background sync on interval
 */
export function startBackgroundSync(
  firestore: Firestore,
  userId: string,
  intervalMs: number = 30000 // 30 seconds
): () => void {
  // Initial sync
  smartSync(firestore, userId);

  // Periodic sync
  const intervalId = setInterval(() => {
    smartSync(firestore, userId);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Setup online/offline listeners for automatic sync
 */
export function setupOfflineListener(firestore: Firestore, userId: string): () => void {
  const handleOnline = () => {
    console.log('Back online, syncing...');
    smartSync(firestore, userId);
  };

  window.addEventListener('online', handleOnline);

  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
