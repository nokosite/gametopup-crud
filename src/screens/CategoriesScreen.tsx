import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { firebaseService } from '../services/firebaseService';
import { GameTopup } from '../types';

type CategoriesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Categories'>;

const CategoriesScreen: React.FC = () => {
  const [games, setGames] = useState<GameTopup[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredGames, setFilteredGames] = useState<GameTopup[]>([]);
  const navigation = useNavigation<CategoriesScreenNavigationProp>();

  const categories = [
    { id: 'MOBA', name: 'MOBA', icon: '⚔️', color: '#667eea', description: 'Multiplayer Online Battle Arena' },
    { id: 'FPS', name: 'FPS', icon: '🎯', color: '#f093fb', description: 'First Person Shooter' },
    { id: 'RPG', name: 'RPG', icon: '🗡️', color: '#4facfe', description: 'Role Playing Game' },
    { id: 'STRATEGY', name: 'Strategy', icon: '🧠', color: '#43e97b', description: 'Strategy Games' },
    { id: 'CASUAL', name: 'Casual', icon: '🎮', color: '#fa709a', description: 'Casual Games' },
  ];

  const loadGames = async () => {
    try {
      const gamesData = await firebaseService.getGames();
      setGames(gamesData);
      setFilteredGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setFilteredGames(games);
    } else {
      setSelectedCategory(categoryId);
      const filtered = games.filter(game => game.category === categoryId);
      setFilteredGames(filtered);
    }
  };

  const handleGamePress = (game: GameTopup) => {
    navigation.navigate('GameDetail', { game });
  };

  const handleTopupPress = (game: GameTopup, option: any) => {
    navigation.navigate('Topup', { game, option });
  };

  const renderCategoryCard = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    const gameCount = games.filter(game => game.category === item.id).length;

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          { backgroundColor: item.color },
          isSelected && styles.selectedCategoryCard
        ]}
        onPress={() => handleCategoryPress(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription}>{item.description}</Text>
        <Text style={styles.gameCount}>{gameCount} game</Text>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedIndicatorText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderGameItem = ({ item }: { item: GameTopup }) => {
    return (
      <TouchableOpacity
        style={styles.gameItem}
        onPress={() => handleGamePress(item)}
        activeOpacity={0.8}
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
        
        <View style={styles.topupOptionsContainer}>
          <Text style={styles.topupOptionsTitle}>Pilihan Topup:</Text>
          <View style={styles.topupOptionsGrid}>
            {item.topupOptions.slice(0, 3).map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={styles.topupOptionCard}
                onPress={() => handleTopupPress(item, option)}
              >
                <Text style={styles.topupOptionName}>{option.name}</Text>
                <Text style={styles.topupOptionPrice}>
                  Rp {option.price.toLocaleString()}
                </Text>
                {option.bonus && (
                  <Text style={styles.topupOptionBonus}>{option.bonus}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>‹ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kategori Game</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Pilih Kategori</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Games List */}
        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory 
              ? `Game ${categories.find(c => c.id === selectedCategory)?.name}`
              : 'Semua Game'
            }
          </Text>
          <FlatList
            data={filteredGames}
            renderItem={renderGameItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gamesContainer}
          />
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
  content: {
    flex: 1,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingRight: 20,
  },
  categoryCard: {
    width: 150,
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  selectedCategoryCard: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 4,
  },
  gameCount: {
    fontSize: 10,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
  },
  gamesSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  gamesContainer: {
    paddingBottom: 20,
  },
  gameItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  gameCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  popularBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  topupOptionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 16,
  },
  topupOptionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  topupOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topupOptionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  topupOptionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  topupOptionPrice: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 2,
  },
  topupOptionBonus: {
    fontSize: 9,
    color: '#ff6b6b',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default CategoriesScreen; 