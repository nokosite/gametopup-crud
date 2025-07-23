import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        // Navigate based on auth state
        if (user) {
          navigation.navigate('Main');
        } else {
          navigation.navigate('Login');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigation, isLoading, user]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎮</Text>
        </View>
        <Text style={styles.title}>Game Store</Text>
        <Text style={styles.subtitle}>Kelola Game dengan Mudah</Text>
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Create • Read • Update • Delete</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '400',
  },
  taglineContainer: {
    backgroundColor: '#334155',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  tagline: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SplashScreen; 