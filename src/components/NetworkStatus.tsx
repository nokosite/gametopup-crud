import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { addNetworkListener } from '../utils/networkUtils';

const NetworkStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = addNetworkListener((connected) => {
      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📶</Text>
      <Text style={styles.text}>Tidak ada koneksi internet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NetworkStatus; 