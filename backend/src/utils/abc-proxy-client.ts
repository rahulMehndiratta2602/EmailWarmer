import axios from 'axios';
import { logger } from './logger';

interface ProxyConfig {
  host: string;
  port: number;
  country?: string;
  protocol: 'http' | 'https' | 'socks5';
}

interface ProxyResponse {
  ip: string;
  port: number;
}

interface ABCProxyApiResponse {
  code: number;
  success: boolean;
  msg: string;
  request_ip: string;
  data: ProxyResponse[] | null;
}

class ABCProxyClient {
  private baseUrl: string;
  private useMockData: boolean;

  constructor(baseUrl = 'https://info.proxy.abcproxy.com', useMockData = false) {
    this.baseUrl = baseUrl;
    // Force mock data in development
    this.useMockData = useMockData || process.env.NODE_ENV !== 'production';
    
    if (this.useMockData) {
      logger.info('Using mock data for ABCProxy client');
    }
  }

  /**
   * Get a list of proxies from ABCProxy
   * @param country Country region code (e.g., 'us', 'in')
   * @param protocol Protocol to use ('http' or 'socks5')
   * @param limit Maximum number of proxies to retrieve
   * @returns Array of proxy configurations
   */
  async getProxies(
    country = 'us',
    limit = 100
  ): Promise<ProxyConfig[]> {
    try {
      // Use mock data if enabled or required
      if (this.useMockData) {
        return this.getMockProxies(country, limit);
      }
      
      // Map protocol based on what's available in the database
      // Default to socks5 for better performance and security
      const protocol = 'socks5';
      
      // Construct the query parameters
      const params: Record<string, string | number> = {
        regions: country.toLowerCase(),
        num: limit,
        protocol,
        return_type: 'json',
        lh: 4, // \n delimiter
        mode: 1
      };

      // Make the API request
      const response = await axios.get(`${this.baseUrl}/extractProxyIp`, {
        params,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const apiResponse: ABCProxyApiResponse = response.data;

      // Check if the API call was successful
      if (!apiResponse.success || apiResponse.code !== 0 || !apiResponse.data) {
        logger.error(`ABCProxy API error: ${apiResponse.msg}`, { code: apiResponse.code });
        
        if (apiResponse.msg === 'please add this ip to your ip whitelist') {
          logger.error(`Your IP address (${apiResponse.request_ip}) needs to be added to the ABCProxy whitelist`);
        }
        
        throw new Error(`ABCProxy API error: ${apiResponse.msg}`);
      }

      // Transform the response to our proxy config format
      return apiResponse.data.map((proxy: ProxyResponse) => ({
        host: proxy.ip,
        port: proxy.port,
        country: country.toUpperCase(),
        protocol: protocol as 'http' | 'https' | 'socks5'
      }));
    } catch (error) {
      logger.error('Error fetching proxies from ABCProxy:', error);
      
      // Fall back to mock data if API call fails
      if (!this.useMockData) {
        logger.info('Falling back to mock data');
        return this.getMockProxies(country, limit);
      }
      
      throw new Error('Failed to fetch proxies from ABCProxy');
    }
  }
  
  /**
   * Generate mock proxy data for development/testing
   */
  private getMockProxies(
    country?: string,
    limit = 100
  ): ProxyConfig[] {
    // Generate mock proxies with the requested parameters
    const mockProxies: ProxyConfig[] = [];
    
    // Generate the requested number of proxies
    for (let i = 0; i < limit; i++) {
      const mockProxy: ProxyConfig = {
        host: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: 10000 + Math.floor(Math.random() * 5000),
        country: country || 'US',
        protocol: 'socks5'
      };
      mockProxies.push(mockProxy);
    }
    
    return mockProxies;
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
        return this.getMockSessionProxy();
      }
      
      // Get a random proxy from the pool
      const proxies = await this.getProxies('us', 1);
      if (proxies.length === 0) {
        throw new Error('No proxies available for session');
      }
      
      return proxies[0];
    } catch (error) {
      logger.error('Error creating session proxy:', error);
      
      // Fall back to mock data if method fails
      if (!this.useMockData) {
        logger.info('Falling back to mock session proxy');
        return this.getMockSessionProxy();
      }
      
      throw new Error('Failed to create session proxy');
    }
  }
  
  /**
   * Generate a mock session proxy for development/testing
   */
  private getMockSessionProxy(): ProxyConfig {    
    return {
      host: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      port: 10000 + Math.floor(Math.random() * 5000),
      country: 'US',
      protocol: 'socks5'
    };
  }
}

// Export a singleton instance
const abcProxyClient = new ABCProxyClient(
  process.env.ABCPROXY_BASE_URL || 'https://info.proxy.abcproxy.com',
  process.env.NODE_ENV !== 'production' // Use mock data in development by default
);

export { ABCProxyClient, ProxyConfig };
export default abcProxyClient; 