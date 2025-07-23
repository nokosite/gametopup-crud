import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { Transaction } from '../types';

type SuccessScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Success'>;
type SuccessScreenRouteProp = RouteProp<RootStackParamList, 'Success'>;

const SuccessScreen: React.FC = () => {
  const navigation = useNavigation<SuccessScreenNavigationProp>();
  const route = useRoute<SuccessScreenRouteProp>();
  const { transaction } = route.params;

  const handleGoHome = () => {
    navigation.navigate('Main');
  };

  const handleViewHistory = () => {
    navigation.navigate('TransactionHistory');
  };

  const handleTopupAgain = () => {
    navigation.navigate('Games');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>✅</Text>
        </View>

        {/* Success Message */}
        <View style={styles.successMessage}>
          <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
          <Text style={styles.successSubtitle}>
            Topup Anda sedang diproses dan akan selesai dalam 1-5 menit
          </Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.transactionCard}>
          <Text style={styles.cardTitle}>Detail Transaksi</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Transaksi:</Text>
            <Text style={styles.detailValue}>#{transaction.id.slice(-8)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Game ID:</Text>
            <Text style={styles.detailValue}>{transaction.userGameId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jumlah:</Text>
            <Text style={styles.detailValue}>Rp {transaction.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Diproses</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Waktu:</Text>
            <Text style={styles.detailValue}>
              {new Date(transaction.createdAt).toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <Text style={styles.cardTitle}>Langkah Selanjutnya</Text>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Cek email Anda untuk konfirmasi pembayaran
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Topup akan diproses dalam 1-5 menit
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Anda akan mendapat notifikasi saat selesai
            </Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>
              Cek riwayat transaksi untuk status terbaru
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoHome}
          >
            <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewHistory}
          >
            <Text style={styles.secondaryButtonText}>Lihat Riwayat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={handleTopupAgain}
          >
            <Text style={styles.tertiaryButtonText}>Topup Lagi</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 80,
  },
  successMessage: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#27ae60',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  transactionCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  nextStepsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#667eea',
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SuccessScreen; 