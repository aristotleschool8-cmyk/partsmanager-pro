'use client';

import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { googleProvider } from './config';
import { User as AppUser } from '@/lib/types';

/**
 * Signs up a new user with email and password
 * Sends verification email and creates a Firestore user document with trial tier
 */
export async function signUpWithEmail(
  auth: Auth,
  firestore: Firestore,
  email: string,
  password: string
): Promise<FirebaseUser> {
  // Create auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Send verification email
  await sendEmailVerification(firebaseUser);

  // Create user document in Firestore (with trial tier, not verified yet)
  const userDocRef = doc(firestore, 'users', firebaseUser.uid);
  const userDoc: Omit<AppUser, 'uid'> = {
    email: firebaseUser.email!,
    role: 'user',
    subscription: 'trial',
    emailVerified: false,
    authMethod: 'email',
    createdAt: serverTimestamp() as Timestamp,
    verificationSentAt: serverTimestamp() as Timestamp,
  };

  await setDoc(userDocRef, userDoc);

  return firebaseUser;
}

/**
 * Signs in user with email and password
 */
export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Signs in user with Google
 * Creates a Firestore user document with trial tier on first login
 */
export async function signInWithGoogle(
  auth: Auth,
  firestore: Firestore
): Promise<FirebaseUser> {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const firebaseUser = userCredential.user;

  // Check if user document already exists
  const userDocRef = doc(firestore, 'users', firebaseUser.uid);
  const userDocSnapshot = await getDoc(userDocRef);

  if (!userDocSnapshot.exists()) {
    // New user - create document with trial tier
    const userDoc: Omit<AppUser, 'uid'> = {
      email: firebaseUser.email!,
      role: 'user',
      subscription: 'trial',
      emailVerified: true, // Google already verifies email
      authMethod: 'google',
      createdAt: serverTimestamp() as Timestamp,
      trialStartDate: serverTimestamp() as Timestamp,
    };

    await setDoc(userDocRef, userDoc);
  }

  return firebaseUser;
}

/**
 * Resends verification email to user
 * Updates the verificationSentAt timestamp
 */
export async function resendVerificationEmail(
  auth: Auth,
  firestore: Firestore,
  firebaseUser: FirebaseUser
): Promise<void> {
  // Send verification email
  await sendEmailVerification(firebaseUser);

  // Update verificationSentAt timestamp in Firestore
  const userDocRef = doc(firestore, 'users', firebaseUser.uid);
  await updateDoc(userDocRef, {
    verificationSentAt: serverTimestamp(),
  });
}

/**
 * Handles email verification completion
 * Sets emailVerified to true and trialStartDate in Firestore
 */
export async function handleEmailVerificationComplete(
  auth: Auth,
  firestore: Firestore,
  firebaseUser: FirebaseUser
): Promise<void> {
  // Reload user to get updated emailVerified status
  await firebaseUser.reload();

  if (firebaseUser.emailVerified) {
    // Update Firestore user document
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    await updateDoc(userDocRef, {
      emailVerified: true,
      trialStartDate: serverTimestamp(), // Set trial start date to now
    });
  }
}

/**
 * Gets the current user's profile from Firestore
 */
export async function getUserProfile(
  firestore: Firestore,
  uid: string
): Promise<AppUser | null> {
  try {
    const userDocRef = doc(firestore, 'users', uid);
    const userDocSnapshot = await getDoc(userDocRef);
    
    if (userDocSnapshot.exists()) {
      return {
        uid,
        ...userDocSnapshot.data(),
      } as AppUser;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Updates user profile information
 */
export async function updateUserProfile(
  firestore: Firestore,
  uid: string,
  updates: Partial<Omit<AppUser, 'uid'>>
): Promise<void> {
  try {
    const userDocRef = doc(firestore, 'users', uid);
    await updateDoc(userDocRef, updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Signs out the current user
 */
export async function signOut(auth: Auth): Promise<void> {
  await auth.signOut();
}

/**
 * Sends password reset email to user
 * User clicks link in email to reset password
 */
export async function sendPasswordReset(
  auth: Auth,
  email: string
): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address.');
    }
    throw error;
  }
}

/**
 * Verifies password reset code and returns the associated email
 */
export async function verifyResetCode(
  auth: Auth,
  code: string
): Promise<string> {
  try {
    return await verifyPasswordResetCode(auth, code);
  } catch (error: any) {
    if (error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code') {
      throw new Error('Reset link has expired or is invalid. Please request a new password reset.');
    }
    throw error;
  }
}

/**
 * Confirms password reset with new password
 */
export async function resetPassword(
  auth: Auth,
  code: string,
  newPassword: string
): Promise<void> {
  try {
    await confirmPasswordReset(auth, code, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/invalid-action-code' || error.code === 'auth/expired-action-code') {
      throw new Error('Reset link has expired or is invalid. Please request a new password reset.');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    }
    throw error;
  }
}
