# Deletion Field Normalization - Fix Applied

## Problem
The codebase was inconsistently using `deleted` and `isDeleted` fields for marking products as deleted. This caused an infinite flip loop:
1. Product marked as `isDeleted: true` in Firestore
2. Pull-service fetches products and saves to IndexedDB via `saveProduct()`
3. Code elsewhere checked/wrote `deleted` field instead of `isDeleted`
4. Local IndexedDB had mixed states (`isDeleted: true` from server but `deleted: false` from local code)
5. Sync-worker would re-queue the product as not-deleted → flip back to false on server
6. Pull service would re-import it → infinite loop

## Solution Applied

### Files Modified

#### 1. **src/lib/indexeddb.ts**
- **Line 258**: `getProductsByUser()` - Changed filter from `product.deleted !== true` to `product.isDeleted !== true`
- **Line 670**: `restoreProductFromTrash()` - Changed from `deleted: false` to `isDeleted: false`
- **Line 796**: `getDeletedProducts()` - Changed filter from `product.deleted === true` to `product.isDeleted === true`

#### 2. **src/lib/hybrid-import-v2.ts**
- **Line 205**: `hybridRestoreProduct()` - Changed from `deleted: false` to `isDeleted: false`

#### 3. **src/app/[locale]/dashboard/stock/page.tsx**
- **Line 122**: Firestore read filter - Changed from `doc.data().deleted !== true` to `doc.data().isDeleted !== true`

### Verification
- ✅ All product read/write paths now consistently use `isDeleted`
- ✅ `saveProduct()` preserves `isDeleted` via spread operator (doesn't overwrite it)
- ✅ Pull-service filters by `isDeleted` correctly
- ✅ Soft delete queues with `{ isDeleted: true }`
- ✅ Permanent delete uses `permanent-delete` commit type with `deleteDoc()`
- ✅ Restore operation sets `isDeleted: false`
- ✅ Build succeeds with no errors

### Expected Behavior After Fix
1. User soft-deletes a product → queues commit with `{ isDeleted: true }`
2. Sync-worker pushes to Firestore, sets `isDeleted: true`
3. Pull-service filters out products with `isDeleted: true` → not re-imported
4. Product only reappears if user explicitly restores it (which sets `isDeleted: false` and queues restore commit)
5. Permanent delete removes the document entirely via `deleteDoc()`

### No Flip Loop
- The infinite flip loop is resolved because:
  - All code paths now read and write `isDeleted` (no mixed state)
  - Local `saveProduct()` doesn't overwrite `isDeleted` unless explicitly set
  - Pull-service filters to exclude deleted items, so they don't get re-imported
  - Sync-worker won't re-queue a product unless the local state explicitly changes

## Build Status
✅ Build successful (no TypeScript errors or warnings)
✅ Ready for testing the deletion scenario
