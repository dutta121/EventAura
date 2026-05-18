// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, getDocs,
  collection, query, where, serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

// ─── Email / Password ─────────────────────────────────────────────────────────

export const signUpWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  await createUserDocument(userCredential.user, displayName);
  return userCredential;
};

export const signInWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// ─── Google OAuth (Redirect flow — works on GitHub Pages / hosted envs) ──────

// Step 1: Kick off the redirect. Page navigates away to Google.
export const signInWithGoogle = () => {
  return signInWithRedirect(auth, googleProvider);
};

// Step 2: Called ONCE on app load (in AuthContext) to collect the redirect result.
export const handleGoogleRedirectResult = async () => {
  const result = await getRedirectResult(auth);
  if (!result) return null; // No pending redirect — normal load

  const user = result.user;

  // Block duplicate accounts: same email registered under a different UID
  const emailQuery = query(collection(db, 'users'), where('email', '==', user.email));
  const emailSnap = await getDocs(emailQuery);
  const collision = emailSnap.docs.find((d) => d.id !== user.uid);

  if (collision) {
    await signOut(auth);
    throw Object.assign(
      new Error('An account with this email already exists. Please sign in with your email & password instead.'),
      { code: 'auth/account-exists-with-different-credential' }
    );
  }

  await createUserDocument(user, user.displayName);
  return result;
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export const signOutUser = async () => signOut(auth);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const createUserDocument = async (user, displayName) => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'user',
      createdAt: serverTimestamp(),
    });
  }
};

export const getUserDocument = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
};
