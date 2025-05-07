export interface EmailAccount {
  id?: string;
  email: string;
  password: string;
  selected?: boolean;
  isEditing?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Proxy mapping fields
  proxyId?: string | null;
  proxyHost?: string | null;
  proxyPort?: number | null;
  proxyProtocol?: string | null;
  proxyCountry?: string | null;
} 