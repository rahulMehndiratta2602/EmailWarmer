export interface Proxy {
  id?: string;
  host: string;
  port: number;
  country?: string | null;
  protocol: string;
  isActive: boolean;
  lastChecked?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // UI state properties, not saved to server
  selected?: boolean;
  isEditing?: boolean;
}

export interface ProxyMappingResult {
  emailId: string;
  email: string;
  proxyId: string;
  proxyHost: string;
  proxyPort: number;
} 