import axios from 'axios';
import { logger } from './logger';

interface ProxyConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  country?: string;
  state?: string;
  city?: string;
  protocol: 'http' | 'https' | 'socks5';
}

interface ProxyResponse {
  host?: string;
  port?: number;
  country?: string;
  state?: string;
  city?: string;
  protocol?: 'http' | 'https' | 'socks5';
  id: string;
  username?: string;
}

class ABCProxyClient {
  private apiKey: string;
  private baseUrl: string;
  private useMockData: boolean;

  constructor(apiKey: string, baseUrl = 'https://api.abcproxy.com', useMockData = false) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    // Force mock data in development if API key is missing
    this.useMockData = useMockData || process.env.NODE_ENV !== 'production' || !apiKey;
    
    if (!apiKey && !this.useMockData) {
      logger.warn('ABCProxy API key is not set. Set the ABCPROXY_API_KEY environment variable or enable mock data.');
    }
    
    if (this.useMockData) {
      logger.info('Using mock data for ABCProxy client');
    }
  }

  /**
   * Get a list of proxies from ABCProxy
   * @param country Optional country filter (ISO code)
   * @param state Optional state filter
   * @param city Optional city filter
   * @param limit Maximum number of proxies to retrieve
   * @returns Array of proxy configurations
   */
  async getProxies(
    country?: string,
    state?: string,
    city?: string,
    limit = 100
  ): Promise<ProxyConfig[]> {
    try {
      // Use mock data if enabled or required
      if (this.useMockData) {
        return this.getMockProxies(country, state, city, limit);
      }
      
      // Construct the query parameters
      const params: Record<string, string | number> = { limit };
      if (country) params.country = country;
      if (state) params.state = state;
      if (city) params.city = city;

      // Make the API request
      const response = await axios.get(`${this.baseUrl}/residential-proxies`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Transform the response to our proxy config format
      // This is a placeholder; actual format will depend on ABCProxy's API
      return response.data.proxies.map((proxy: ProxyResponse) => ({
        host: proxy.host || 'proxy.abcproxy.com',
        port: proxy.port || 4950,
        username: this.formatUsername(proxy, country, state, city),
        password: this.apiKey,
        country: proxy.country || country,
        state: proxy.state || state,
        city: proxy.city || city,
        protocol: proxy.protocol || 'socks5'
      }));
    } catch (error) {
      logger.error('Error fetching proxies from ABCProxy:', error);
      
      // Fall back to mock data if API call fails
      if (!this.useMockData) {
        logger.info('Falling back to mock data');
        return this.getMockProxies(country, state, city, limit);
      }
      
      throw new Error('Failed to fetch proxies from ABCProxy');
    }
  }
  
  /**
   * Generate mock proxy data for development/testing
   */
  private getMockProxies(
    country?: string,
    state?: string,
    city?: string,
    limit = 100
  ): ProxyConfig[] {
    // Generate mock proxies with the requested parameters
    const mockProxies: ProxyConfig[] = [];
    const actualLimit = Math.min(limit, 10); // Cap at 10 to avoid excessive data
    
    for (let i = 0; i < actualLimit; i++) {
      const mockProxy: ProxyConfig = {
        host: 'dev-proxy.example.com',
        port: 4950 + i,
        username: this.formatUsername({ id: `mock-${i}` }, country, state, city),
        password: 'mock-api-key',
        country: country || 'US',
        state: state || 'California',
        city: city || 'San Francisco',
        protocol: 'socks5'
      };
      mockProxies.push(mockProxy);
    }
    
    return mockProxies;
  }

  /**
   * Format the username based on ABCProxy documentation
   */
  private formatUsername(proxy: ProxyResponse, country?: string, state?: string, city?: string): string {
    let username = proxy.username || 'user';
    username += '-zone-abc';
    
    if (country) {
      username += `-region-${country}`;
      
      if (state) {
        username += `-st-${state.toLowerCase().replace(/\s+/g, '')}`;
        
        if (city) {
          username += `-city-${city.toLowerCase().replace(/\s+/g, '')}`;
        }
      }
    }
    
    return username;
  }

  /**
   * Create a session proxy with specified retention time
   * @param minutes Minutes to retain the session (1-120)
   * @returns Proxy configuration with session
   */
  async createSessionProxy(minutes = 30): Promise<ProxyConfig> {
    try {
      if (minutes < 1 || minutes > 120) {
        throw new Error('Session time must be between 1 and 120 minutes');
      }
      
      // Use mock data if required
      if (this.useMockData) {
        return this.getMockSessionProxy(minutes);
      }
      
      // Generate a random session ID
      const sessionId = Math.random().toString(36).substring(2, 10);
      
      // According to ABCProxy documentation
      return {
        host: 'proxy.abcproxy.com',
        port: 4950,
        username: `user-zone-abc-session-${sessionId}-sessTime-${minutes}`,
        password: this.apiKey,
        protocol: 'socks5'
      };
    } catch (error) {
      logger.error('Error creating session proxy:', error);
      
      // Fall back to mock data if method fails
      if (!this.useMockData) {
        logger.info('Falling back to mock session proxy');
        return this.getMockSessionProxy(minutes);
      }
      
      throw new Error('Failed to create session proxy');
    }
  }
  
  /**
   * Generate a mock session proxy for development/testing
   */
  private getMockSessionProxy(minutes = 30): ProxyConfig {
    const sessionId = Math.random().toString(36).substring(2, 10);
    
    return {
      host: 'dev-proxy.example.com',
      port: 4950,
      username: `user-zone-abc-session-${sessionId}-sessTime-${minutes}`,
      password: 'mock-api-key',
      protocol: 'socks5'
    };
  }
}

// Export a singleton instance
const abcProxyClient = new ABCProxyClient(
  process.env.ABCPROXY_API_KEY || '',
  process.env.ABCPROXY_BASE_URL || 'https://api.abcproxy.com',
  process.env.NODE_ENV !== 'production' // Use mock data in development by default
);

export { ABCProxyClient, ProxyConfig };
export default abcProxyClient; 