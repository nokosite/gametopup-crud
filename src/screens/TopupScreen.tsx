import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { GameTopup, TopupOption, Transaction } from '../types';
import { firebaseService } from '../services/firebaseService';
import { checkNetworkConnection } from '../utils/networkUtils';

type TopupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Topup'>;
type TopupScreenRouteProp = RouteProp<RootStackParamList, 'Topup'>;

const TopupScreen: React.FC = () => {
  const navigation = useNavigation<TopupScreenNavigationProp>();
  const route = useRoute<TopupScreenRouteProp>();
  const { game, option } = route.params;

  const [userGameId, setUserGameId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods = [
    { id: 'dana', name: 'DANA', icon: '💙', color: '#0081C9' },
    { id: 'ovo', name: 'OVO', icon: '💜', color: '#4C3494' },
    { id: 'gopay', name: 'GoPay', icon: '💚', color: '#00AAE4' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', color: '#27AE60' },
    { id: 'qris', name: 'QRIS', icon: '📱', color: '#E74C3C' },
  ];

  const handleTopup = async () => {
    if (!userGameId.trim()) {
      Alert.alert('Error', 'Game ID harus diisi');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Pilih metode pembayaran');
      return;
    }

    setIsLoading(true);
    try {
      const isConnected = await checkNetworkConnection();
      if (!isConnected) {
        Alert.alert('Tidak Ada Koneksi', 'Pastikan Anda terhubung ke internet untuk melakukan topup.');
        return;
      }

      // Create transaction
      const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: 'user123', // This should come from auth context
        gameId: game.id,
        topupOptionId: option.id,
        amount: option.price,
        status: 'pending',
        paymentMethod: selectedPaymentMethod,
        userGameId: userGameId.trim(),
      };

      const transactionId = await firebaseService.createTransaction(transaction);

      // Navigate to payment screen
      navigation.navigate('Payment', { 
        transaction: { 
          ...transaction, 
          id: transactionId,
          createdAt: new Date(),
          updatedAt: new Date()
        } 
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal membuat transaksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Topup {game.gameName}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Info */}
        <View style={styles.gameInfoCard}>
          <Image 
            source={{ uri: game.gameIcon }} 
            style={styles.gameIcon}
            defaultSource={require('../../assets/icon.png')}
          />
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>{game.gameName}</Text>
            <Text style={styles.topupOptionName}>{option.name}</Text>
            <Text style={styles.topupOptionPrice}>
              Rp {option.price.toLocaleString()}
            </Text>
            {option.bonus && (
              <Text style={styles.topupOptionBonus}>{option.bonus}</Text>
            )}
          </View>
        </View>

        {/* Game ID Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Game ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan Game ID Anda"
            value={userGameId}
            onChangeText={setUserGameId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputHint}>
            Pastikan Game ID sudah benar sebelum melakukan topup
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
          <View style={styles.paymentMethodsGrid}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                <Text style={styles.paymentMethodName}>{method.name}</Text>
                {selectedPaymentMethod === method.id && (
                  <Text style={styles.selectedIndicator}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Ringkasan</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Game:</Text>
              <Text style={styles.summaryValue}>{game.gameName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Topup:</Text>
              <Text style={styles.summaryValue}>{option.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Game ID:</Text>
              <Text style={styles.summaryValue}>{userGameId || '-'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pembayaran:</Text>
              <Text style={styles.summaryValue}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || '-'}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                Rp {option.price.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Topup Button */}
        <TouchableOpacity
          style={[styles.topupButton, isLoading && styles.buttonDisabled]}
          onPress={handleTopup}
          disabled={isLoading}
        >
          <Text style={styles.topupButtonText}>
            {isLoading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  gameInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  topupOptionName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  topupOptionPrice: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: '700',
  },
  topupOptionBonus: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '500',
    marginTop: 2,
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  paymentSection: {
    marginBottom: 20,
  },
  paymentMethodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentMethodCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedPaymentMethod: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27ae60',
  },
  topupButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  topupButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TopupScreen; 