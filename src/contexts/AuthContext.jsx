import React, { createContext, useContext, useState, useEffect } from 'react';
import { mongodb } from '../lib/mongodb.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await mongodb.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = mongodb.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { error } = await mongodb.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await mongodb.auth.signOut();
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
