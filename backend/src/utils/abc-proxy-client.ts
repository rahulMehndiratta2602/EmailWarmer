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

class ABCProxyClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.abcproxy.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
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
      return response.data.proxies.map((proxy: any) => ({
        host: proxy.host || 'proxy.abcproxy.com',
        port: proxy.port || 4950,
        username: this.formatUsername(proxy, country, state, city),
        password: this.apiKey,
        country: proxy.country || country,
        state: proxy.state || state,
        city: proxy.city || city,
        protocol: proxy.protocol || 'https'
      }));
    } catch (error) {
      logger.error('Error fetching proxies from ABCProxy:', error);
      throw new Error('Failed to fetch proxies from ABCProxy');
    }
  }

  /**
   * Format the username based on ABCProxy documentation
   */
  private formatUsername(proxy: any, country?: string, state?: string, city?: string): string {
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
      
      // Generate a random session ID
      const sessionId = Math.random().toString(36).substring(2, 10);
      
      // According to ABCProxy documentation
      return {
        host: 'proxy.abcproxy.com',
        port: 4950,
        username: `user-zone-abc-session-${sessionId}-sessTime-${minutes}`,
        password: this.apiKey,
        protocol: 'https'
      };
    } catch (error) {
      logger.error('Error creating session proxy:', error);
      throw new Error('Failed to create session proxy');
    }
  }
}

// Export a singleton instance
const abcProxyClient = new ABCProxyClient(
  process.env.ABCPROXY_API_KEY || '',
);

export { ABCProxyClient, ProxyConfig };
export default abcProxyClient; 