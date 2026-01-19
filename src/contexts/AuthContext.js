import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            const adminData = { id: adminDoc.id, ...adminDoc.data() };
            if (adminData.isActive) {
              setCurrentUser(user);
              setAdmin(adminData);
            } else {
              await firebaseSignOut(auth);
              setCurrentUser(null);
              setAdmin(null);
            }
          } else {
            // Not an admin, sign out
            await firebaseSignOut(auth);
            setCurrentUser(null);
            setAdmin(null);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setCurrentUser(null);
          setAdmin(null);
        }
      } else {
        setCurrentUser(null);
        setAdmin(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify admin status
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      if (!adminDoc.exists()) {
        await firebaseSignOut(auth);
        throw new Error('Access denied. This account is not an admin.');
      }

      const adminData = adminDoc.data();
      if (!adminData.isActive) {
        await firebaseSignOut(auth);
        throw new Error('Account is inactive. Please contact support.');
      }

      // Update last login
      await updateDoc(doc(db, 'admins', user.uid), {
        lastLoginAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      let errorMessage = 'Authentication failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    currentUser,
    admin,
    login,
    logout,
    loading,
    isAuthenticated: !!currentUser && !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
