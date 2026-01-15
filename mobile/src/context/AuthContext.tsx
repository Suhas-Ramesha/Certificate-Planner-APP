import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import api from '../config/api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  clerkUser: ReturnType<typeof useUser>['user'] | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { signOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clerkLoaded) {
      return;
    }

    const syncUser = async () => {
      if (clerkUser) {
        try {
          // Get Clerk session token for backend
          const token = await clerkUser.getToken();
          
          // Store token for backend API calls
          if (token) {
            await AsyncStorage.setItem('clerk_token', token);
          }
          
          // Sync user with backend
          try {
            const response = await api.post('/auth/clerk', {
              clerkId: clerkUser.id,
              email: clerkUser.primaryEmailAddress?.emailAddress,
              name: clerkUser.fullName || clerkUser.firstName || undefined
            });
            
            setUser(response.data.user);
          } catch (error: any) {
            console.error('Backend sync error:', error);
            // If backend sync fails, use Clerk user data
            setUser({
              id: 0,
              email: clerkUser.primaryEmailAddress?.emailAddress || '',
              name: clerkUser.fullName || undefined
            });
          }
        } catch (error) {
          console.error('Error getting Clerk token:', error);
        }
      } else {
        await AsyncStorage.removeItem('clerk_token');
        setUser(null);
      }
      setLoading(false);
    };

    syncUser();
  }, [clerkUser, clerkLoaded]);

  const logout = async () => {
    await signOut();
    await AsyncStorage.removeItem('clerk_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, clerkUser, loading, logout }}>
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
