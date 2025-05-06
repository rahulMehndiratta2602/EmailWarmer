import axios from 'axios';
import { logger } from './logger';

interface ProxyConfig {
  host: string;
  port: number;
  country?: string;
  protocol: 'http' | 'socks5';
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

  constructor(baseUrl = 'https://info.proxy.abcproxy.com') {
    this.baseUrl = baseUrl;
    logger.info('Initialized ABCProxy client with URL:', baseUrl);
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
      // Default to socks5 for better performance and security
      const protocol = 'socks5';
      logger.info(`Fetching proxies: country=${country}, limit=${limit}, protocol=${protocol}`);
      
      // Construct the query parameters
      const params: Record<string, string | number> = {
        regions: country.toLowerCase(),
        num: limit,
        protocol,
        return_type: 'json',
        lh: 4, // \n delimiter
        mode: 1
      };

      // Make the API request to the extractProxyIp endpoint
      const response = await axios.get(`${this.baseUrl}/extractProxyIp`, {
        params,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info(`Received proxy response from ABCProxy`);
      
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
        protocol: protocol
      }));
    } catch (error) {
      logger.error('Error fetching proxies from ABCProxy:', error);
      throw new Error('Failed to fetch proxies from ABCProxy');
    }
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
      
      // Get a random proxy from the pool
      const proxies = await this.getProxies('us', 1);
      if (proxies.length === 0) {
        throw new Error('No proxies available for session');
      }
      
      return proxies[0];
    } catch (error) {
      logger.error('Error creating session proxy:', error);
      throw new Error('Failed to create session proxy');
    }
  }
}

// Export a singleton instance
const abcProxyClient = new ABCProxyClient(
  process.env.ABCPROXY_BASE_URL || 'https://info.proxy.abcproxy.com'
);

export { ABCProxyClient, ProxyConfig };
export default abcProxyClient; 