import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { firebaseService } from '../services/firebaseService';
import { GameTopup } from '../types';
import { locationService } from '../services/locationService';

type GamesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Games'>;

const GamesScreen: React.FC = () => {
  const navigation = useNavigation<GamesScreenNavigationProp>();
  const [games, setGames] = useState<GameTopup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  const loadGames = async () => {
    try {
      setLoading(true);
      const gamesData = await firebaseService.getGames();
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const handleGamePress = (game: GameTopup) => {
    navigation.navigate('GameDetail', { game });
  };

  const handleEditPress = (game: GameTopup) => {
    navigation.navigate('EditGame', { game });
  };

  const handleDeletePress = (game: GameTopup) => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus game "${game.gameName}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.deleteGame(game.id);
              Alert.alert('Sukses', 'Game berhasil dihapus!');
              loadGames(); // Reload the list
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus game';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      MOBA: '#667eea',
      FPS: '#f093fb',
      RPG: '#4facfe',
      STRATEGY: '#43e97b',
      CASUAL: '#fa709a',
    };
    return colors[category] || '#6c757d';
  };

  const formatLocation = (location: any) => {
    if (!location) return null;
    
    if (location.address) {
      return location.address;
    }
    
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  };

  const renderGameItem = ({ item }: { item: GameTopup }) => (
    <View style={styles.gameItem}>
      <View style={styles.gameHeader}>
        <Image
          source={{ uri: item.gameIcon }}
          style={styles.gameIcon}
          resizeMode="cover"
        />
        <View style={styles.gameInfo}>
          <Text style={styles.gameName}>{item.gameName}</Text>
          <View style={styles.badges}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            {item.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>🔥</Text>
              </View>
            )}
            {item.isFeatured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>⭐</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Location Information */}
      {item.location && (
        <View style={styles.locationContainer}>
          <Text style={styles.locationLabel}>📍 Lokasi:</Text>
          <Text style={styles.locationText}>
            {formatLocation(item.location)}
          </Text>
          {item.location.accuracy && (
            <Text style={styles.accuracyText}>
              Akurasi: ±{Math.round(item.location.accuracy)}m
            </Text>
          )}
        </View>
      )}

      <View style={styles.gameActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleGamePress(item)}
        >
          <Text style={styles.actionButtonText}>👁️ Detail</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPress(item)}
        >
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePress(item)}
        >
          <Text style={styles.actionButtonText}>🗑️ Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat data game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Game</Text>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => navigation.navigate('Search')}
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada game yang ditambahkan</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => navigation.navigate('AddGame')}
            >
              <Text style={styles.addFirstButtonText}>+ Tambah Game Pertama</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#495057',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  gameItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  popularBadge: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  featuredBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    color: '#212529',
    fontSize: 10,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#424242',
    marginBottom: 2,
  },
  accuracyText: {
    fontSize: 10,
    color: '#666',
  },
  gameActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#17a2b8',
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  addFirstButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GamesScreen; 