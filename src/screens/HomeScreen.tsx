import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import NetworkStatus from '../components/NetworkStatus';
import { firebaseService } from '../services/firebaseService';
import { GameTopup } from '../types';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<GameTopup[]>([]);
  const [popularGames, setPopularGames] = useState<GameTopup[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load games when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  const loadGames = async () => {
    try {
      const [featured, popular] = await Promise.all([
        firebaseService.getFeaturedGames(),
        firebaseService.getPopularGames()
      ]);
      
      setFeaturedGames(featured);
      setPopularGames(popular);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar?',
      [
        {
          text: 'Batal',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleGamePress = (game: GameTopup) => {
    navigation.navigate('GameDetail', { game });
  };

  const categories = [
    { id: 'MOBA', name: 'MOBA', icon: '⚔️', color: '#667eea' },
    { id: 'FPS', name: 'FPS', icon: '🎯', color: '#f093fb' },
    { id: 'RPG', name: 'RPG', icon: '🗡️', color: '#4facfe' },
    { id: 'STRATEGY', name: 'Strategy', icon: '🧠', color: '#43e97b' },
    { id: 'CASUAL', name: 'Casual', icon: '🎮', color: '#fa709a' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  };

  const renderGameCard = ({ item }: { item: GameTopup }) => (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => handleGamePress(item)}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.gameIcon }} 
        style={styles.gameIcon}
        defaultSource={require('../../assets/icon.png')}
      />
      <View style={styles.gameInfo}>
        <Text style={styles.gameName}>{item.gameName}</Text>
        <Text style={styles.gameCategory}>{item.category}</Text>
        <View style={styles.topupOptions}>
          {item.topupOptions.slice(0, 2).map((option, index) => (
            <Text key={index} style={styles.topupOption}>
              {option.name}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.gameArrowContainer}>
        <Text style={styles.gameArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => navigation.navigate('Games', { category: item.id })}
      activeOpacity={0.9}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NetworkStatus />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategori Game</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Featured Games Section */}
        {featuredGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Unggulan</Text>
            <FlatList
              data={featuredGames}
              renderItem={renderGameCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gamesContainer}
            />
          </View>
        )}

        {/* Popular Games Section */}
        {popularGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Populer</Text>
            <FlatList
              data={popularGames}
              renderItem={renderGameCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gamesContainer}
            />
          </View>
        )}

        {/* CRUD Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Kelola Game</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Games')}
            >
              <Text style={styles.quickActionIcon}>👁️</Text>
              <Text style={styles.quickActionText}>Lihat Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('AddGame')}
            >
              <Text style={styles.quickActionIcon}>➕</Text>
              <Text style={styles.quickActionText}>Tambah Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.quickActionIcon}>🔍</Text>
              <Text style={styles.quickActionText}>Cari Game</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.quickActionIcon}>👤</Text>
              <Text style={styles.quickActionText}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
  },
  categoriesContainer: {
    paddingRight: 24,
  },
  categoryCard: {
    width: 88,
    height: 88,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  gamesContainer: {
    paddingRight: 24,
  },
  gameCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  gameCategory: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '500',
  },
  topupOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topupOption: {
    fontSize: 10,
    color: '#059669',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 4,
    fontWeight: '500',
  },
  gameArrowContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameArrow: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '300',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HomeScreen; 