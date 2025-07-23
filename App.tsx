import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeFirebaseAuth } from './src/config/firebase';

export default function App() {
  useEffect(() => {
    // Initialize Firebase authentication on app start
    const initAuth = async () => {
      try {
        await initializeFirebaseAuth();
      } catch (error) {
        // Silent fallback - no error logging needed
      }
    };
    
    initAuth();
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
