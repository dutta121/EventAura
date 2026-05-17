// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserDocument } from '../firebase/auth';

const AuthContext = createContext(null);

const TOKEN_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // Start a periodic token-force-refresh. If Firebase rejects (account disabled),
  // sign the user out immediately rather than waiting for token expiry.
  const startTokenRefresh = (user) => {
    stopTokenRefresh();
    refreshTimerRef.current = setInterval(async () => {
      try {
        await user.getIdToken(/* forceRefresh */ true);
      } catch (err) {
        const disabledCodes = ['auth/user-disabled', 'auth/user-token-expired', 'auth/invalid-user-token'];
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
