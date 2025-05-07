import { Proxy, ProxyMappingResult } from '../types/proxy';

export class ProxyService {
  private static instance: ProxyService;

  private constructor() {}

  public static getInstance(): ProxyService {
    if (!ProxyService.instance) {
      ProxyService.instance = new ProxyService();
    }
    return ProxyService.instance;
  }

  async getProxies(): Promise<Proxy[]> {
    try {
      return await window.api.getProxies();
    } catch (error) {
      console.error('Error fetching proxies:', error);
      throw error;
    }
  }

  async getProxyById(id: string): Promise<Proxy | null> {
    try {
      return await window.api.getProxyById(id);
    } catch (error) {
      console.error(`Error fetching proxy ${id}:`, error);
      throw error;
    }
  }

  async createProxy(proxy: Proxy): Promise<Proxy> {
    try {
      return await window.api.createProxy(proxy);
    } catch (error) {
      console.error('Error creating proxy:', error);
      throw error;
    }
  }

  async updateProxy(id: string, data: Partial<Proxy>): Promise<Proxy | null> {
    try {
      return await window.api.updateProxy(id, data);
    } catch (error) {
      console.error(`Error updating proxy ${id}:`, error);
      throw error;
    }
  }

  async deleteProxy(id: string): Promise<boolean> {
    try {
      return await window.api.deleteProxy(id);
    } catch (error) {
      console.error('Error deleting proxy:', error);
      return false;
    }
  }

  async batchDeleteProxies(ids: string[]): Promise<{ count: number }> {
    try {
      return await window.api.batchDeleteProxies(ids);
    } catch (error) {
      console.error('Error batch deleting proxies:', error);
      return { count: 0 };
    }
  }

  async fetchProxies(params: { country?: string, protocol?: string, limit?: number }): Promise<Proxy[]> {
    try {
      return await window.api.fetchProxies(params);
    } catch (error) {
      console.error('Error fetching proxies:', error);
      return [];
    }
  }

  // Keep createProxyMapping for compatibility, but getProxyMappings is no longer needed
  async createProxyMapping(): Promise<ProxyMappingResult[]> {
    try {
      return await window.api.createProxyMapping();
    } catch (error) {
      console.error('Error creating proxy mappings:', error);
      throw error;
    }
  }

  async deleteProxyMapping(emailId: string): Promise<boolean> {
    try {
      return await window.api.deleteProxyMapping(emailId);
    } catch (error) {
      console.error(`Error deleting proxy mapping for email ${emailId}:`, error);
      throw error;
    }
  }
}

export const proxyService = ProxyService.getInstance(); 