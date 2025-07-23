import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { firebaseService } from '../services/firebaseService';
import { GameTopup } from '../types';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<GameTopup[]>([]);
  const [filteredGames, setFilteredGames] = useState<GameTopup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const loadGames = async () => {
    setIsLoading(true);
    try {
      const gamesData = await firebaseService.getGames();
      setGames(gamesData);
      setFilteredGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = games.filter(game =>
        game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGames(filtered);
    } else {
      setFilteredGames(games);
    }
  }, [searchQuery, games]);

  const handleGamePress = (game: GameTopup) => {
    navigation.navigate('GameDetail', { game });
  };

  const renderGameItem = ({ item }: { item: GameTopup }) => {
    return (
      <TouchableOpacity
        style={styles.gameItem}
        onPress={() => handleGamePress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.gameHeader}>
          <Image 
            source={{ uri: item.gameIcon }} 
            style={styles.gameIcon}
            defaultSource={require('../../assets/icon.png')}
          />
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>{item.gameName}</Text>
            <Text style={styles.gameCategory}>{item.category}</Text>
            {item.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>🔥 Populer</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.gameDetails}>
          <Text style={styles.gameDetailsTitle}>Detail Game:</Text>
          <View style={styles.gameDetailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Kategori</Text>
              <Text style={styles.detailValue}>{item.category}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {item.isPopular ? 'Populer' : 'Biasa'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Opsi Topup</Text>
              <Text style={styles.detailValue}>{item.topupOptions.length}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Tidak ada hasil' : 'Mulai mencari game'}
      </Text>
      <Text style={styles.emptyDescription}>
        {searchQuery 
          ? `Tidak ada game yang cocok dengan "${searchQuery}"`
          : 'Ketik nama game atau kategori untuk mencari'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cari Game</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari game atau kategori..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#94a3b8"
        />
        <Text style={styles.searchHint}>
          {filteredGames.length} game ditemukan
        </Text>
      </View>

      <FlatList
        data={filteredGames}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  gameItem: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  gameIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  gameCategory: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  popularBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  gameDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 20,
  },
  gameDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  gameDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
});

export default SearchScreen; 