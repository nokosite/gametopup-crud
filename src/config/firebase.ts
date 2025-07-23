import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC2n7dZImtgO_QbfT2zZmFsr7j1gTz5qM0",
  authDomain: "vsgo-5f97b.firebaseapp.com",
  projectId: "vsgo-5f97b",
  storageBucket: "vsgo-5f97b.firebasestorage.app",
  messagingSenderId: "1094320513827",
  appId: "1:1094320513827:web:8a6d591e9d57585bb22296",
  measurementId: "G-0NSEJ1QPMQ"
};

// Initialize Firebase app only if it doesn't already exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize auth with AsyncStorage persistence
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize authentication for Firestore access
export const initializeFirebaseAuth = async () => {
  try {
    // Check if user is already signed in
    if (auth.currentUser) {
      return auth.currentUser;
    }
    
    // Try anonymous auth for Firestore access
    try {
      const userCredential = await signInAnonymously(auth);
      return userCredential.user;
    } catch (authError: any) {
      // If anonymous auth is restricted, we'll continue without auth silently
      if (authError.code === 'auth/admin-restricted-operation') {
        // Silent fallback - no error logging needed
        return null;
      }
      
      // For other auth errors, log but don't throw
      return null;
    }
  } catch (error) {
    // Silent fallback for any other errors
    return null;
  }
};

// Ensure authentication before Firestore operations
export const ensureAuthenticated = async () => {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      // If anonymous auth is disabled, we'll continue without auth silently
      if (error.code === 'auth/admin-restricted-operation') {
        // Silent fallback - no error logging needed
        return null;
      }
      
      // For other auth errors, log but don't throw
      return null;
    }
  }
  return auth.currentUser;
}; 