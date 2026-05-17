// src/firebase/firestore.js
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ─── Vendors ──────────────────────────────────────────────────────────────────

export const getVendors = async (category = null) => {
  const ref = collection(db, 'vendors');
  const q = category ? query(ref, where('category', '==', category)) : ref;
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getVendorById = async (id) => {
  const snap = await getDoc(doc(db, 'vendors', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addVendor = async (data) => {
  return addDoc(collection(db, 'vendors'), { ...data, createdAt: serverTimestamp() });
};

export const updateVendor = async (id, data) => {
  return updateDoc(doc(db, 'vendors', id), data);
};

export const deleteVendor = async (id) => {
  return deleteDoc(doc(db, 'vendors', id));
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  return addDoc(collection(db, 'bookings'), {
    ...bookingData,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
};

export const getUserBookings = async (userId) => {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Real-time listener — returns an unsubscribe function
export const subscribeUserBookings = (userId, callback, onError) => {
  // NOTE: Using only `where` (no orderBy) avoids needing a composite Firestore index.
  // We sort client-side instead.
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const bookings = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          // Sort by createdAt descending (Firestore Timestamp or null)
          const tA = a.createdAt?.seconds ?? 0;
          const tB = b.createdAt?.seconds ?? 0;
          return tB - tA;
        });
      callback(bookings);
    },
    (err) => {
      console.error('[subscribeUserBookings] Firestore error:', err.message);
      if (onError) onError(err);
    }
  );
};

export const getAllBookings = async () => {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateBookingStatus = async (id, status) => {
  return updateDoc(doc(db, 'bookings', id), { status });
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateUserRole = async (uid, role) => {
  return updateDoc(doc(db, 'users', uid), { role });
};

// Returns true if a Firestore user document already exists with this email
export const emailExistsInFirestore = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  return !snap.empty;
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = async () => {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
