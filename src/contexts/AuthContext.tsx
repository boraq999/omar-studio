
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/users';
import { getCurrentUser as apiGetCurrentUser, logout as apiLogout } from '@/lib/authService';
// Skeleton import is no longer needed here directly for a full page loader
// import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // isLoading is true initially

  const refetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await apiGetCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setCurrentUser(null); // Clear user from context
    // Potentially redirect to login page: router.push('/login');
    // For now, this mock logout just clears the user.
  }, []);

  useEffect(() => {
    // This effect runs on the client after the component mounts.
    // `isLoading` is true initially, and set to false after refetchUser completes.
    refetchUser();
  }, [refetchUser]);

  // Removed the conditional full-page loader that caused hydration errors.
  // The isLoading state is provided via context, and consuming components
  // can decide how to display loading states.
  // The server will render children with isLoading=true, and the client will initially
  // also render children with isLoading=true, avoiding a mismatch.
  // The useEffect will then trigger updates on the client.

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, refetchUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
