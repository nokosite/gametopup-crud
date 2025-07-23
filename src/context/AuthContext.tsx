import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, RegisterData, LoginData, Location } from '../types';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { handleFirebaseAuthError } from '../utils/errorHandler';
import { locationService } from '../services/locationService';

interface AuthContextType {
  user: User | null;
  register: (data: RegisterData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  updateUserLocation: (location: Location) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Listen to auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          }
        } else {
          // User is signed out
          setUser(null);
        }
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      setIsLoading(false);
    }
  };

  const updateUserLocation = async (location: Location) => {
    if (user) {
      const updatedUser = { ...user, lastLocation: location };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Don't set user data immediately after registration
      // User needs to login first
      
      // Sign out to force login
      await auth.signOut();
      setUser(null);
      await AsyncStorage.removeItem('user');
      
      return true;
    } catch (error: unknown) {
      const errorMessage = handleFirebaseAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const login = async (data: LoginData): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Get current location for user
      let userLocation: Location | null = null;
      try {
        userLocation = await locationService.getLocationWithAddress();
      } catch (error) {
        console.error('Error getting location during login:', error);
      }

      // Create user data for login
      const newUserData: User = {
        id: firebaseUser.uid,
        username: data.email.split('@')[0], // Use email prefix as username
        email: data.email,
        uid: firebaseUser.uid,
        lastLocation: userLocation || undefined
      };
      
      setUser(newUserData);
      await AsyncStorage.setItem('user', JSON.stringify(newUserData));
      
      return true;
    } catch (error: unknown) {
      const errorMessage = handleFirebaseAuthError(error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, isLoading, updateUserLocation }}>
      {children}
    </AuthContext.Provider>
  );
}; 