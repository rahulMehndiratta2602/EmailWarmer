import { proxyService } from '../services/proxy.service';
import { proxyMappingService } from '../services/proxy-mapping.service';
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
    },
    proxyMapping: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
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
      expect(abcProxyClient.getProxies).toHaveBeenCalledWith('US', undefined, undefined, 100);
      expect((prisma.proxy as any).create).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(2);
      expect(result[0].host).toBe('proxy.abcproxy.com');
    });
  });
  
  describe('getProxies', () => {
    it('should retrieve active proxies from the database', async () => {
      // Setup mocks
      (prisma.proxy as any).findMany.mockResolvedValue(
        sampleProxies.map((proxy, index) => ({
          id: `proxy-id-${index}`,
          ...proxy,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
      
      // Execute function
      const result = await proxyService.getProxies();
      
      // Assertions
      expect((prisma.proxy as any).findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 100,
      });
      expect(result.length).toBe(2);
    });
  });
});

describe('Proxy Mapping Service', () => {
  const prisma = new PrismaClient();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createProxyMapping', () => {
    it('should map emails to proxies with load balancing', async () => {
      // Setup mocks
      (prisma.proxy as any).findMany.mockResolvedValue(
        sampleProxies.map((proxy, index) => ({
          id: `proxy-id-${index}`,
          ...proxy,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
      
      (prisma.emailAccount as any).updateMany.mockResolvedValue({ count: 2 });
      
      (prisma.emailAccount as any).findUnique.mockImplementation((args: Record<string, any>) => {
        const emailId = args.where.id;
        const emailIndex = parseInt(emailId.split('-').pop()) - 1;
        return sampleEmails[emailIndex];
      });
      
      (prisma.proxyMapping as any).findFirst.mockResolvedValue(null);
      
      (prisma.proxyMapping as any).create.mockImplementation((args: Record<string, any>) => ({
        id: 'mapping-id',
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      
      // Execute function
      const result = await proxyMappingService.createProxyMapping(
        ['email-id-1', 'email-id-2'],
        1,
        5
      );
      
      // Assertions
      expect((prisma.emailAccount as any).updateMany).toHaveBeenCalled();
      expect((prisma.proxyMapping as any).create).toHaveBeenCalledTimes(2);
      expect(result.length).toBe(2);
      expect(result[0].email).toBe('test1@example.com');
      expect(result[0].proxyHost).toBe('proxy.abcproxy.com');
    });
  });
}); 