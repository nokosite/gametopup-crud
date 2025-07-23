import * as Location from 'expo-location';
import { Location as LocationType } from '../types';

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationType | null = null;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Request location permissions
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Check if location permissions are granted
  async checkPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const currentLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };

      this.currentLocation = currentLocation;
      return currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Get location with address (reverse geocoding)
  async getLocationWithAddress(): Promise<LocationType | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        const addressString = [
          address.street,
          address.district,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');

        return {
          ...location,
          address: addressString,
        };
      }

      return location;
    } catch (error) {
      console.error('Error getting location with address:', error);
      return await this.getCurrentLocation();
    }
  }

  // Get cached location
  getCachedLocation(): LocationType | null {
    return this.currentLocation;
  }

  // Clear cached location
  clearCachedLocation(): void {
    this.currentLocation = null;
  }

  // Format location for display
  formatLocation(location: LocationType): string {
    if (location.address) {
      return location.address;
    }
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }

  // Calculate distance between two locations
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = LocationService.getInstance(); 