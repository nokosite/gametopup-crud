export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
  address?: string;
}

export interface GameTopup {
  id: string;
  gameName: string;
  gameIcon: string;
  category: 'MOBA' | 'FPS' | 'RPG' | 'STRATEGY' | 'CASUAL';
  topupOptions: TopupOption[];
  isPopular: boolean;
  isFeatured: boolean;
  userId?: string;
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopupOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  bonus?: string;
  isPopular?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  gameId: string;
  topupOptionId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  userGameId: string;
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  username: string;
  email: string;
  uid?: string;
  balance?: number;
  favoriteGames?: string[];
  lastLocation?: Location;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Games: undefined;
  GameDetail: { game: GameTopup };
  Profile: undefined;
  Search: undefined;
  AddGame: undefined;
  EditGame: { game: GameTopup };
};

export type MainTabParamList = {
  Home: undefined;
  Games: undefined;
  History: undefined;
  Profile: undefined;
}; 