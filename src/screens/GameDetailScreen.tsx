import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { GameTopup } from '../types';
import { locationService } from '../services/locationService';

type GameDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GameDetail'>;
type GameDetailScreenRouteProp = RouteProp<RootStackParamList, 'GameDetail'>;

const { width } = Dimensions.get('window');

const GameDetailScreen: React.FC = () => {
  const navigation = useNavigation<GameDetailScreenNavigationProp>();
  const route = useRoute<GameDetailScreenRouteProp>();
  const { game } = route.params;
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<GameTopup>(game);

  useFocusEffect(
    React.useCallback(() => {
      setCurrentGame(game);
    }, [game])
  );

  const handleEditPress = () => {
    navigation.navigate('EditGame', { game: currentGame });
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus game "${currentGame.gameName}"?`,
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
              await firebaseService.deleteGame(currentGame.id);
              Alert.alert('Sukses', 'Game berhasil dihapus!', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus game';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleFavoritePress = () => {
    Alert.alert('Info', 'Fitur favorit belum tersedia');
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
    if (!location) return 'Lokasi tidak tersedia';
    
    if (location.address) {
      return location.address;
    }
    
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  const calculateDistance = (gameLocation: any) => {
    if (!gameLocation || !user?.lastLocation) return null;
    
    try {
      const distance = locationService.calculateDistance(
        user.lastLocation.latitude,
        user.lastLocation.longitude,
        gameLocation.latitude,
        gameLocation.longitude
      );
      return distance;
    } catch (error) {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentGame.gameName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditPress}>
            <Text style={styles.actionButtonText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeletePress}>
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Game Info Card */}
        <View style={styles.gameInfoCard}>
          <Image
            source={{ uri: currentGame.gameIcon }}
            style={styles.gameIcon}
            resizeMode="cover"
          />
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>{currentGame.gameName}</Text>
            <View style={styles.badges}>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(currentGame.category) }]}>
                <Text style={styles.categoryText}>{currentGame.category}</Text>
              </View>
              {currentGame.isPopular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>🔥 Populer</Text>
                </View>
              )}
              {currentGame.isFeatured && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>⭐ Unggulan</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Location Information */}
        {currentGame.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Lokasi Game</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationText}>
                {formatLocation(currentGame.location)}
              </Text>
              {currentGame.location.accuracy && (
                <Text style={styles.accuracyText}>
                  Akurasi: ±{Math.round(currentGame.location.accuracy)}m
                </Text>
              )}
              {currentGame.location.timestamp && (
                <Text style={styles.timestampText}>
                  Diperbarui: {new Date(currentGame.location.timestamp).toLocaleString('id-ID')}
                </Text>
              )}
              {calculateDistance(currentGame.location) && (
                <Text style={styles.distanceText}>
                  Jarak: {calculateDistance(currentGame.location)?.toFixed(2)} km dari lokasi Anda
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Game Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Detail Game</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nama Game:</Text>
              <Text style={styles.detailValue}>{currentGame.gameName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kategori:</Text>
              <Text style={styles.detailValue}>{currentGame.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                {currentGame.isPopular && (
                  <Text style={styles.statusText}>Populer</Text>
                )}
                {currentGame.isFeatured && (
                  <Text style={styles.statusText}>Unggulan</Text>
                )}
                {!currentGame.isPopular && !currentGame.isFeatured && (
                  <Text style={styles.statusText}>Biasa</Text>
                )}
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Opsi Topup:</Text>
              <Text style={styles.detailValue}>{currentGame.topupOptions.length} opsi</Text>
            </View>
          </View>
        </View>

        {/* Topup Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Opsi Topup</Text>
          {currentGame.topupOptions.map((option, index) => (
            <View key={option.id} style={styles.topupOptionCard}>
              <View style={styles.topupOptionHeader}>
                <Text style={styles.topupOptionName}>{option.name}</Text>
                {option.isPopular && (
                  <View style={styles.popularOptionBadge}>
                    <Text style={styles.popularOptionText}>🔥</Text>
                  </View>
                )}
              </View>
              <View style={styles.topupOptionDetails}>
                <Text style={styles.topupOptionPrice}>
                  {option.price.toLocaleString('id-ID')} {option.currency}
                </Text>
                {option.bonus && (
                  <Text style={styles.topupOptionBonus}>{option.bonus}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.footer}>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleEditPress}>
            <Text style={styles.quickActionText}>✏️ Edit Game</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.goBack()}>
            <Text style={styles.quickActionText}>📋 Kembali ke Daftar</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameIcon: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  popularBadge: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredBadge: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#212529',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
    marginBottom: 4,
  },
  accuracyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  topupOptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topupOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topupOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  popularOptionBadge: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularOptionText: {
    fontSize: 12,
    color: '#fff',
  },
  topupOptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topupOptionPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  topupOptionBonus: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GameDetailScreen; 