import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Transaction } from '../types';
import { firebaseService } from '../services/firebaseService';

type PaymentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;
type PaymentScreenRouteProp = RouteProp<RootStackParamList, 'Payment'>;

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<PaymentScreenNavigationProp>();
  const route = useRoute<PaymentScreenRouteProp>();
  const { transaction } = route.params;

  const [isProcessing, setIsProcessing] = useState(false);

  const getPaymentMethodInfo = (method: string) => {
    const methods: { [key: string]: { name: string; icon: string; color: string; instructions: string[] } } = {
      'dana': {
        name: 'DANA',
        icon: '💙',
        color: '#0081C9',
        instructions: [
          '1. Buka aplikasi DANA',
          '2. Scan QR Code di bawah',
          '3. Masukkan nominal Rp ' + transaction.amount.toLocaleString(),
          '4. Konfirmasi pembayaran',
          '5. Tunggu notifikasi sukses'
        ]
      },
      'ovo': {
        name: 'OVO',
        icon: '💜',
        color: '#4C3494',
        instructions: [
          '1. Buka aplikasi OVO',
          '2. Scan QR Code di bawah',
          '3. Masukkan nominal Rp ' + transaction.amount.toLocaleString(),
          '4. Konfirmasi pembayaran',
          '5. Tunggu notifikasi sukses'
        ]
      },
      'gopay': {
        name: 'GoPay',
        icon: '💚',
        color: '#00AAE4',
        instructions: [
          '1. Buka aplikasi GoJek',
          '2. Scan QR Code di bawah',
          '3. Masukkan nominal Rp ' + transaction.amount.toLocaleString(),
          '4. Konfirmasi pembayaran',
          '5. Tunggu notifikasi sukses'
        ]
      },
      'bank_transfer': {
        name: 'Bank Transfer',
        icon: '🏦',
        color: '#27AE60',
        instructions: [
          '1. Transfer ke rekening:',
          '   Bank BCA: 1234567890',
          '   a.n. GameTopup Store',
          '2. Nominal: Rp ' + transaction.amount.toLocaleString(),
          '3. Konfirmasi transfer',
          '4. Upload bukti transfer'
        ]
      },
      'qris': {
        name: 'QRIS',
        icon: '📱',
        color: '#E74C3C',
        instructions: [
          '1. Scan QR Code di bawah',
          '2. Pilih aplikasi pembayaran',
          '3. Masukkan nominal Rp ' + transaction.amount.toLocaleString(),
          '4. Konfirmasi pembayaran',
          '5. Tunggu notifikasi sukses'
        ]
      }
    };
    return methods[method] || methods['qris'];
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigation.navigate('Success', { transaction });
    }, 3000);
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Batalkan Pembayaran',
      'Apakah Anda yakin ingin membatalkan pembayaran ini?',
      [
        {
          text: 'Lanjutkan',
          style: 'cancel',
        },
        {
          text: 'Batalkan',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const paymentInfo = getPaymentMethodInfo(transaction.paymentMethod);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Pembayaran</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>ID Transaksi:</Text>
            <Text style={styles.summaryValue}>#{transaction.id.slice(-8)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Game ID:</Text>
            <Text style={styles.summaryValue}>{transaction.userGameId}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Metode Pembayaran:</Text>
            <Text style={styles.summaryValue}>{paymentInfo.name}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Pembayaran:</Text>
            <Text style={styles.totalValue}>Rp {transaction.amount.toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodHeader}>
            <Text style={styles.paymentMethodIcon}>{paymentInfo.icon}</Text>
            <Text style={styles.paymentMethodName}>{paymentInfo.name}</Text>
          </View>
          <Text style={styles.paymentMethodDescription}>
            Ikuti instruksi di bawah untuk menyelesaikan pembayaran
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Cara Pembayaran</Text>
          {paymentInfo.instructions.map((instruction, index) => (
            <Text key={index} style={styles.instructionText}>
              {instruction}
            </Text>
          ))}
        </View>

        {/* QR Code Placeholder */}
        <View style={styles.qrCard}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR Code</Text>
            <Text style={styles.qrSubtext}>Scan untuk pembayaran</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.confirmButton, isProcessing && styles.buttonDisabled]}
            onPress={handleConfirmPayment}
            disabled={isProcessing}
          >
            <Text style={styles.confirmButtonText}>
              {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelPayment}
          >
            <Text style={styles.cancelButtonText}>Batalkan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
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
  paymentMethodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen; 