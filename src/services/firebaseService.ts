import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth, ensureAuthenticated } from '../config/firebase';
import { GameTopup, Transaction, TopupOption, Location } from '../types';
import { handleFirebaseFirestoreError, handleGenericError } from '../utils/errorHandler';
import { validateGameData } from '../utils/firebaseRules';
import { locationService } from './locationService';

const GAMES_COLLECTION = 'games';
const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';

// Helper function to add timeout to Firebase operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ]);
};

// Helper function to retry Firebase operations
const retryOperation = async (operation: () => Promise<any>, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await withTimeout(operation(), 15000); // 15 second timeout
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // If it's a network error, wait before retrying
      if (error.code === 'unavailable' || 
          error.message?.includes('transport') || 
          error.message?.includes('timeout') ||
          error.message?.includes('network')) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
};

// Helper function to get current location
const getCurrentLocation = async (): Promise<Location | null> => {
  try {
    return await locationService.getLocationWithAddress();
  } catch (error) {
    console.error('Error getting location for CRUD operation:', error);
    return null;
  }
};

export const firebaseService = {
  // Check if user is authenticated (optional for development)
  async checkAuth() {
    try {
      await ensureAuthenticated();
    } catch (error) {
      // Silent fallback - continue without authentication for development
    }
  },

  // Initialize network connection
  async initializeNetwork() {
    try {
      await enableNetwork(db);
    } catch (error) {
      // Silent fallback for network initialization
    }
  },

  // Get all games
  async getGames(): Promise<GameTopup[]> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      return await retryOperation(async () => {
        const q = query(collection(db, GAMES_COLLECTION));
        const querySnapshot = await getDocs(q);
        const games = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gameName: data.gameName || 'Unknown Game',
            gameIcon: data.gameIcon || '',
            category: data.category || 'CASUAL',
            topupOptions: data.topupOptions || [],
            isPopular: data.isPopular || false,
            isFeatured: data.isFeatured || false,
            userId: data.userId,
            location: data.location || null,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          } as GameTopup;
        });
        
        // If no games in database, return dummy data for testing
        if (games.length === 0) {
          return [
            {
              id: '1',
              gameName: 'Mobile Legends',
              gameIcon: 'https://via.placeholder.com/60x60/667eea/ffffff?text=ML',
              category: 'MOBA',
              topupOptions: [
                { id: '1', name: '86 💎', price: 20000, currency: 'IDR', bonus: 'Bonus 10%' },
                { id: '2', name: '172 💎', price: 40000, currency: 'IDR', bonus: 'Bonus 15%', isPopular: true },
                { id: '3', name: '257 💎', price: 60000, currency: 'IDR', bonus: 'Bonus 20%' }
              ],
              isPopular: true,
              isFeatured: true,
              userId: 'user123',
              location: null,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '2',
              gameName: 'PUBG Mobile',
              gameIcon: 'https://via.placeholder.com/60x60/f093fb/ffffff?text=PM',
              category: 'FPS',
              topupOptions: [
                { id: '4', name: '60 UC', price: 15000, currency: 'IDR' },
                { id: '5', name: '325 UC', price: 75000, currency: 'IDR', isPopular: true },
                { id: '6', name: '660 UC', price: 150000, currency: 'IDR', bonus: 'Bonus 25%' }
              ],
              isPopular: true,
              isFeatured: false,
              userId: 'user123',
              location: null,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: '3',
              gameName: 'Free Fire',
              gameIcon: 'https://via.placeholder.com/60x60/4facfe/ffffff?text=FF',
              category: 'FPS',
              topupOptions: [
                { id: '7', name: '100 💎', price: 25000, currency: 'IDR' },
                { id: '8', name: '500 💎', price: 100000, currency: 'IDR', isPopular: true },
                { id: '9', name: '1000 💎', price: 200000, currency: 'IDR', bonus: 'Bonus 30%' }
              ],
              isPopular: false,
              isFeatured: true,
              userId: 'user123',
              location: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
        }
        
        // Sort in memory instead of in query
        return games.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (error: any) {
      if (error.code === 'permission-denied' || error.code === 'unavailable') {
        return [];
      } else {
        return [];
      }
    }
  },

  // Get featured games
  async getFeaturedGames(): Promise<GameTopup[]> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      return await retryOperation(async () => {
        // Get all games and filter in memory to avoid index requirements
        const q = query(collection(db, GAMES_COLLECTION));
        const querySnapshot = await getDocs(q);
        const games = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gameName: data.gameName || 'Unknown Game',
            gameIcon: data.gameIcon || '',
            category: data.category || 'CASUAL',
            topupOptions: data.topupOptions || [],
            isPopular: data.isPopular || false,
            isFeatured: data.isFeatured || false,
            userId: data.userId,
            location: data.location || null,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          } as GameTopup;
        });
        
        // Filter featured games in memory
        const featuredGames = games.filter(game => game.isFeatured);
        
        // Sort in memory
        return featuredGames.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (error) {
      return [];
    }
  },

  // Get popular games
  async getPopularGames(): Promise<GameTopup[]> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      return await retryOperation(async () => {
        // Get all games and filter in memory to avoid index requirements
        const q = query(collection(db, GAMES_COLLECTION));
        const querySnapshot = await getDocs(q);
        const games = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gameName: data.gameName || 'Unknown Game',
            gameIcon: data.gameIcon || '',
            category: data.category || 'CASUAL',
            topupOptions: data.topupOptions || [],
            isPopular: data.isPopular || false,
            isFeatured: data.isFeatured || false,
            userId: data.userId,
            location: data.location || null,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          } as GameTopup;
        });
        
        // Filter popular games in memory
        const popularGames = games.filter(game => game.isPopular);
        
        // Sort in memory
        return popularGames.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (error) {
      return [];
    }
  },

  // Get games by category
  async getGamesByCategory(category: string): Promise<GameTopup[]> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      return await retryOperation(async () => {
        // Get all games and filter in memory to avoid index requirements
        const q = query(collection(db, GAMES_COLLECTION));
        const querySnapshot = await getDocs(q);
        const games = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            gameName: data.gameName || 'Unknown Game',
            gameIcon: data.gameIcon || '',
            category: data.category || 'CASUAL',
            topupOptions: data.topupOptions || [],
            isPopular: data.isPopular || false,
            isFeatured: data.isFeatured || false,
            userId: data.userId,
            location: data.location || null,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          } as GameTopup;
        });
        
        // Filter by category in memory
        const categoryGames = games.filter(game => game.category === category);
        
        // Sort in memory
        return categoryGames.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (error) {
      return [];
    }
  },

  // Create transaction with location
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      return await retryOperation(async () => {
        // Get current location for transaction
        const location = await getCurrentLocation();
        
        const transactionData = {
          ...transaction,
          userId: auth.currentUser?.uid || 'anonymous',
          location: location,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transactionData);
        return docRef.id;
      });
    } catch (error: any) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  },

  // Get user transactions
  async getUserTransactions(): Promise<Transaction[]> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      return await retryOperation(async () => {
        const userId = auth.currentUser?.uid || 'development';
        
        // Get all transactions and filter in memory to avoid index requirements
        const q = query(collection(db, TRANSACTIONS_COLLECTION));
        const querySnapshot = await getDocs(q);
        const transactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || '',
            gameId: data.gameId || '',
            topupOptionId: data.topupOptionId || '',
            amount: data.amount || 0,
            status: data.status || 'pending',
            paymentMethod: data.paymentMethod || '',
            userGameId: data.userGameId || '',
            location: data.location || null,
            createdAt: data.createdAt || new Date(),
            updatedAt: data.updatedAt || new Date()
          } as Transaction;
        });
        
        // Filter user transactions in memory
        const userTransactions = transactions.filter(transaction => transaction.userId === userId);
        
        // Sort in memory
        return userTransactions.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    } catch (error) {
      return [];
    }
  },

  // Update transaction status
  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<void> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      await retryOperation(async () => {
        const transactionRef = doc(db, TRANSACTIONS_COLLECTION, id);
        await updateDoc(transactionRef, {
          status,
          updatedAt: new Date()
        });
      });
    } catch (error) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  },

  // Add game to favorites
  async addToFavorites(gameId: string): Promise<void> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      await retryOperation(async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
          favoriteGames: arrayUnion(gameId),
          updatedAt: new Date()
        });
      });
    } catch (error) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  },

  // Remove game from favorites
  async removeFromFavorites(gameId: string): Promise<void> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      await retryOperation(async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
          favoriteGames: arrayRemove(gameId),
          updatedAt: new Date()
        });
      });
    } catch (error) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  },

  // CREATE - Add new game with location
  async createGame(game: Omit<GameTopup, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      // Validate game data before writing to Firestore
      validateGameData(game);
      
      return await retryOperation(async () => {
        // Get current location for game creation
        const location = await getCurrentLocation();
        
        const gameData = {
          ...game,
          userId: auth.currentUser?.uid || 'anonymous',
          location: location,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = await addDoc(collection(db, GAMES_COLLECTION), gameData);
        return docRef.id;
      });
    } catch (error: any) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  },

  // UPDATE - Edit existing game with location
  async updateGame(id: string, game: Partial<GameTopup>): Promise<void> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      // Validate game data if provided
      if (game.gameName || game.gameIcon || game.category || game.topupOptions) {
        validateGameData(game as any);
      }
      
      await retryOperation(async () => {
        // Get current location for game update
        const location = await getCurrentLocation();
        
        const gameRef = doc(db, GAMES_COLLECTION, id);
        await updateDoc(gameRef, {
          ...game,
          location: location,
          updatedAt: new Date()
        });
      });
    } catch (error) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  },

  // DELETE - Delete game with location tracking
  async deleteGame(id: string): Promise<void> {
    try {
      await this.checkAuth();
      await this.initializeNetwork();
      
      await retryOperation(async () => {
        // Get current location for deletion tracking
        const location = await getCurrentLocation();
        
        const gameRef = doc(db, GAMES_COLLECTION, id);
        await deleteDoc(gameRef);
        
        // Optionally log deletion with location for audit
        if (location) {
          console.log(`Game deleted at location: ${locationService.formatLocation(location)}`);
        }
      });
    } catch (error) {
      const errorMessage = handleFirebaseFirestoreError(error);
      throw new Error(errorMessage);
    }
  }
}; 