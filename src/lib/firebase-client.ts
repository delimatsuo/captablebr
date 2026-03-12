import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _googleProvider: GoogleAuthProvider | undefined;

function getApp() {
  if (!_app) {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return _app;
}

export function getFirebaseAuth() {
  if (!_auth) {
    _auth = getAuth(getApp());
  }
  return _auth;
}

export function getGoogleProvider() {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    _googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return _googleProvider;
}

const EMAIL_LINK_STORAGE_KEY = "captablebr_signup_form";

/**
 * Send a sign-in link to the user's email for verification.
 * Saves form data to localStorage so it can be recovered after redirect.
 */
export async function sendEmailVerificationLink(
  email: string,
  formData: { name: string; linkedinUrl: string; role: string; lgpdConsent: boolean; tosConsent: boolean }
) {
  const auth = getFirebaseAuth();
  const url = `${window.location.origin}/request-access`;
  const actionCodeSettings = {
    url,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  // Save email + form data so we can complete signup after redirect
  window.localStorage.setItem(
    EMAIL_LINK_STORAGE_KEY,
    JSON.stringify({ email, ...formData })
  );
}

/**
 * Check if the current URL is a Firebase email sign-in link.
 */
export function isEmailSignInLink(): boolean {
  const auth = getFirebaseAuth();
  return isSignInWithEmailLink(auth, window.location.href);
}

/**
 * Complete email link sign-in and return the ID token.
 * Returns null if no stored form data or link is invalid.
 */
export async function completeEmailSignIn(): Promise<{
  idToken: string;
  formData: { email: string; name: string; linkedinUrl: string; role: string; lgpdConsent: boolean; tosConsent: boolean };
} | null> {
  const auth = getFirebaseAuth();
  const stored = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
  if (!stored) return null;

  let formData;
  try {
    formData = JSON.parse(stored);
  } catch {
    window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    return null;
  }
  const { email } = formData;

  const result = await signInWithEmailLink(auth, email, window.location.href);
  // Force token refresh to ensure email_verified claim is set
  const idToken = await result.user.getIdToken(true);

  // Clean up localStorage
  window.localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);

  return { idToken, formData };
}

/**
 * Get stored signup form data (for displaying while completing email verification).
 */
export function getStoredSignupData(): {
  email: string; name: string; linkedinUrl: string; role: string;
} | null {
  const stored = window.localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
