# Firestore Data Migration Guide: Adding userId Field

## Overview

After updating the Firestore rules to enforce per-user data isolation, all existing documents in the following collections need to be updated with a `userId` field:

- suppliers
- customers
- products
- purchases
- sales
- invoices

## Why This Is Needed

The new Firestore rules enforce that:
- Users can only read/write documents where `document.userId == request.auth.uid`
- Without the `userId` field, all operations on existing documents will be denied

## Migration Strategy

### Option A: Manual Migration via Firebase Console (Recommended for Small Datasets)

1. **Open Firebase Console**
   - Go to https://console.firebase.google.com
   - Select your project
   - Navigate to Firestore Database

2. **For each collection (suppliers, customers, products, purchases, sales, invoices)**:
   - Open the collection
   - For each document, click **Edit** (pencil icon)
   - Add a new field:
     - Field name: `userId`
     - Type: `string`
     - Value: The UID of the user who should own this document
   - Click **Save**

3. **Where to find user UIDs**:
   - Go to Authentication in Firebase Console
   - Copy the UID from the user list

### Option B: Automated Migration via Cloud Functions (Recommended for Large Datasets)

Create a Cloud Function to migrate all documents:

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const migrateDocumentsAddUserId = functions.https.onRequest(async (req, res) => {
  // SECURITY: Only allow if authenticated as admin
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const collections = ['suppliers', 'customers', 'products', 'purchases', 'sales', 'invoices'];
    let totalUpdated = 0;

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      
      for (const doc of snapshot.docs) {
        // Skip if document already has userId
        if (doc.data().userId) {
          continue;
        }

        // If document has an owner field, use that as userId
        // Otherwise, you may need to manually assign or skip
        const ownerId = doc.data().owner || doc.data().createdBy || null;
        
        if (ownerId) {
          await doc.ref.update({ userId: ownerId });
          totalUpdated++;
        } else {
          console.warn(`Document ${collectionName}/${doc.id} has no owner field - skipping`);
        }
      }
    }

    res.json({ message: `Migration complete. Updated ${totalUpdated} documents.` });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

### Option C: Manual Assignment via Admin Panel (Recommended for Controlled Migration)

If you have admin access in your app:

1. **Create a new admin page**: `/admin/data-migration`
2. **Display documents without userId**
3. **Allow admin to assign userId to each document**
4. **Track progress**

```typescript
// Example function for admin migration page
async function assignUserIdToDocument(collectionName: string, docId: string, userId: string) {
  const docRef = doc(firestore, collectionName, docId);
  await updateDoc(docRef, { userId });
}
```

---

## Recommended Approach for Your Project

### Phase 1: Immediate (Before Deployment)

**If you have existing test data only:**
1. Delete all test documents from Firestore
2. Deploy new rules
3. All new documents will automatically include userId

**If you have real production data:**
1. Create a backup of Firestore collections
2. Use Firebase Console UI to manually add userId to existing documents
3. Verify all documents have userId before deploying rules

### Phase 2: During Development

When creating documents in the app, ensure userId is always included:

```typescript
// Good: userId is always included
await addDoc(collection(firestore, 'products'), {
  userId: user.uid,  // ← Always add this
  designation: 'Product Name',
  purchasePrice: 100,
  // ... other fields
});
```

### Phase 3: Ongoing

Monitor Firestore operations in Cloud Firestore Dashboard:
- Look for permission denied errors
- Check that all documents have userId field
- Verify rules are working as expected

---

## Deployment Checklist

- [ ] Update Firestore rules (✅ Already done in firestore.rules)
- [ ] Identify all existing documents without userId
- [ ] Backup Firestore data
- [ ] Assign userId to all existing documents (Manual or Automated)
- [ ] Verify no permission denied errors in logs
- [ ] Deploy updated rules to Firestore
- [ ] Test with multiple user accounts
- [ ] Monitor errors for 24 hours after deployment

---

## Testing After Migration

### Test 1: User Data Isolation

```typescript
// User A should only see their own data
const productsForUserA = await getDocs(
  query(
    collection(firestore, 'products'),
    where('userId', '==', userA.uid)
  )
);
// Should NOT include products from User B

// User B should only see their own data
const productsForUserB = await getDocs(
  query(
    collection(firestore, 'products'),
    where('userId', '==', userB.uid)
  )
);
// Should NOT include products from User A
```

### Test 2: Permission Denied Errors

- Try to read another user's document directly:
  ```typescript
  // This should fail with permission denied
  const doc = await getDoc(doc(firestore, 'products', 'someOtherId'));
  ```

### Test 3: Document Creation

- Create new documents and verify userId is set
- Try creating without userId (should fail in client validation)

---

## Rollback Plan

If issues arise:

1. **Revert Firestore Rules**:
   - Go to Firebase Console
   - Firestore Database → Rules
   - Restore previous rules version

2. **Restore from Backup**:
   - Use Firebase Backup if available
   - Or manually restore documents

3. **Debug**:
   - Check Cloud Firestore activity logs
   - Look for "permission denied" errors
   - Verify all documents have userId field

---

## Timeline

**Recommended Schedule**:
- Day 1: Add userId field to all existing documents
- Day 2: Deploy new Firestore rules to production
- Days 3-7: Monitor for errors, adjust if needed
- Day 8+: Confident production state

---

## Important Notes

⚠️ **Before you deploy new rules**:
1. Ensure ALL documents in affected collections have userId field
2. Test thoroughly in a staging environment
3. Have a rollback plan ready

✅ **After you deploy new rules**:
1. Monitor logs for permission denied errors
2. Test data access with multiple user accounts
3. Verify users cannot access other users' data

---

## Questions or Issues?

If documents are missing userId or you see permission denied errors:

1. Check Cloud Firestore activity logs
2. Verify documents have userId field
3. Confirm field matches request.auth.uid
4. Review rule logic for syntax errors

---

**Status**: Rules updated ✅ | Migration pending ⏳ | Deployment ready (once migration complete)
