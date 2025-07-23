import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { firebaseService } from '../services/firebaseService';
import { Transaction } from '../types';

type TransactionHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionHistory'>;

const TransactionHistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<TransactionHistoryScreenNavigationProp>();

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const transactionsData = await firebaseService.getUserTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // Load transactions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27ae60';
      case 'processing':
        return '#f39c12';
      case 'pending':
        return '#3498db';
      case 'failed':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'processing':
        return 'Diproses';
      case 'pending':
        return 'Menunggu';
      case 'failed':
        return 'Gagal';
      default:
        return 'Unknown';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons: { [key: string]: string } = {
      'dana': '💙',
      'ovo': '💜',
      'gopay': '💚',
      'bank_transfer': '🏦',
      'qris': '📱',
    };
    return icons[method] || '💳';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionId}>#{item.id.slice(-8)}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Game ID:</Text>
            <Text style={styles.detailValue}>{item.userGameId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jumlah:</Text>
            <Text style={styles.detailValue}>Rp {item.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pembayaran:</Text>
            <View style={styles.paymentMethodContainer}>
              <Text style={styles.paymentMethodIcon}>{getPaymentMethodIcon(item.paymentMethod)}</Text>
              <Text style={styles.paymentMethodText}>{item.paymentMethod.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
      <Text style={styles.emptyDescription}>
        Mulai dengan melakukan topup game favorit Anda
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Games')}
      >
        <Text style={styles.browseButtonText}>Jelajahi Game</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TransactionHistoryScreen; 