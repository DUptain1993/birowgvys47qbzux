// Offline Support Service for PhantomNet Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { storageService } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { Bot, Command, Target, Payload, Campaign, ServerStats } from '../types';

interface OfflineQueueItem {
  id: string;
  type: 'command' | 'payload_generation' | 'campaign_creation' | 'target_discovery';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface CachedData {
  bots: Bot[];
  commands: Command[];
  targets: Target[];
  payloads: Payload[];
  campaigns: Campaign[];
  stats: ServerStats | null;
  lastSync: number;
}

class OfflineManager {
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private offlineQueue: OfflineQueueItem[] = [];
  private cachedData: CachedData = {
    bots: [],
    commands: [],
    targets: [],
    payloads: [],
    campaigns: [],
    stats: null,
    lastSync: 0,
  };

  constructor() {
    this.initializeOfflineSupport();
  }

  private async initializeOfflineSupport(): Promise<void> {
    try {
      // Load cached data
      await this.loadCachedData();

      // Load offline queue
      await this.loadOfflineQueue();

      // Set up network monitoring
      this.setupNetworkMonitoring();

      // Initial sync if online
      if (this.isOnline) {
        this.performBackgroundSync();
      }
    } catch (error) {
      console.error('Failed to initialize offline support:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    // Monitor network status changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Came back online, sync pending items
        this.processOfflineQueue();
        this.performBackgroundSync();
      } else if (wasOnline && !this.isOnline) {
        // Went offline
        console.log('App went offline - using cached data');
      }
    });
  }

  // Data Caching Methods
  private async loadCachedData(): Promise<void> {
    try {
      const cachedJson = await storageService.getItem(STORAGE_KEYS.OFFLINE_DATA);
      if (cachedJson) {
        const cached = JSON.parse(cachedJson);
        this.cachedData = { ...this.cachedData, ...cached };
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }

  private async saveCachedData(): Promise<void> {
    try {
      await storageService.setItem(STORAGE_KEYS.OFFLINE_DATA, JSON.stringify(this.cachedData));
    } catch (error) {
      console.error('Failed to save cached data:', error);
    }
  }

  async updateCache(type: keyof CachedData, data: any): Promise<void> {
    try {
      if (type !== 'lastSync' && type !== 'stats') {
        this.cachedData[type] = data;
      } else {
        (this.cachedData as any)[type] = data;
      }

      this.cachedData.lastSync = Date.now();
      await this.saveCachedData();
    } catch (error) {
      console.error('Failed to update cache:', error);
    }
  }

  getCachedData(type: keyof CachedData): any {
    return this.cachedData[type];
  }

  // Offline Queue Management
  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueJson = await storageService.getItem('offline_queue');
      if (queueJson) {
        const queue = JSON.parse(queueJson);
        if (Array.isArray(queue)) {
          this.offlineQueue = queue;
        }
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await storageService.setItem('offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  async addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(queueItem);
    await this.saveOfflineQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processOfflineQueue();
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;

    try {
      const itemsToProcess = [...this.offlineQueue];

      for (const item of itemsToProcess) {
        try {
          await this.processQueueItem(item);
          // Remove successfully processed item
          this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
        } catch (error) {
          console.error('Failed to process queue item:', error);
          item.retryCount++;

          // Remove item if it has been retried too many times
          if (item.retryCount >= 3) {
            this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
            console.log('Removed failed queue item after max retries:', item.id);
          }
        }
      }

      await this.saveOfflineQueue();
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    // Import apiService here to avoid circular dependencies
    const { apiService } = await import('./api');

    switch (item.type) {
      case 'command':
        await apiService.sendCommand(item.data);
        break;
      case 'payload_generation':
        await apiService.generatePayload(item.data);
        break;
      case 'campaign_creation':
        await apiService.createCampaign(item.data);
        break;
      case 'target_discovery':
        await apiService.discoverTargets(item.data);
        break;
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }
  }

  // Background Sync
  private async performBackgroundSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    try {
      // Import apiService here to avoid circular dependencies
      const { apiService } = await import('./api');

      console.log('Performing background sync...');

      // Sync all data types
      const [botsResult, commandsResult, targetsResult, payloadsResult, campaignsResult, statsResult] = await Promise.all([
        apiService.getBots(),
        apiService.getTasks(),
        apiService.getTargets(),
        apiService.getPayloads(),
        apiService.getCampaigns(),
        apiService.getDashboardStats(),
      ]);

      // Update cache with fresh data
      if (botsResult.success) await this.updateCache('bots', botsResult.data);
      if (commandsResult.success) await this.updateCache('commands', commandsResult.data);
      if (targetsResult.success) await this.updateCache('targets', targetsResult.data);
      if (payloadsResult.success) await this.updateCache('payloads', payloadsResult.data);
      if (campaignsResult.success) await this.updateCache('campaigns', campaignsResult.data);
      if (statsResult.success) await this.updateCache('stats', statsResult.data);

      console.log('Background sync completed');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  // Public API Methods
  isConnected(): boolean {
    return this.isOnline;
  }

  getQueueLength(): number {
    return this.offlineQueue.length;
  }

  async forceSync(): Promise<void> {
    if (this.isOnline) {
      await this.performBackgroundSync();
      await this.processOfflineQueue();
    }
  }

  async clearCache(): Promise<void> {
    this.cachedData = {
      bots: [],
      commands: [],
      targets: [],
      payloads: [],
      campaigns: [],
      stats: null,
      lastSync: 0,
    };
    await this.saveCachedData();
  }

  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
  }

  getLastSyncTime(): number {
    return this.cachedData.lastSync;
  }

  // Offline-aware API wrapper
  async makeOfflineAwareRequest<T>(
    onlineRequest: () => Promise<{ success: boolean; data?: T; error?: string }>,
    cacheKey?: keyof CachedData
  ): Promise<{ success: boolean; data?: T; error?: string; fromCache?: boolean }> {
    try {
      // Try online request first
      if (this.isOnline) {
        const result = await onlineRequest();

        if (result.success && cacheKey && result.data) {
          await this.updateCache(cacheKey, result.data);
        }

        return { ...result, fromCache: false };
      }

      // Fall back to cached data
      if (cacheKey) {
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData && (!Array.isArray(cachedData) || cachedData.length > 0)) {
          return {
            success: true,
            data: cachedData,
            fromCache: true,
          };
        }
      }

      return {
        success: false,
        error: 'No internet connection and no cached data available',
        fromCache: false,
      };
    } catch (error) {
      console.error('Offline-aware request failed:', error);

      // Try cached data as fallback
      if (cacheKey) {
        const cachedData = this.getCachedData(cacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true,
          };
        }
      }

      return {
        success: false,
        error: 'Request failed and no cached data available',
        fromCache: false,
      };
    }
  }

  // Utility Methods
  async getStorageInfo(): Promise<{
    cachedItems: number;
    queueItems: number;
    lastSync: string;
    cacheSize: string;
  }> {
    const storageInfo = await storageService.getStorageInfo();

    return {
      cachedItems: Object.values(this.cachedData).filter(v => v && (!Array.isArray(v) || v.length > 0)).length,
      queueItems: this.offlineQueue.length,
      lastSync: this.cachedData.lastSync ? new Date(this.cachedData.lastSync).toLocaleString() : 'Never',
      cacheSize: storageInfo.usedSpace,
    };
  }

  // Auto-sync setup
  startAutoSync(intervalMinutes: number = 5): () => void {
    const intervalId = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performBackgroundSync();
        this.processOfflineQueue();
      }
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(intervalId);
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();
export default offlineManager;
