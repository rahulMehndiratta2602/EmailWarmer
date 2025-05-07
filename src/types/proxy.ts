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
  
  // Mapped email information
  mappedEmailId?: string | null;
  mappedEmail?: string | null;
}

// This interface is kept for backward compatibility but we'll deprecate it
export interface ProxyMappingResult {
  emailId: string;
  email: string;
  proxyId: string;
  proxyHost: string;
  proxyPort: number;
} 