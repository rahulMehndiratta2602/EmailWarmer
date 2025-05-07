import { proxyService } from '../services/proxy.service';
import abcProxyClient from '../utils/abc-proxy-client';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('../utils/abc-proxy-client', () => ({
  getProxies: jest.fn(),
  createSessionProxy: jest.fn(),
}));

jest.mock('@prisma/client', () => {
  const mockPrismaClient: Record<string, any> = {
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $queryRaw: jest.fn(),
    proxy: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    emailAccount: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    }
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Sample test data
const sampleProxies = [
  {
    host: 'proxy.abcproxy.com',
    port: 4950,
    username: 'user-zone-abc-region-US',
    password: 'api-key',
    country: 'US',
    protocol: 'https',
  },
  {
    host: 'proxy.abcproxy.com',
    port: 4950,
    username: 'user-zone-abc-region-UK',
    password: 'api-key',
    country: 'UK',
    protocol: 'https',
  },
];

const sampleEmails = [
  {
    id: 'email-id-1',
    email: 'test1@example.com',
    password: 'password1',
  },
  {
    id: 'email-id-2',
    email: 'test2@example.com',
    password: 'password2',
  },
];

describe('Proxy Service', () => {
  const prisma = new PrismaClient();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('fetchAndSaveProxies', () => {
    it('should fetch proxies from ABCProxy and save them to the database', async () => {
      // Setup mocks
      (abcProxyClient.getProxies as jest.Mock).mockResolvedValue(sampleProxies);
      (prisma.proxy as any).findFirst.mockResolvedValue(null);
      (prisma.proxy as any).create.mockImplementation((args: Record<string, any>) => ({
        id: 'proxy-id',
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      // Execute function
      const result = await proxyService.fetchAndSaveProxies('US');
      
      // Assertions
      expect(abcProxyClient.getProxies).toHaveBeenCalledWith('US', 100);
      expect((prisma.proxy as any).findFirst).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(2);
      expect(result[0].host).toBe('proxy.abcproxy.com');
    });
  });
  
  describe('getProxies', () => {
    it('should retrieve active proxies from the database with mapped email information', async () => {
      // Setup mocks for raw queries
      const proxiesWithMappedEmails = sampleProxies.map((proxy, index) => ({
        id: `proxy-id-${index}`,
        ...proxy,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        mappedEmailId: index === 0 ? 'email-id-1' : null,
        mappedEmail: index === 0 ? 'test1@example.com' : null
      }));
      
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(proxiesWithMappedEmails);
      
      // Execute function
      const result = await proxyService.getProxies();
      
      // Assertions
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].mappedEmail).toBe('test1@example.com');
      expect(result[1].mappedEmail).toBeNull();
    });
  });
  
  describe('createMappings', () => {
    it('should map emails to proxies with one-to-one relationships', async () => {
      // Setup test data
      const unmappedEmails = [
        { id: 'email-id-1', email: 'test1@example.com' },
        { id: 'email-id-2', email: 'test2@example.com' }
      ];
      
      const unmappedProxies = [
        { id: 'proxy-id-1', host: 'proxy1.abcproxy.com', port: 4950, isActive: true },
        { id: 'proxy-id-2', host: 'proxy2.abcproxy.com', port: 4951, isActive: true }
      ];
      
      const mappingResults = [
        { 
          emailId: 'email-id-1', 
          email: 'test1@example.com',
          proxyId: 'proxy-id-1',
          proxyHost: 'proxy1.abcproxy.com',
          proxyPort: 4950
        }
      ];
      
      // Mock the query raw methods
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mappingResults);
      
      // Execute function
      const result = await proxyService.createMappings(unmappedEmails, unmappedProxies);
      
      // Assertions
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(2); // Once for each email
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);  // Once for each email query
      expect(result.length).toBe(2);
    });
  });
}); 