import { NavigationContainerRef } from '@react-navigation/native';

// Helper untuk navigation yang lebih aman
export const safeNavigate = (
  navigation: NavigationContainerRef<any>,
  routeName: string,
  params?: any
) => {
  try {
    // Check if navigation is ready
    if (navigation.isReady()) {
      navigation.navigate(routeName as never, params as never);
    } else {
      console.warn('Navigation not ready, retrying in 100ms...');
      setTimeout(() => {
        safeNavigate(navigation, routeName, params);
      }, 100);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

// Helper untuk replace navigation yang lebih aman
export const safeReplace = (
  navigation: NavigationContainerRef<any>,
  routeName: string,
  params?: any
) => {
  try {
    // Check if navigation is ready
    if (navigation.isReady()) {
      navigation.replace(routeName as never, params as never);
    } else {
      console.warn('Navigation not ready, retrying in 100ms...');
      setTimeout(() => {
        safeReplace(navigation, routeName, params);
      }, 100);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
}; 