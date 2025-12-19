# Stock Manager Application - Comprehensive Security Audit Report

**Date:** December 17, 2025  
**Audit Type:** Backend Security & RBAC Verification  
**Status:** CRITICAL ISSUES IDENTIFIED

---

## Executive Summary

This audit reveals **critical security vulnerabilities** in the stock-manager application's backend architecture. The application has well-structured authentication and Firestore security rules, but **fails to enforce them at the component and page level**, creating significant data access and export bypass vulnerabilities. Mock data is still used in production pages instead of real Firestore queries, and trial user restrictions are not enforced at the UI layer.

**Critical Findings:** 8  
**High Priority Issues:** 12  
**Medium Priority Issues:** 6  

---

## 1. USER AUTHENTICATION FLOW ✅ (Good)

### Overview
Authentication implementation is solid with proper Firebase integration.

### What's Working:
- ✅ Email signup with verification email ([auth-functions.ts](src/firebase/auth-functions.ts#L24-L41))
- ✅ Email login with password validation ([auth-functions.ts](src/firebase/auth-functions.ts#L48-L54))
- ✅ Google OAuth integration for both signup and login ([auth-functions.ts](src/firebase/auth-functions.ts#L62-L90))
- ✅ Trial tier automatically assigned on signup ([auth-functions.ts](src/firebase/auth-functions.ts#L37))
- ✅ Trial start date set on email verification ([auth-functions.ts](src/firebase/auth-functions.ts#L128-L135))
- ✅ Email verification polling with 5-second intervals ([email-verification.tsx](src/components/auth/email-verification.tsx#L24-L51))
- ✅ Verification email resend rate limiting (60 seconds) ([trial-utils.ts](src/lib/trial-utils.ts#L82-L94))

### Minor Issues:
- ⚠️ **No error handling in signup/login for Firebase auth errors** - Only generic messages are shown
  - [login-form.tsx](src/components/auth/login-form.tsx#L57-L64) - No specific error message handling
  - [signup-form.tsx](src/components/auth/signup-form.tsx#L50-L57) - No specific error message handling

---

## 2. ROLE-BASED ACCESS CONTROL (RBAC) ⚠️ (CRITICAL ISSUES)

### Firestore Security Rules ✅ (Good)
Security rules are well-designed:
- ✅ Admin and Premium users: full read/write access
- ✅ Trial users: read-only access (no write)
- ✅ Unverified users: denied access
- ✅ Email verification required before any data access ([firestore.rules](firestore.rules#L45-L52))
- ✅ Trial expiry handled server-side ([firestore.rules](firestore.rules#L53-L62))

### Component/Page Level RBAC ❌ (CRITICAL FAILURES)

#### Issue #1: Mock Admin Check Using Static Mock Data
**Severity:** CRITICAL  
**File:** [dashboard/settings/page.tsx](src/app/[locale]/dashboard/settings/page.tsx#L1-L20)  
**Lines:** 10-16

```typescript
if (mockUser.role !== 'Admin') {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-destructive">Access Denied. You must be an administrator to view this page.</p>
    </div>
  )
}
```

**Problem:** Uses hardcoded `mockUser` from `data.ts` which has `role: 'Admin'`. **Any logged-in user can access settings regardless of their actual Firebase user role.**

**Impact:** Non-admin users can modify company settings, business rules, profit margins, and VAT configurations.

**Fix:** Replace with actual Firebase user context:
```typescript
const { user } = useFirebase();
const [userDoc, setUserDoc] = useState<User | null>(null);

useEffect(() => {
  if (!user) return;
  // Fetch user doc from Firestore
  const fetchUser = async () => {
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    setUserDoc(userDoc.data() as User);
  };
  fetchUser();
}, [user, firestore]);

if (!userDoc || userDoc.role !== 'admin') {
  return <div className="text-destructive">Access Denied</div>;
}
```

---

#### Issue #2: Mock User in Dashboard Layout - Admin Badge
**Severity:** HIGH  
**File:** [dashboard/layout.tsx](src/app/[locale]/dashboard/layout.tsx#L124)  
**Lines:** 124

```typescript
{mockUser.role === 'Admin' && (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <Link href={`/${locale}/admin`}>
        <Users className="h-5 w-5" />
        Admin
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

**Problem:** Shows admin link in sidebar based on `mockUser`, not actual authenticated user.

**Impact:** All logged-in users see admin link and can navigate to `/admin` pages.

**Lines:** 105 - Also uses `mockUser` for user nav display instead of actual Firebase user.

---

#### Issue #3: No Role Verification in Admin Pages
**Severity:** CRITICAL  
**Files:** All admin pages under `src/app/[locale]/admin/`

**Problem:** Admin pages don't verify user role before rendering content. They should check if user is admin.

**Example - admin/page.tsx:** No auth check visible. Need to add at top:
```typescript
'use client';
import { useFirebase } from '@/firebase/provider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, firestore } = useFirebase();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user || !firestore) return;
    const checkAdmin = async () => {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      const userData = userDoc.data();
      if (userData?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, [user, firestore, router]);

  if (!isAdmin) return <div>Loading...</div>;
  // ... rest of page
}
```

---

#### Issue #4: Mock User Displayed in UserNav Component
**Severity:** HIGH  
**File:** [components/dashboard/user-nav.tsx](src/components/dashboard/user-nav.tsx#L1-L50)  
**Lines:** 1-50

This component receives `mockUser` from layout instead of actual Firebase user. The component signature expects User type with `name` and `avatarUrl`, but Firebase User doesn't have these.

**Expected Fix:**
```typescript
// Should use Firebase user data from useFirebase() hook
const { user } = useFirebase();
// Then fetch full user doc from Firestore for name, etc.
```

---

## 3. TRIAL SYSTEM IMPLEMENTATION ⚠️ (PARTIALLY WORKING)

### Trial Logic - Good Implementation ✅
- ✅ 5-day trial properly configured in [trial-utils.ts](src/lib/trial-utils.ts#L9-L21)
- ✅ Trial expiry calculation correct
- ✅ Days remaining calculated properly ([trial-utils.ts](src/lib/trial-utils.ts#L29-L47))
- ✅ Export blocking logic exists ([trial-utils.ts](src/lib/trial-utils.ts#L59-L72))

### Trial Enforcement - CRITICAL FAILURES ❌

#### Issue #5: Trial Users Can Access All Data Despite Read-Only Rule
**Severity:** CRITICAL  
**Problem:** While Firestore rules enforce read-only for trial users, no UI-level indication or enforcement prevents trial users from attempting write operations.

**Current State:** 
- [trial-utils.ts](src/lib/trial-utils.ts#L65-L72) has `canExport()` function that blocks trial export
- But **NO similar function blocks create/update/delete operations**

**Missing Implementation:**
```typescript
// trial-utils.ts - ADD THIS
export function canWrite(user: User): boolean {
  if (user.subscription === 'premium') {
    return true;
  }
  if (user.role === 'admin') {
    return true;
  }
  if (user.subscription === 'trial') {
    return false; // Trial users cannot write
  }
  return false;
}

export function getWriteRestrictionMessage(user: User): string | null {
  if (!canWrite(user)) {
    if (user.subscription === 'trial') {
      return 'Trial users cannot modify data. Please upgrade to premium.';
    }
    return 'You do not have permission to modify this data.';
  }
  return null;
}
```

**Impact:** Trial users get Firestore permission errors instead of user-friendly messages.

---

#### Issue #6: Invoice Export Not Checked for Trial Users in All Cases
**Severity:** HIGH  
**File:** [components/dashboard/create-invoice-form.tsx](src/components/dashboard/create-invoice-form.tsx#L1-L150)

**Problem:** The form doesn't check `canExport()` before allowing invoice generation. It only checks in [invoice-generator.ts](src/components/dashboard/invoice-generator.ts#L15-L27), but this check is called AFTER the form submission.

**Impact:** Trial users can attempt to generate invoices, receiving errors only after form submission instead of being blocked upfront.

**Should Add:**
```typescript
const [canGenerateInvoice, setCanGenerateInvoice] = useState(false);

useEffect(() => {
  if (user && auth && firestore) {
    const checkAccess = async () => {
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      const userData = userDoc.data() as User;
      setCanGenerateInvoice(userCanExportInvoice(userData));
    };
    checkAccess();
  }
}, [user, auth, firestore]);

if (!canGenerateInvoice) {
  return <div className="text-destructive">Trial users cannot generate invoices.</div>;
}
```

---

## 4. DATA ACCESS PATTERNS ❌ (CRITICAL - USING MOCK DATA)

### Issue #7: ALL Dashboard Pages Using Mock Data Instead of Firestore
**Severity:** CRITICAL

This is the most critical finding. **Every main dashboard page still uses mock data from `data.ts` instead of querying Firestore.**

#### Affected Pages:

| Page | Issue | File | Lines |
|------|-------|------|-------|
| **Stock** | `mockProducts` used instead of Firestore query | [stock/page.tsx](src/app/[locale]/dashboard/stock/page.tsx#L33) | 33, 76-128 |
| **Customers** | `mockCustomers` used instead of Firestore query | [customers/page.tsx](src/app/[locale]/dashboard/customers/page.tsx#L28) | 28, 70-109 |
| **Suppliers** | `mockSuppliers` used instead of Firestore query | [suppliers/page.tsx](src/app/[locale]/dashboard/suppliers/page.tsx#L31) | 31, 67-108 |
| **Sales** | `mockTransactions` filtered for sales | [sales/page.tsx](src/app/[locale]/dashboard/sales/page.tsx#L37) | 37-45 |
| **Purchases** | `mockTransactions` filtered for purchases | [purchases/page.tsx](src/app/[locale]/dashboard/purchases/page.tsx#L36) | 36-44 |
| **Invoices** | `mockTransactions` filtered for invoices | [invoices/page.tsx](src/app/[locale]/dashboard/invoices/page.tsx#L31) | 31-34 |
| **Trash** | `mockProducts` for deleted items | [trash/page.tsx](src/app/[locale]/dashboard/trash/page.tsx#L29) | 29 |

#### Example - Stock Page Problem:
[stock/page.tsx](src/app/[locale]/dashboard/stock/page.tsx#L33-L76)
```typescript
import { mockProducts } from "@/lib/data";

export default async function StockPage({ params: { locale } }: { params: { locale: Locale } }) {
  // ... later ...
  {mockProducts.map((product) => (
    <TableRow key={product.id}>
      {/* display product data */}
    </TableRow>
  ))}
}
```

**Problems:**
1. ❌ No user authentication verification
2. ❌ No role check (trial users see full product list)
3. ❌ All users see same mock data regardless of permissions
4. ❌ No real Firestore queries with `useCollection()`
5. ❌ Data doesn't persist or update
6. ❌ No error handling for permission issues

**Should Use Instead:**
```typescript
'use client';
import { useFirebase, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

export default function StockPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'products');
  }, [firestore, user]);
  
  const { data: products, isLoading, error } = useCollection<Product>(productsQuery);
  
  if (error && error instanceof FirestorePermissionError) {
    return <div className="text-destructive">Permission denied to view products</div>;
  }
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    // ... render products ...
  );
}
```

---

### Issue #8: Dashboard Main Page (Home) Using Mock Data
**Severity:** HIGH  
**File:** [dashboard/page.tsx](src/app/[locale]/dashboard/page.tsx#L1-L50)

Stats displayed are hardcoded:
```typescript
<StatsCard
  title={dictionary.dashboard.revenue}
  value="4,523,189 DZD"  // HARDCODED!
  icon={<Banknote className="h-4 w-4" />}
  description="+20.1% from last month"  // HARDCODED!
/>
```

**Impact:** Users see fake metrics regardless of their actual data.

---

### Issue #9: Log Sale Dialog Using Mock Data
**Severity:** HIGH  
**File:** [components/dashboard/log-sale-dialog.tsx](src/components/dashboard/log-sale-dialog.tsx#L19)

```typescript
import { mockProducts, mockCustomers } from '@/lib/data';

// ...
const productOptions = useMemo(() => mockProducts.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` })), []);
const customerOptions = useMemo(() => mockCustomers.map(c => ({ value: c.id, label: c.name })), []);
```

**Impact:** Users can only log sales with mock data products/customers, not real data.

---

### Issue #10: No User Authentication in Data Fetching Hooks
**Severity:** MEDIUM  
**Files:** 
- [firestore/use-collection.tsx](src/firebase/firestore/use-collection.tsx#L54-L100) 
- [firestore/use-doc.tsx](src/firebase/firestore/use-doc.tsx#L31-L77)

**Problem:** These hooks don't verify user authentication before subscribing to data. They rely entirely on Firestore security rules to block access. While rules are good, UI should show proper error messages, not silent failures.

**Current Error Handling:** [use-collection.tsx](src/firebase/firestore/use-collection.tsx#L88-L106)
```typescript
(error: FirestoreError) => {
  const contextualError = new FirestorePermissionError({
    operation: 'list',
    path,
  })
  setError(contextualError)
  setData(null)
  setIsLoading(false)
  // trigger global error propagation
  errorEmitter.emit('permission-error', contextualError);
}
```

**Issue:** This throws an error that crashes the component instead of showing user-friendly message. Better to show "You don't have permission to view this data."

---

## 5. EXPORT FUNCTIONALITY ⚠️ (PARTIAL IMPLEMENTATION)

### Export Blocking Logic ✅ (Exists)

**File:** [invoice-generator.ts](src/components/dashboard/invoice-generator.ts#L9-L27)

```typescript
export function userCanExportInvoice(user: AppUser): boolean {
  return canExport(user);
}

export function getExportRestrictionMessage(user: AppUser): string | null {
  if (!canExport(user)) {
    if (user.subscription === 'trial') {
      return 'Trial users cannot export invoices. Please upgrade to premium to enable exports.';
    }
    return 'You do not have permission to export invoices.';
  }
  return null;
}
```

### Export Verification ❌ (NOT USED EVERYWHERE)

**Problem:** The `userCanExportInvoice()` function exists but **is never actually called to prevent export.**

**Where It's Used:**
- ✅ Referenced in [invoice-generator.ts](src/components/dashboard/invoice-generator.ts#L15)
- ❌ NOT called in create-invoice-form submission
- ❌ NOT enforced in any download buttons

**Missing:** Explicit check before PDF generation in the form's `onSubmit`:

[create-invoice-form.tsx](src/components/dashboard/create-invoice-form.tsx#L130-L165)
```typescript
const onSubmit = async (values: InvoiceFormData) => {
  setIsLoading(true);
  try {
    // ❌ NO CHECK HERE FOR userCanExportInvoice()
    
    // ... generate PDF directly ...
    await generateInvoicePdf(values, companyInfo);
    
    // User gets PDF even if trial!
  }
}
```

**Fix Needed:**
```typescript
const onSubmit = async (values: InvoiceFormData) => {
  setIsLoading(true);
  try {
    // ADD THIS CHECK
    if (!userCanExportInvoice(currentUser)) {
      toast({
        title: 'Export Not Allowed',
        description: getExportRestrictionMessage(currentUser),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    await generateInvoicePdf(values, companyInfo);
  }
}
```

---

### Issue #11: localStorage Used for Invoice Numbering (No Cloud Sync)
**Severity:** MEDIUM  
**File:** [create-invoice-form.tsx](src/components/dashboard/create-invoice-form.tsx#L58-L75)

```typescript
const getNextInvoiceNumber = () => {
  const lastNumberStr = localStorage.getItem('lastInvoiceNumber');
  // ...
  const paddedNumber = nextNumber.toString().padStart(4, '0');
  return `FAC-${currentYear}-${paddedNumber}`;
};
```

**Problem:** Invoice numbers stored in browser localStorage, not in Firestore. Multiple users on different devices will generate duplicate invoice numbers.

**Should Use:** Firestore atomic counter or server-side generation.

---

### Issue #12: Company Info Stored in localStorage
**Severity:** HIGH  
**File:** [invoice-generator.ts](src/components/dashboard/invoice-generator.ts#L145-L160)

```typescript
function getCompanyInfo(): CompanyInfo {
    const storedInfo = localStorage.getItem('companyInfo');
    if (storedInfo) {
        return JSON.parse(storedInfo);
    }
    return { /* default empty */ };
}
```

**Problem:** Company info should be in Firestore, not localStorage:
1. ❌ Not synced across devices
2. ❌ User loses data if browser cleared
3. ❌ Security - sensitive business data in client storage
4. ❌ Multi-user conflicts

**Should Use:** Firestore collection `companies/{companyId}/settings`

---

## 6. ERROR HANDLING ✅ (Partial - Good Framework)

### Good Error Handling ✅

**Firestore Permission Errors:** [errors.ts](src/firebase/errors.ts) and [error-emitter.ts](src/firebase/error-emitter.ts)
- ✅ Custom `FirestorePermissionError` class created
- ✅ Error emitter provides typed event system
- ✅ Global error listener in [FirebaseErrorListener.tsx](src/components/FirebaseErrorListener.tsx)

**Firebase Auth Errors:**
- ⚠️ Basic error handling in login/signup forms, but messages are generic

### Error Handling Gaps ❌

#### Issue #13: No User-Friendly Trial Restriction Messages
**Severity:** MEDIUM

When trial users hit write operations, they get Firestore rule rejection errors. Instead, app should catch and show friendly message like: *"Your trial doesn't support this action. Please upgrade to premium."*

**Missing:** Client-side pre-checks using `canWrite()` utility.

---

## 7. INCONSISTENCIES & GAPS ❌ (MULTIPLE CRITICAL ISSUES)

### Issue #14: Type Mismatch - User Type Between Firebase and App
**Severity:** MEDIUM  
**Files:** 
- [types.ts](src/lib/types.ts#L1-L20)
- [data.ts](src/lib/data.ts#L1-L10)

**Problem:** Two different User types:

**App User Type** ([types.ts](src/lib/types.ts)):
```typescript
export type User = {
  uid: string;
  email: string;
  role: UserRole; // "admin" | "user"
  subscription: UserSubscription; // "trial" | "premium"
  emailVerified: boolean;
  authMethod: AuthMethod;
  createdAt: Timestamp;
  trialStartDate?: Timestamp;
  verificationSentAt?: Timestamp;
};
```

**Mock User** ([data.ts](src/lib/data.ts)):
```typescript
export const mockUser: User = {
  id: 'user-1', // ← WRONG FIELD (should be uid)
  name: 'Admin User', // ← NOT IN TYPE
  email: 'admin@partspro.com',
  avatarUrl: 'https://...', // ← NOT IN TYPE
  role: 'Admin', // ← WRONG VALUE (should be 'admin')
  subscription: 'Expiring', // ← WRONG VALUE (should be 'trial' or 'premium')
};
```

**Impact:** Components expect wrong fields, leading to runtime errors.

---

### Issue #15: Missing Firestore Data for All Collections
**Severity:** CRITICAL

**No Firestore integration** for:
- ✅ Products - defined in type but using mock
- ✅ Suppliers - defined in type but using mock
- ✅ Customers - defined in type but using mock
- ✅ Purchases - defined in type but using mock
- ✅ Sales - defined in type but using mock

**Missing:** Firestore client operations to:
```typescript
// Should exist but don't:
export async function fetchProducts(firestore: Firestore): Promise<Product[]>
export async function fetchSuppliers(firestore: Firestore): Promise<Supplier[]>
export async function fetchCustomers(firestore: Firestore): Promise<Customer[]>
export async function addProduct(firestore: Firestore, product: Omit<Product, 'id'>): Promise<string>
export async function updateProduct(firestore: Firestore, id: string, updates: Partial<Product>): Promise<void>
// ... etc for all CRUD operations
```

---

### Issue #16: No Read-Only Mode UI for Trial Users
**Severity:** MEDIUM

Trial users get Firestore errors when trying to edit. Instead, UI should:
1. Disable edit buttons for trial users
2. Show "Trial users cannot modify data" message
3. Provide upgrade CTA

**Missing:** Wrapper components like:
```typescript
function EditableControl({ user, canEdit, children }) {
  if (!canEdit(user)) {
    return (
      <Tooltip content="Trial users cannot edit. Please upgrade.">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
      </Tooltip>
    );
  }
  return children;
}
```

---

### Issue #17: Settings Form Allows Non-Admins to "Try" Editing
**Severity:** HIGH  
**File:** [settings-form.tsx](src/components/dashboard/settings-form.tsx)

Form renders modals for editing company info and business rules, but since page-level check uses mock data (Issue #1), non-admins can open these modals and attempt edits that will fail at Firestore.

**Should:** Disable form entirely for non-admins, not just warn on page entry.

---

### Issue #18: No Logout Implementation
**Severity:** HIGH  
**File:** [user-nav.tsx](src/components/dashboard/user-nav.tsx#L31-L39)

```typescript
<DropdownMenuItem asChild>
  <Link href={`/${locale}/login`}>
    <LogOut className="mr-2 h-4 w-4" />
    <span>{dictionary.logout}</span>
  </Link>
</DropdownMenuItem>
```

**Problem:** Logout just links to `/login`. Doesn't actually sign user out of Firebase.

**Should Use:**
```typescript
async function handleLogout() {
  try {
    await signOut(auth);
    router.push(`/${locale}/login`);
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

---

### Issue #19: Admin Pages Don't Fetch Real Data
**Severity:** HIGH  
**Files:** All under `src/app/[locale]/admin/`

Admin pages (users, analytics, audit logs, etc.) should display real user and system data but we don't see any Firestore queries.

**Missing:**
- Admin dashboard showing real user statistics
- User management with role assignment
- Audit log queries from Firestore
- System analytics

---

### Issue #20: No Subscription Status Display
**Severity:** MEDIUM

Users should see their subscription status and trial days remaining:
- ❌ No trial countdown shown
- ❌ No upgrade CTA visible
- ❌ No subscription status in sidebar/header

**Should Add:** Component showing:
```
Status: Trial (3 days remaining)
[Upgrade to Premium]
```

---

## Summary Table - Issue Priority

| Issue # | Category | Severity | Impact | File | Line |
|---------|----------|----------|--------|------|------|
| 1 | RBAC | 🔴 CRITICAL | Non-admins can access settings | dashboard/settings/page.tsx | 10-16 |
| 2 | RBAC | 🟠 HIGH | Non-admins see admin link | dashboard/layout.tsx | 124 |
| 3 | RBAC | 🔴 CRITICAL | Admin pages not protected | admin/* | - |
| 4 | RBAC | 🟠 HIGH | Mock user displayed | dashboard/layout.tsx | 105 |
| 5 | Trial | 🔴 CRITICAL | No write operation blocking UI | trial-utils.ts | - |
| 6 | Trial | 🟠 HIGH | Export not pre-checked | create-invoice-form.tsx | 130-165 |
| 7 | Data | 🔴 CRITICAL | All pages use mock data | stock/customers/suppliers/sales/purchases/invoices/trash pages | Multiple |
| 8 | Data | 🟠 HIGH | Dashboard stats hardcoded | dashboard/page.tsx | 15-43 |
| 9 | Data | 🟠 HIGH | Log sale dialog mock data | log-sale-dialog.tsx | 19 |
| 10 | Data | 🟡 MEDIUM | No user auth in hooks | firestore/use-collection.tsx, use-doc.tsx | - |
| 11 | Export | 🟡 MEDIUM | Invoice numbers in localStorage | create-invoice-form.tsx | 58-75 |
| 12 | Export | 🟠 HIGH | Company info in localStorage | invoice-generator.ts | 145-160 |
| 13 | Error | 🟡 MEDIUM | No friendly trial messages | N/A | - |
| 14 | Type | 🟡 MEDIUM | User type mismatch | types.ts, data.ts | - |
| 15 | Data | 🔴 CRITICAL | No Firestore CRUD operations | N/A | - |
| 16 | UI | 🟡 MEDIUM | No read-only trial UI | N/A | - |
| 17 | RBAC | 🟠 HIGH | Settings form editable for non-admins | settings-form.tsx | - |
| 18 | Auth | 🟠 HIGH | No logout implementation | user-nav.tsx | 31-39 |
| 19 | Data | 🟠 HIGH | Admin pages no real data | admin/* | - |
| 20 | UI | 🟡 MEDIUM | No subscription status display | N/A | - |

---

## Recommendations - Implementation Priority

### 🔴 PHASE 1 - CRITICAL (Do Immediately)

1. **Replace ALL mock data with Firestore queries**
   - Convert all dashboard pages to use `useCollection()` hook
   - Fetch data based on authenticated user context
   - Add proper error handling

2. **Implement real user context throughout app**
   - Remove all `mockUser` references
   - Use `useFirebase()` hook to get actual authenticated user
   - Fetch user document from Firestore on auth state change
   - Update UserNav component to display real user

3. **Add RBAC checks at component level**
   - Verify user role before rendering admin pages
   - Disable/hide edit functions for trial users with friendly messages
   - Show read-only mode for trial users

4. **Implement trial user write blocking UI**
   - Add `canWrite()` helper function
   - Pre-check permissions before form submission
   - Show friendly messages instead of Firestore errors
   - Disable create/edit/delete buttons for trial users

### 🟠 PHASE 2 - HIGH PRIORITY (Next)

5. **Move localStorage data to Firestore**
   - Company info → `companies/{uid}/info`
   - Invoice numbers → Firestore counter or server-side sequence
   - Settings → `users/{uid}/settings`

6. **Add proper logout**
   - Implement `signOut()` in user nav
   - Clear auth state and redirect to login

7. **Add subscription status display**
   - Show trial days remaining in header/sidebar
   - Display subscription tier
   - Add upgrade CTA

8. **Implement admin dashboard**
   - Create real user management interface
   - Add audit log queries
   - Show system analytics from Firestore data

### 🟡 PHASE 3 - MEDIUM PRIORITY (Follow-up)

9. **Enhanced error messages**
   - Custom toasts for permission errors
   - Friendly messages for trial restrictions
   - Clear guidance on what user needs to do

10. **Read-only mode components**
    - Wrapper components for trial-only fields
    - Disabled state styling
    - Hover tooltips explaining restrictions

11. **Firestore CRUD helpers**
    - Consistent functions for all data operations
    - Proper error handling
    - Transaction support where needed

12. **Type consistency**
    - Fix mockUser type mismatch
    - Unify User types across codebase
    - Add proper TypeScript checks

---

## Testing Recommendations

### Test Scenarios

1. **RBAC Testing**
   - Log in as trial user → verify read-only access
   - Log in as trial user → try to edit product → should see friendly message
   - Log in as trial user → try to access admin page → should redirect
   - Log in as premium user → verify full access
   - Log in as admin → verify all access + admin pages

2. **Trial Expiry Testing**
   - Set trial start date to 5+ days ago
   - Verify user gets "trial expired" message
   - Verify all data is read-only
   - Verify export is blocked

3. **Data Access Testing**
   - Create products in Firestore
   - Log in as different users → should see same product data
   - Verify pagination works
   - Verify search filters work

4. **Export Testing**
   - Trial user tries to generate invoice → should show "upgrade" message
   - Premium user generates invoice → should work
   - Verify invoice numbers don't duplicate across users

---

## Conclusion

The stock-manager application has a **solid foundation** with well-designed Firestore security rules and authentication flow, but **fails to enforce these rules at the presentation layer**. The continued use of mock data makes the security rules ineffective, and users currently cannot interact with real data.

**Priority:** Implementing the PHASE 1 recommendations is critical before the application can be considered production-ready. Without these changes, the application cannot enforce trial restrictions, RBAC, or data persistence.

**Estimated Implementation Time:**
- Phase 1 (Critical): 3-4 days
- Phase 2 (High): 2-3 days  
- Phase 3 (Medium): 1-2 days
- Total: 6-9 days

---

**Report Generated:** December 17, 2025  
**Reviewed By:** Security Audit Team
