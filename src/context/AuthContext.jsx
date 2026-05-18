// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserDocument, handleGoogleRedirectResult } from '../firebase/auth';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // ── Process Google redirect result once on app load ──────────────────────
  useEffect(() => {
    handleGoogleRedirectResult()
      .then((result) => {
        if (result?.user) {
          // onAuthStateChanged below will pick up the user automatically
          toast.success('Welcome! 🎉');
        }
      })
      .catch((err) => {
        if (err.code === 'auth/account-exists-with-different-credential') {
          toast.error(err.message, { autoClose: 6000 });
        } else if (err.code !== 'auth/cancelled-popup-request') {
          toast.error('Google sign-in failed. Please try again.');
          console.error('[Google redirect]', err);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Token refresh to detect disabled accounts ────────────────────────────
  const startTokenRefresh = (user) => {
    stopTokenRefresh();
    refreshTimerRef.current = setInterval(async () => {
      try {
        await user.getIdToken(true);
      } catch (err) {
        const disabledCodes = [
          'auth/user-disabled',
          'auth/user-token-expired',
          'auth/invalid-user-token',
        ];
        if (disabledCodes.includes(err.code)) {
          console.warn('[AuthContext] Account disabled — signing out.');
          await signOut(auth);
        }
      }
    }, TOKEN_REFRESH_INTERVAL_MS);
  };

  const stopTokenRefresh = () => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // ── Auth state listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const doc = await getUserDocument(user.uid);
        setUserDoc(doc);
        startTokenRefresh(user);
      } else {
        setUserDoc(null);
        stopTokenRefresh();
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      stopTokenRefresh();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = userDoc?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, userDoc, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
