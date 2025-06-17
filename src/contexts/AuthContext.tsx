
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/users';
import { getCurrentUser as apiGetCurrentUser, logout as apiLogout } from '@/lib/authService';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    refetchUser();
  }, [refetchUser]);

  if (isLoading && typeof window !== 'undefined') {
    // Basic loading state, can be replaced with a more sophisticated loader/skeleton
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-2">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    );
  }


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
