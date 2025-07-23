import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import GamesScreen from '../screens/GamesScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import AddGameScreen from '../screens/AddGameScreen';
import EditGameScreen from '../screens/EditGameScreen';

// Types
import { RootStackParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={HomeScreen} />
        <Stack.Screen name="Games" component={GamesScreen} />
        <Stack.Screen name="GameDetail" component={GameDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="AddGame" component={AddGameScreen} />
        <Stack.Screen name="EditGame" component={EditGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 