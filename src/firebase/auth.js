// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './config';

export const signUpWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  await createUserDocument(userCredential.user, displayName);
  return userCredential;
};

export const signInWithEmail = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Check if a document already exists for this email under a DIFFERENT UID
  // (i.e., the user previously signed up with email/password)
  const emailQuery = query(collection(db, 'users'), where('email', '==', user.email));
  const emailSnap = await getDocs(emailQuery);

  const collision = emailSnap.docs.find((d) => d.id !== user.uid);
  if (collision) {
    // Sign out the freshly authenticated Google session to prevent a stray account
    await signOut(auth);
    throw Object.assign(
      new Error('An account with this email already exists. Please sign in with your email & password instead.'),
      { code: 'auth/account-exists-with-different-credential' }
    );
  }

  await createUserDocument(user, user.displayName);
  return result;
};

export const signOutUser = async () => {
  return signOut(auth);
};

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
