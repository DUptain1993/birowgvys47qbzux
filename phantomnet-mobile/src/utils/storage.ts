// Storage utility functions for PhantomNet Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { ServerConfig, User } from '../types';

export class StorageService {
  // Server Configuration
  static async saveServerConfig(config: ServerConfig): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SERVER_CONFIG, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to save server config:', error);
      return false;
    }
  }

  static async getServerConfig(): Promise<ServerConfig | null> {
    try {
      const config = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_CONFIG);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Failed to get server config:', error);
      return null;
    }
  }

  static async clearServerConfig(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SERVER_CONFIG);
      return true;
    } catch (error) {
      console.error('Failed to clear server config:', error);
      return false;
    }
  }

  // Authentication
  static async saveAuthToken(token: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      console.error('Failed to save auth token:', error);
      return false;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  static async clearAuthToken(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      return true;
    } catch (error) {
      console.error('Failed to clear auth token:', error);
      return false;
    }
  }

  // User Data
  static async saveUserData(user: User): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Failed to save user data:', error);
      return false;
    }
  }

  static async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  static async clearUserData(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return false;
    }
  }

  // App Preferences
  static async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
      return true;
    } catch (error) {
      console.error('Failed to save theme:', error);
      return false;
    }
  }

  static async getTheme(): Promise<'light' | 'dark' | 'auto'> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return (theme as 'light' | 'dark' | 'auto') || 'auto';
    } catch (error) {
      console.error('Failed to get theme:', error);
      return 'auto';
    }
  }

  // Cache Management
  static async saveLastSync(timestamp: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
      return true;
    } catch (error) {
      console.error('Failed to save last sync:', error);
      return false;
    }
  }

  static async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return null;
    }
  }

  // Offline Data
  static async saveOfflineData(data: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  static async getOfflineData(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  static async clearOfflineData(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_DATA);
      return true;
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      return false;
    }
  }

  // Utility Functions
  static async clearAllData(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Failed to clear all data:', error);
      return false;
    }
  }

  static async getStorageInfo(): Promise<{
    totalKeys: number;
    usedSpace: string;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      const usedSpace = totalSize < 1024
        ? `${totalSize} B`
        : totalSize < 1024 * 1024
        ? `${(totalSize / 1024).toFixed(2)} KB`
        : `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;

      return {
        totalKeys: keys.length,
        usedSpace,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalKeys: 0,
        usedSpace: '0 B',
      };
    }
  }

  // Migration helpers for app updates
  static async migrateData(): Promise<boolean> {
    try {
      // Check for old data format and migrate if needed
      const oldConfig = await AsyncStorage.getItem('serverConfig'); // Old key
      if (oldConfig) {
        await AsyncStorage.setItem(STORAGE_KEYS.SERVER_CONFIG, oldConfig);
        await AsyncStorage.removeItem('serverConfig');
      }

      const oldToken = await AsyncStorage.getItem('authToken'); // Old key
      if (oldToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, oldToken);
        await AsyncStorage.removeItem('authToken');
      }

      return true;
    } catch (error) {
      console.error('Failed to migrate data:', error);
      return false;
    }
  }

  // Batch operations
  static async batchSet(items: { [key: string]: any }): Promise<boolean> {
    try {
      const entries = Object.entries(items).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      await AsyncStorage.multiSet(entries);
      return true;
    } catch (error) {
      console.error('Failed to batch set items:', error);
      return false;
    }
  }

  static async batchGet(keys: string[]): Promise<{ [key: string]: any }> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      const parsed: { [key: string]: any } = {};

      result.forEach(([key, value]) => {
        if (value !== null) {
          try {
            parsed[key] = JSON.parse(value);
          } catch {
            parsed[key] = value;
          }
        }
      });

      return parsed;
    } catch (error) {
      console.error('Failed to batch get items:', error);
      return {};
    }
  }

  static async batchRemove(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Failed to batch remove items:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = StorageService;
