// Storage utility functions for PhantomNet Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { ServerConfig, User } from '../types';

export class StorageService {
  // Generic setItem
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      throw error;
    }
  }

  // Generic getItem
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  // Generic removeItem
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      throw error;
    }
  }

  // Server Configuration
  static async saveServerConfig(config: ServerConfig): Promise<boolean> {
    try {
      await this.setItem(STORAGE_KEYS.SERVER_CONFIG, JSON.stringify(config));
      return true;
    } catch {
      return false;
    }
  }

  static async getServerConfig(): Promise<ServerConfig | null> {
    try {
      const config = await this.getItem(STORAGE_KEYS.SERVER_CONFIG);
      return config ? JSON.parse(config) : null;
    } catch {
      return null;
    }
  }

  static async clearServerConfig(): Promise<boolean> {
    try {
      await this.removeItem(STORAGE_KEYS.SERVER_CONFIG);
      return true;
    } catch {
      return false;
    }
  }

  // Authentication
  static async saveAuthToken(token: string): Promise<boolean> {
    try {
      await this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch {
      return false;
    }
  }

  static async getAuthToken(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  static async clearAuthToken(): Promise<boolean> {
    try {
      await this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      return true;
    } catch {
      return false;
    }
  }

  // User Data
  static async saveUserData(user: User): Promise<boolean> {
    try {
      await this.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return true;
    } catch {
      return false;
    }
  }

  static async getUserData(): Promise<User | null> {
    try {
      const userData = await this.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  static async clearUserData(): Promise<boolean> {
    try {
      await this.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch {
      return false;
    }
  }

  // App Preferences
  static async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<boolean> {
    try {
      await this.setItem(STORAGE_KEYS.THEME, theme);
      return true;
    } catch {
      return false;
    }
  }

  static async getTheme(): Promise<'light' | 'dark' | 'auto'> {
    try {
      const theme = await this.getItem(STORAGE_KEYS.THEME);
      return (theme as 'light' | 'dark' | 'auto') || 'auto';
    } catch {
      return 'auto';
    }
  }

  // Cache Management
  static async saveLastSync(timestamp: string): Promise<boolean> {
    try {
      await this.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
      return true;
    } catch {
      return false;
    }
  }

  static async getLastSync(): Promise<string | null> {
    return this.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  // Offline Data
  static async saveOfflineData(data: any): Promise<boolean> {
    try {
      await this.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  static async getOfflineData(): Promise<any> {
    try {
      const data = await this.getItem(STORAGE_KEYS.OFFLINE_DATA);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static async clearOfflineData(): Promise<boolean> {
    try {
      await this.removeItem(STORAGE_KEYS.OFFLINE_DATA);
      return true;
    } catch {
      return false;
    }
  }

  // Utility Functions
  static async clearAll(): Promise<boolean> {
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
        await this.setItem(STORAGE_KEYS.SERVER_CONFIG, oldConfig);
        await this.removeItem('serverConfig');
      }

      const oldToken = await AsyncStorage.getItem('authToken'); // Old key
      if (oldToken) {
        await this.setItem(STORAGE_KEYS.AUTH_TOKEN, oldToken);
        await this.removeItem('authToken');
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
        typeof value === 'string' ? value : JSON.stringify(value),
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
