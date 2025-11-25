/**
 * Authentication Context
 * Manages user authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser, signOut as firebaseSignOut } from '../services/firebaseService';
import { User } from '../types/firebase.types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const data = await getCurrentUser();
      setUserData(data);
    } else {
      setUserData(null);
    }
  };

  const refreshUser = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  const handleSignOut = async () => {
    await firebaseSignOut();
    setUser(null);
    setUserData(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      await loadUserData(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    signOut: handleSignOut,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
