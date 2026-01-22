import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock Auth Context - No Firebase dependencies
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
    // Check for existing session in localStorage
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('mock_user_session');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setAdmin({
            id: user.uid,
            email: user.email,
            role: 'admin',
            isActive: true
          });
        }
      } catch (error) {
        console.error('Error restoring session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser = {
            uid: 'mock-admin-123',
            email: email,
            displayName: 'Admin User',
            emailVerified: true,
          };

          const mockAdmin = {
            id: 'mock-admin-123',
            email: email,
            role: 'admin',
            isActive: true,
            lastLoginAt: new Date(),
          };

          setCurrentUser(mockUser);
          setAdmin(mockAdmin);
          localStorage.setItem('mock_user_session', JSON.stringify(mockUser));

          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Invalid credentials' });
        }
      }, 500); // Fake delay
    });
  };

  const logout = async () => {
    setCurrentUser(null);
    setAdmin(null);
    localStorage.removeItem('mock_user_session');
    return { success: true };
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
