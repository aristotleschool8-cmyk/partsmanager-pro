# Quick Implementation Reference Guide

## 🎯 What Was Fixed

6 critical gaps in the stock management app have been resolved:

### 1. **Logout** ✅
Users can now properly sign out. Session is cleared from Firebase.

### 2. **Product Management** ✅
Adding products now saves to Firestore instead of just logging.
Trial users see a disabled button.

### 3. **Customer Management** ✅
Adding customers now saves to Firestore with permission checks.

### 4. **Supplier Management** ✅
Adding suppliers now saves to Firestore with permission checks.

### 5. **Invoice Export Restrictions** ✅
Trial users cannot create/export invoices. Button is disabled with explanation.

### 6. **Data Persistence** ✅
Products, customers, and suppliers data now persists in Firestore.

---

## 📋 Key Implementation Details

### Permission Checking Pattern
All write dialogs now follow this pattern:

```tsx
// 1. Fetch user document
useEffect(() => {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDocSnap = await getDoc(userDocRef);
  setUserDoc(userDocSnap.data() as AppUser);
}, [user, firestore]);

// 2. Check permissions before showing/submitting
if (!canWrite(userDoc)) {
  return <Button disabled>...</Button>;
}

// 3. On form submit, check again + store to Firestore
const onSubmit = async (data) => {
  if (!canWrite(userDoc)) {
    toast({ description: getExportRestrictionMessage(userDoc) });
    return;
  }
  
  const ref = collection(firestore, 'collectionName');
  await addDoc(ref, { ...data, createdAt: new Date() });
};
```

### Data Fetching Pattern (Dashboard Pages)
All dashboard pages now use this pattern:

```tsx
'use client';

export default function DashboardPage({ params: { locale } }) {
  const { firestore } = useFirebase();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;
    
    const ref = collection(firestore, 'collectionName');
    const q = query(ref);
    const snap = await getDocs(q);
    
    const items = [];
    snap.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
    setData(items);
  }, [firestore]);

  return (
    {isLoading ? <Spinner /> : <Table data={data} />}
  );
}
```

---

## 🔐 Permission Layers

Every write operation is protected by:

1. **UI Layer**: Disabled buttons, tooltips, loading states
2. **Component Layer**: `canWrite()` check before form submission
3. **Firebase Layer**: Firestore security rules block unauthorized writes

---

## 🚀 What's Working Now

| Feature | Status | Persistence |
|---------|--------|-------------|
| User Signup | ✅ | Firebase Auth |
| Email Verification | ✅ | Firebase Auth |
| User Login | ✅ | Firebase Auth |
| User Logout | ✅ | Session cleared |
| Add Product | ✅ | Firestore |
| View Products | ✅ | Firestore |
| Add Customer | ✅ | Firestore |
| View Customers | ✅ | Firestore |
| Add Supplier | ✅ | Firestore |
| View Suppliers | ✅ | Firestore |
| Create Invoice | ⚠️ | Firestore (trial restricted) |
| Trial Restrictions | ✅ | Enforced via canWrite() + rules |

---

## ⚠️ Trial vs Premium Restrictions

### Trial Users (First 5 Days)
- ✅ Can view all data (products, customers, suppliers, sales, purchases)
- ✅ Can see invoices
- ❌ Cannot add/edit products (button disabled)
- ❌ Cannot add/edit customers (button disabled)
- ❌ Cannot add/edit suppliers (button disabled)
- ❌ Cannot create/export invoices (button disabled)

### Premium Users
- ✅ Can do everything
- ✅ Full access to all features

### Admin Users
- ✅ Full access (same as premium)
- ✅ Can manage other users (TBD)

---

## 📁 Modified Files at a Glance

```
Dialogs (Add/Create Operations):
├── add-product-dialog.tsx ............... ✅ Firestore + Permissions
├── add-customer-dialog.tsx ............. ✅ Firestore + Permissions
├── add-supplier-dialog.tsx ............. ✅ Firestore + Permissions
├── create-invoice-dialog.tsx ........... ✅ Export Permissions
└── create-invoice-form.tsx ............. ✅ Permission Check

Navigation:
└── user-nav.tsx ....................... ✅ Logout Fixed

Dashboard Pages (Data Fetching):
├── stock/page.tsx ..................... ✅ Firestore Products
├── customers/page.tsx ................. ✅ Firestore Customers
└── suppliers/page.tsx ................. ✅ Firestore Suppliers

Still Using Mock Data (Next Phase):
├── sales/page.tsx ..................... ⏳ TODO
├── purchases/page.tsx ................. ⏳ TODO
└── invoices/page.tsx .................. ⏳ TODO
```

---

## 🧪 How to Test

### Test 1: Logout
1. Open app, login
2. Click user menu → Logout
3. Verify redirected to login
4. Try accessing `/dashboard` → redirected to login

### Test 2: Add Product (Premium User)
1. Login as premium user
2. Click "Add Product"
3. Fill form → Submit
4. Verify product appears in table immediately

### Test 3: Add Product (Trial User)
1. Login as trial user (within 5 days)
2. "Add Product" button should be disabled (gray)
3. Hover over button → see "Trial users cannot..." tooltip
4. Button click does nothing

### Test 4: Invoice Creation (Trial vs Premium)
1. Login as trial user
2. "Create Invoice" button should be disabled
3. Login as premium user
4. "Create Invoice" button should be enabled
5. Can create and export PDF

### Test 5: Data Persistence
1. Add product/customer/supplier
2. Refresh page
3. Data should still be visible
4. Open app in incognito window (different user)
5. See different data (permission-based isolation)

---

## 🔄 Data Flow Examples

### Creating a Product
```
User clicks "Add Product" (enabled if premium)
  ↓
Dialog opens, form displays
  ↓
User fills form & clicks "Submit"
  ↓
Component checks canWrite(userDoc) → true for premium
  ↓
addDoc(products, { name, price, ... })
  ↓
Firestore rules verify user.role in ['admin', 'user'] && user.emailVerified
  ↓
Data saved successfully
  ↓
Toast shown: "Product added successfully"
  ↓
Dialog closes, products list refreshes
```

### Trial User Attempting to Create Invoice
```
User clicks "Create Invoice" (disabled for trial)
  ↓
Button is disabled, tooltip shows "Trial users cannot..."
  ↓
User cannot interact with button
  ↓
If somehow form submitted:
  ↓
canExport(userDoc) returns false
  ↓
Toast shown: "Your trial period has expired. Upgrade..."
  ↓
No PDF generated, no data persisted
  ↓
Firestore rules also block write
```

---

## 📊 Collections Structure

### Products Collection
```
/products/{docId}
  ├── name: string
  ├── reference: string
  ├── brand: string
  ├── stock: number
  ├── purchasePrice: number
  ├── price: number
  └── createdAt: Timestamp
```

### Customers Collection
```
/customers/{docId}
  ├── name: string
  ├── email: string
  ├── phone: string
  ├── address: string
  ├── rc: string
  ├── nis: string
  ├── nif: string
  └── createdAt: Timestamp
```

### Suppliers Collection
```
/suppliers/{docId}
  ├── name: string
  ├── email: string
  ├── phone: string
  ├── contactName: string
  ├── address: string
  ├── rc: string
  ├── nis: string
  ├── nif: string
  ├── rib: string
  └── createdAt: Timestamp
```

### Users Collection (Already Exists)
```
/users/{uid}
  ├── email: string
  ├── emailVerified: boolean
  ├── role: 'admin' | 'user'
  ├── subscription: 'trial' | 'premium'
  ├── trialStartDate: Timestamp (when email verified)
  └── authMethod: 'google' | 'email'
```

---

## 🎓 Key Utilities Used

### Permission Functions (in `src/lib/trial-utils.ts`)
```tsx
canWrite(user) → boolean
// Returns true if user is admin/premium AND verified

canExport(user) → boolean
// Same as canWrite (used for invoice exports)

getExportRestrictionMessage(user) → string
// Returns human-friendly error message

isTrialExpired(user) → boolean
// Checks if 5-day trial has expired

calculateTrialDaysRemaining(user) → number
// Returns days left in trial (0 if expired)
```

### Firebase Operations
```tsx
// Reading
doc(firestore, 'collection', 'docId')
getDoc(docRef)
collection(firestore, 'collectionName')
query(ref, where(...), orderBy(...))
getDocs(q)

// Writing
addDoc(collection, data)
setDoc(docRef, data)
updateDoc(docRef, data)
deleteDoc(docRef)
```

---

## ✅ Validation Checklist

Before deploying, verify:

- [ ] User can login with email
- [ ] User can login with Google
- [ ] Email verification works
- [ ] User can logout
- [ ] Trial user: Can view products/customers/suppliers
- [ ] Trial user: Cannot add products (button disabled)
- [ ] Trial user: Cannot create invoices (button disabled)
- [ ] Premium user: Can add products
- [ ] Premium user: Can create invoices
- [ ] Products persist after refresh
- [ ] Different users see different data
- [ ] Firebase security rules are deployed
- [ ] Error messages show in UI (not just console)

---

## 🚀 Next Phase Tasks

1. **Replace Sales/Purchases Mock Data** - Apply same pattern to remaining pages
2. **Migrate Settings to Firestore** - Move invoice numbering, company info from localStorage
3. **Add Edit/Delete Operations** - Implement update and delete functionality
4. **Add Email Notifications** - Notify admins of new sales/purchases
5. **Implement Log/Audit Trail** - Track who added what and when

---

## 💡 Tips for Developers

1. **Always fetch user doc first** before checking permissions
2. **Use `canWrite()` for adds/updates/deletes** and `canExport()` for report generation
3. **Show loading states** to prevent accidental double-clicks
4. **Disable form inputs** during loading
5. **Show spinner** while fetching data
6. **Handle Firestore errors** specifically (auth, permission denied, not found)
7. **Add `onSuccess` callbacks** to refresh data after operations
8. **Test with trial AND premium users** - they have different UX
