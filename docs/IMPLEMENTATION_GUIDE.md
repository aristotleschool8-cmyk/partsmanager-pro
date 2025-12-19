# RBAC with Gmail & Email Authentication + Trial System - Implementation Guide

## Overview
This document summarizes the complete implementation of the authentication, authorization, and trial system for the stock manager application.

## Completed Implementation

### 1. Firebase Authentication Configuration
**File:** `src/firebase/config.ts`
- ✅ Google Sign-In provider configured with scopes: `profile`, `email`
- ✅ Email/Password authentication provider configured
- ✅ Exports both providers for use in auth functions

### 2. User Data Types
**File:** `src/lib/types.ts`
- ✅ `User` type with fields:
  - `uid`: Firebase Auth UID
  - `email`: User email address
  - `role`: "admin" | "user"
  - `subscription`: "trial" | "premium"
  - `emailVerified`: Email verification status
  - `authMethod`: "google" | "email"
  - `createdAt`: Account creation timestamp
  - `trialStartDate`: When trial started (email verification completion for email users, signup for Google)
  - `verificationSentAt`: For tracking email resend spam prevention

### 3. Trial Utility Functions
**File:** `src/lib/trial-utils.ts`
Exported functions:
- ✅ `isTrialExpired(user)`: Checks if user's 5-day trial has expired
- ✅ `calculateTrialDaysRemaining(user)`: Returns remaining trial days (0 if expired)
- ✅ `canExport(user)`: Returns false for trial users, true for premium/admin
- ✅ `canResendVerificationEmail(user)`: Implements 60-second cooldown
- ✅ `getVerificationResendCooldownSeconds(user)`: Returns seconds until next resend

### 4. Firebase Auth Functions
**File:** `src/firebase/auth-functions.ts`
- ✅ `signUpWithEmail(auth, firestore, email, password)`:
  - Creates auth user
  - Sends verification email
  - Creates Firestore user doc with `trial` subscription and `emailVerified: false`
  
- ✅ `signInWithEmail(auth, email, password)`:
  - Simple email/password login
  
- ✅ `signInWithGoogle(auth, firestore)`:
  - Google OAuth sign-in
  - Auto-creates Firestore user doc with `trial` subscription if new user
  - Sets `emailVerified: true` (Google pre-verifies)
  
- ✅ `resendVerificationEmail(auth, firestore, user)`:
  - Resends verification email
  - Updates `verificationSentAt` timestamp for spam prevention
  
- ✅ `handleEmailVerificationComplete(auth, firestore, user)`:
  - Called when user verifies email
  - Sets `emailVerified: true` and `trialStartDate` in Firestore
  
- ✅ `signOut(auth)`: Signs out current user

### 5. Authentication Forms
**File:** `src/components/auth/signup-form.tsx`
- ✅ Google Sign-In button at top
- ✅ Email/password registration form
- ✅ Loading states and error handling
- ✅ Redirects to `/verify-email` after email signup
- ✅ Redirects to `/dashboard` after Google signup

**File:** `src/components/auth/login-form.tsx`
- ✅ Google Sign-In button
- ✅ Email/password login form
- ✅ Loading states and error handling
- ✅ Redirects to `/dashboard` on success

### 6. Email Verification Component
**File:** `src/components/auth/email-verification.tsx`
- ✅ Displays verification waiting screen
- ✅ Auto-checks verification status every 5 seconds
- ✅ "Resend verification email" button with 60-second cooldown
- ✅ Prevents spam with timestamp tracking
- ✅ Auto-redirects to dashboard when verified
- ✅ Shows user's email address

**File:** `src/app/verify-email/page.tsx`
- ✅ Page route that renders the verification component

### 7. Firebase Provider Updates
**File:** `src/firebase/provider.tsx`
- ✅ Removed automatic anonymous sign-in
- ✅ Now properly handles "no user" state (stays unauthenticated)
- ✅ Services unavailable until user authenticates

### 8. Firestore Security Rules
**File:** `firestore.rules`
Complete RBAC implementation:

**Helper Functions:**
- `isSignedIn()`: Checks if user has auth token
- `isEmailVerified()`: Checks if user is verified and has verified email
- `isAdmin()`: Checks if user is verified and role is "admin"
- `isPremium()`: Checks if user is verified and subscription is "premium"
- `canWrite()`: Returns true for admin or premium users
- `canRead()`: Returns true for any verified user

**Collection Rules:**
- `/users/{uid}`: Users can read their own profile; admins can read all
- `/suppliers`, `/customers`, `/products`: 
  - `canRead()`: Trial/Premium/Admin can read
  - `canWrite()`: Premium/Admin can write (trial read-only)
- `/purchases`, `/sales`: Same as above
- Subcollections enforce relational integrity (purchaseId/saleId must match parent)

**Trial User Behavior:**
- Trial users have read-only access to all data
- Trial users cannot write/modify any data
- Trial users cannot delete any data
- Server-side logic (Cloud Functions) will need to handle trial expiry transitions

### 9. Middleware Protection
**File:** `src/middleware.ts`
- ✅ Locale routing (existing functionality preserved)
- ✅ Admin route protection - checks for auth token
- ✅ Redirects unauthenticated users to login before accessing `/admin/*`
- ✅ JWT token validation capability (commented for reference)

### 10. Admin Layout Route Protection
**File:** `src/app/[locale]/admin/layout.tsx`
- ✅ Converted to client component with auth checks
- ✅ Fetches user document from Firestore
- ✅ Verifies `role === "admin"`
- ✅ Redirects non-admins to dashboard
- ✅ Shows loading state during verification
- ✅ Displays access denied message with user's actual role

### 11. Export Blocking for Trial Users
**File:** `src/components/dashboard/invoice-generator.ts`
Added functions:
- ✅ `userCanExportInvoice(user)`: Returns false for trial users
- ✅ `getExportRestrictionMessage(user)`: Returns appropriate message for trial/denied users

**Implementation note:** Use these functions to:
1. Disable export buttons for trial users
2. Show appropriate messaging when they attempt to export
3. Guide them to upgrade to premium

## Key Implementation Details

### Trial System
- **Trial Duration:** 5 days from email verification completion (not signup date)
- **Trial Start:** 
  - Email users: Set when email is verified
  - Google users: Set immediately at signup (Google pre-verifies)
- **Trial Restrictions:**
  - Read-only access to all data
  - Cannot perform any write/update/delete operations
  - Cannot export data (PDF, CSV, Excel)
  - Firestore rules enforce read-only access
  - Client-side checks prevent export attempts
- **Trial Expiry:** After 5 days, need to upgrade to premium or lose write access

### Email Verification
- **Mandatory:** Required for email/password signup
- **Optional:** Skipped for Google Sign-In (pre-verified)
- **Resend Prevention:** Maximum 1 resend per 60 seconds
- **Tracking:** `verificationSentAt` timestamp stored in Firestore
- **Automatic Redirect:** Redirects to dashboard when email verified

### Admin User Creation
- **Manual Only:** No self-service admin registration
- **Method:** Create in Firebase Console + Firestore manually
- **Required Fields:**
  - `email`: Admin email
  - `role`: "admin"
  - `subscription`: "premium"
  - `emailVerified`: true
  - `authMethod`: "email"
  - `createdAt`: Current date
  - `trialStartDate`: Current date (not used for admins)

See `docs/ADMIN_CREATION_GUIDE.ts` for step-by-step instructions.

### Authentication Flow

**Email/Password Signup:**
1. User fills signup form
2. `signUpWithEmail()` creates auth user
3. Sends verification email
4. Creates Firestore user doc with `emailVerified: false`
5. Redirects to `/verify-email`
6. User clicks email link
7. `handleEmailVerificationComplete()` sets `emailVerified: true` and `trialStartDate`
8. Auto-redirects to dashboard
9. User has 5-day trial with read-only access

**Google Signup:**
1. User clicks "Sign in with Google"
2. `signInWithGoogle()` creates auth user (or logs in existing)
3. Creates Firestore user doc with `emailVerified: true` and `trialStartDate`
4. Redirects to dashboard
5. User has 5-day trial with read-only access immediately

**Login:**
1. User fills login form (both methods)
2. Auth completes, user redirected to dashboard
3. User can access data according to their role/subscription

## Testing Checklist

- [ ] Email signup sends verification email
- [ ] Verification email link updates Firestore `emailVerified`
- [ ] Google signup creates trial user immediately
- [ ] Trial users can read data but not write
- [ ] Trial users cannot export
- [ ] Trial user export attempts show appropriate message
- [ ] Resend email button works with 60-second cooldown
- [ ] Admin users can access `/admin` routes
- [ ] Non-admin users are redirected from `/admin` routes
- [ ] Admin users can perform all CRUD operations
- [ ] Premium users can export after upgrade
- [ ] Firestore rules deny unverified users all access

## Security Notes

1. **Firestore Rules:** Strictly enforced at database level
2. **Email Verification:** Critical for preventing fake accounts
3. **Admin Manual Creation:** Prevents unauthorized admin elevation
4. **Trial Read-Only:** Enforced by Firestore rules, not just client-side
5. **Session Management:** Firebase handles auth state in cookies

## File Structure
```
src/
├── firebase/
│   ├── config.ts (Google & Email providers)
│   ├── auth-functions.ts (Auth logic)
│   └── provider.tsx (Updated, removed anon sign-in)
├── lib/
│   ├── types.ts (User type)
│   └── trial-utils.ts (Trial logic)
├── components/
│   └── auth/
│       ├── signup-form.tsx (Google + Email signup)
│       ├── login-form.tsx (Google + Email login)
│       └── email-verification.tsx (Verification UI)
├── app/
│   ├── verify-email/
│   │   └── page.tsx (Verification page)
│   └── [locale]/admin/
│       └── layout.tsx (Admin route protection)
└── middleware.ts (Locale + admin route protection)

firestore.rules (RBAC enforcement)

docs/
└── ADMIN_CREATION_GUIDE.ts (Admin creation instructions)
```

## Next Steps

1. **Enable Google OAuth in Firebase Console:**
   - Go to Authentication > Sign-in method
   - Enable Google provider
   - Add authorized JavaScript origins: your domain

2. **Create Initial Admin User:**
   - Follow instructions in `docs/ADMIN_CREATION_GUIDE.ts`

3. **Test the Flow:**
   - Sign up with email
   - Verify email
   - Attempt export (should fail with message)
   - Sign up with Google
   - Access data (should be read-only)
   - Sign in as admin
   - Access admin panel

4. **Implement Upgrade Flow:**
   - Add Stripe/payment integration
   - Create upgrade modal for trial users
   - Update subscription from "trial" to "premium" on payment
   - Server-side Cloud Functions to handle payments

5. **Optional Enhancements:**
   - Email templates customization
   - Trial countdown warning email (day 3 or 4)
   - Custom claim-based RBAC (Firebase Authentication)
   - Password reset flow
   - Profile management UI

## Common Issues & Solutions

**"No user logged in" after signup:**
- Check Firebase Console > Authentication > Email/Password is enabled
- Verify Firestore user document was created

**Trial users can still write:**
- Check Firestore rules were deployed
- Verify user `emailVerified` is true in Firestore
- Clear browser cache and refresh

**Google sign-in not working:**
- Confirm Google provider enabled in Firebase Console
- Check authorized JavaScript origins match your domain
- Verify redirect URI in Firebase config

**Email verification not working:**
- Check email provider (SMTP) settings in Firebase
- Verify email sending is enabled in Firebase Console
- Check spam folder for verification email
