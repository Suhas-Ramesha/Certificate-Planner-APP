import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../config/api';

interface User {
  id: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        
        // Get Firebase ID token
        const token = await firebaseUser.getIdToken();
        
        // Store token for backend API calls
        await AsyncStorage.setItem('firebase_token', token);
        
        // Sync user with your backend (create user if doesn't exist)
        try {
          const response = await api.post('/auth/firebase', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || undefined
          });
          
          // Set user from backend response
          setUser(response.data.user);
        } catch (error: any) {
          console.error('Backend sync error:', error);
          // If backend sync fails, use Firebase user data
          setUser({
            id: 0, // Will be set by backend
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || undefined
          });
        }
      } else {
        await AsyncStorage.removeItem('firebase_token');
        setUser(null);
        setFirebaseUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle the rest
  };

  const register = async (email: string, password: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    
    // onAuthStateChanged will handle the rest
  };

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will handle the rest
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, logout }}>
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
