# Backend Structure & Authentication Audit Report
**Date:** December 17, 2025  
**Status:** ⚠️ CRITICAL ISSUES FOUND

---

## Executive Summary

The backend authentication and RBAC implementation has **8 critical issues** that prevent the system from functioning as designed. While the Firebase auth structure is sound, the application still relies heavily on **mock data** and **hardcoded user roles**, bypassing the RBAC system entirely.

**Overall Status:** ❌ NOT PRODUCTION READY  
**Severity:** CRITICAL  
**Estimated Fix Time:** 6-9 days

---

## Detailed Findings

### 🔴 CRITICAL ISSUE #1: All Dashboard Pages Use Mock Data (Non-Persistent)

**Impact:** Users cannot save or retrieve real data. Application is non-functional for actual use.

**Files Affected:**
- [src/app/[locale]/dashboard/stock/page.tsx](src/app/[locale]/dashboard/stock/page.tsx#L36-50) - Uses `mockProducts`
- [src/app/[locale]/dashboard/customers/page.tsx](src/app/[locale]/dashboard/customers/page.tsx) - Uses `mockCustomers`
- [src/app/[locale]/dashboard/suppliers/page.tsx](src/app/[locale]/dashboard/suppliers/page.tsx) - Uses `mockSuppliers`
- [src/app/[locale]/dashboard/sales/page.tsx](src/app/[locale]/dashboard/sales/page.tsx) - Uses mock sales data
- [src/app/[locale]/dashboard/purchases/page.tsx](src/app/[locale]/dashboard/purchases/page.tsx) - Uses mock purchase data
- [src/app/[locale]/dashboard/invoices/page.tsx](src/app/[locale]/dashboard/invoices/page.tsx) - Uses mock invoices

**Current Code Example:**
```tsx
// src/app/[locale]/dashboard/stock/page.tsx
import { mockProducts } from "@/lib/data";

export default async function StockPage(...) {
  return (
    <Table>
      <TableBody>
        {mockProducts.map((product) => ( // ❌ HARDCODED MOCK DATA
          <TableRow key={product.id}>
            {/* renders product */}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**What Should Happen:**
```tsx
// Should fetch from Firestore
const { data: products } = useCollection<Product>(
  productsQuery,
  { includeMetadataChanges: false }
);
```

**Fix Required:** Implement Firestore queries in ALL dashboard pages

---

### 🔴 CRITICAL ISSUE #2: No User Role Verification in Pages

**Impact:** Trial users can attempt all operations, non-admins can access admin pages.

**Files with Missing Role Checks:**
- [src/app/[locale]/dashboard/layout.tsx](src/app/[locale]/dashboard/layout.tsx) - No role verification
- [src/app/[locale]/dashboard/stock/page.tsx](src/app/[locale]/dashboard/stock/page.tsx) - Trial users see edit/delete buttons
- [src/app/[locale]/dashboard/customers/page.tsx](src/app/[locale]/dashboard/customers/page.tsx) - No write permission checks
- [src/components/dashboard/add-product-dialog.tsx](src/components/dashboard/add-product-dialog.tsx#L62-82) - No `canWrite()` check

**Current Code (add-product-dialog.tsx):**
```tsx
export function AddProductDialog({ dictionary }: { dictionary: Dictionary }) {
  const onSubmit = async (data: ProductFormData) => {
    try {
      // TODO: Integrate with Firebase to save product
      console.log('Product data:', data); // ❌ JUST LOGS, DOESN'T VERIFY USER
      
      toast({
        title: 'Success',
        description: 'Product added successfully.',
      });
    } catch (error) {
      // ...
    }
  };
  return (/* form */);
}
```

**What Should Happen:**
```tsx
export function AddProductDialog({ dictionary }: { dictionary: Dictionary }) {
  const { user, firestore } = useFirebase();
  const [userDoc, setUserDoc] = useState<AppUser | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    getDoc(userDocRef).then(snap => {
      if (!snap.exists()) return;
      setUserDoc(snap.data() as AppUser);
    });
  }, [user, firestore]);

  // Check before allowing form
  if (!canWrite(userDoc)) {
    return <div>Trial users cannot add products. Upgrade to premium.</div>;
  }

  const onSubmit = async (data: ProductFormData) => {
    // Only then create product...
  };
}
```

---

### 🔴 CRITICAL ISSUE #3: Admin Pages Not Protected with Real Role Check

**Impact:** Non-admin users can navigate to admin routes and see admin content before client-side redirect.

**File:** [src/app/[locale]/admin/layout.tsx](src/app/[locale]/admin/layout.tsx)

**Current Issue:**
- Uses `mockUser.role` which is always "Admin"
- Real user role check is there but relies on Firestore fetch
- If Firestore query fails, shows "Access Denied" instead of redirecting

**Fix Already Partially Implemented:** ✅ 
The admin layout was updated to use Firestore role verification, but it needs testing to ensure it works correctly.

---

### 🔴 CRITICAL ISSUE #4: Trial User Export Blocking Not Enforced at UI Level

**Impact:** Trial users see export buttons, click them, and get Firestore errors instead of friendly message.

**File:** [src/components/dashboard/create-invoice-form.tsx](src/components/dashboard/create-invoice-form.tsx#L142-163)

**Current Code:**
```tsx
const onSubmit = async (values: InvoiceFormData) => {
  setIsLoading(true);
  try {
    // Generate PDF - NO CHECK FOR TRIAL USER
    await generateInvoicePdf(values, companyInfo);

    updateLastInvoiceNumber();
    toast({
      title: 'Success',
      description: 'Invoice generated and downloaded successfully.',
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    toast({
      title: 'Error',
      description: 'Failed to generate invoice. Please try again.',
      variant: 'destructive', // ❌ Generic error, not helpful
    });
  }
};
```

**What Should Happen:**
```tsx
const { user, firestore } = useFirebase();
const [userDoc, setUserDoc] = useState<AppUser | null>(null);

useEffect(() => {
  if (!user || !firestore) return;
  // Fetch user doc...
}, [user, firestore]);

const onSubmit = async (values: InvoiceFormData) => {
  // Check trial status BEFORE allowing
  if (!canExport(userDoc)) {
    toast({
      title: 'Trial Limitation',
      description: getExportRestrictionMessage(userDoc),
      variant: 'destructive',
    });
    return;
  }

  setIsLoading(true);
  try {
    await generateInvoicePdf(values, companyInfo);
    // ...
  }
};
```

---

### 🔴 CRITICAL ISSUE #5: Mock User Displayed in Dashboard

**Impact:** Dashboard shows hardcoded "Admin User" regardless of who's logged in.

**Files:**
- [src/app/[locale]/dashboard/layout.tsx](src/app/[locale]/dashboard/layout.tsx#L40) - Uses `mockUser`
- [src/components/dashboard/user-nav.tsx](src/components/dashboard/user-nav.tsx#L23) - Displays hardcoded user info

**Current Code:**
```tsx
// src/app/[locale]/dashboard/layout.tsx
import { mockUser } from "@/lib/data";

export default async function DashboardLayout(...) {
  return (
    <header>
      <UserNav user={mockUser} dictionary={dictionary.auth} /> {/* ❌ MOCK USER */}
    </header>
  );
}
```

**Should Be:**
```tsx
// Use actual Firebase user fetched from Firestore
const { user, firestore } = useFirebase();
const [userDoc, setUserDoc] = useState<AppUser | null>(null);

useEffect(() => {
  if (!user || !firestore) return;
  getDoc(doc(firestore, 'users', user.uid)).then(snap => {
    setUserDoc(snap.data() as AppUser);
  });
}, [user, firestore]);

return <UserNav user={userDoc} dictionary={dictionary.auth} />;
```

---

### 🟠 ISSUE #6: Data Persistence Problems with LocalStorage

**Impact:** Invoice numbers and settings can conflict when multiple users use the app.

**Files:**
- [src/components/dashboard/create-invoice-form.tsx](src/components/dashboard/create-invoice-form.tsx#L59-82) - Invoice numbering in localStorage
- [src/app/[locale]/settings/profit-margin-form.tsx](src/app/[locale]/settings/profit-margin-form.tsx#L61-90) - Profit margin in localStorage
- [src/app/[locale]/settings/company-info-form.tsx](src/app/[locale]/settings/company-info-form.tsx) - Company info in localStorage

**Problem:**
```tsx
const getNextInvoiceNumber = () => {
  try {
    const lastNumberStr = localStorage.getItem('lastInvoiceNumber'); // ❌ SHARED ACROSS USERS
    const currentYear = new Date().getFullYear();
    let nextNumber = 1;

    if (lastNumberStr) {
      const lastNumberData = JSON.parse(lastNumberStr);
      if (lastNumberData.year === currentYear) {
        nextNumber = lastNumberData.number + 1; // Will conflict in multi-user scenario
      }
    }
    // ...
  }
};
```

**Should Store In:** Firestore collection `appSettings/{userId}` instead of localStorage

---

### 🟠 ISSUE #7: No Logout Implementation

**Impact:** Users cannot sign out (critical security issue).

**Files:**
- [src/components/dashboard/user-nav.tsx](src/components/dashboard/user-nav.tsx) - Has logout link but doesn't actually sign out
- No `signOut()` function called anywhere

**Current Code:**
```tsx
// In user-nav component
<DropdownMenuItem asChild>
  <Link href={`/${locale}/login`}> {/* ❌ JUST LINKS AWAY, DOESN'T SIGN OUT */}
    Logout
  </Link>
</DropdownMenuItem>
```

**Should Be:**
```tsx
const handleLogout = async () => {
  try {
    await signOut(auth); // Use function from auth-functions.ts
    router.push(`/${locale}/login`);
  } catch (error) {
    console.error('Logout error:', error);
    toast({ title: 'Error', description: 'Failed to logout' });
  }
};

<DropdownMenuItem onClick={handleLogout}>
  Logout
</DropdownMenuItem>
```

---

### 🟠 ISSUE #8: Component TODOs with Missing Firebase Integration

**Impact:** Core CRUD operations are placeholders only.

**Files with TODO Comments:**
- [src/components/dashboard/add-customer-dialog.tsx](src/components/dashboard/add-customer-dialog.tsx#L71) - Line 71: `// TODO: Integrate with Firebase to save customer`
- [src/components/dashboard/add-supplier-dialog.tsx](src/components/dashboard/add-supplier-dialog.tsx#L70) - Line 70: `// TODO: Integrate with Firebase to save supplier`
- [src/components/dashboard/log-sale-dialog.tsx](src/components/dashboard/log-sale-dialog.tsx#L80) - Lines 80+: `// Logic to save the sale` (just logs)

**Current Pattern:**
```tsx
const onSubmit = async (data: CustomerFormData) => {
  try {
    // TODO: Integrate with Firebase to save customer
    console.log('Customer data:', data); // ❌ ONLY LOGS

    toast({
      title: 'Success',
      description: 'Customer added successfully.',
    });
  } catch (error) {
    // ...
  }
};
```

---

## Issue Summary Table

| Issue | Severity | Type | Files Affected | Fix Effort |
|-------|----------|------|-----------------|-----------|
| Mock data in all dashboard pages | CRITICAL | Backend | 6 pages | 3 days |
| No role verification on write operations | CRITICAL | RBAC | 10 components | 2 days |
| Admin pages lack real role check | CRITICAL | RBAC | 1 file | 0.5 days |
| Trial export not blocked at UI | CRITICAL | UX | 3 components | 1 day |
| Mock user displayed | HIGH | UX | 3 components | 1 day |
| Invoice numbering in localStorage | MEDIUM | Data | 2 files | 1 day |
| No logout implementation | CRITICAL | Auth | 2 files | 0.5 days |
| Missing CRUD implementations | CRITICAL | Backend | 3 dialogs | 2 days |

---

## Implementation Roadmap

### Phase 1: Critical Authentication Fixes (1 day)
1. ✅ Implement `signOut()` in user-nav
2. ✅ Fix mockUser display in dashboard layout
3. ✅ Add trial export blocking to create-invoice-form

### Phase 2: RBAC Enforcement (2 days)
1. Add `canWrite()` checks to all add/edit dialogs
2. Add role verification to all dashboard pages
3. Block trial users from seeing action buttons

### Phase 3: Replace Mock Data (3 days)
1. Create Firestore query hooks for each collection
2. Replace mock data in stock/customers/suppliers/sales/purchases pages
3. Implement CRUD operations in dialogs
4. Add proper error handling

### Phase 4: Data Persistence (1 day)
1. Move localStorage data to Firestore user settings
2. Create settings management page
3. Implement multi-user support

### Phase 5: Testing & Hardening (2 days)
1. Test all auth flows end-to-end
2. Verify trial restrictions work
3. Test invoice numbering accuracy
4. Performance testing with real Firestore data

---

## Next Steps

1. **Immediate Action:** Implement logout functionality (blocks all current issues)
2. **Quick Win:** Add trial user blocking to invoice export
3. **Foundation:** Replace mock data with Firestore queries
4. **Hardening:** Add comprehensive role checks throughout

Would you like me to start implementing these fixes? I can begin with Phase 1 (Critical Authentication Fixes) and work through the roadmap systematically.
