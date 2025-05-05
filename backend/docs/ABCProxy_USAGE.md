# ABCProxy Integration Guide

This document describes how to use the ABCProxy integration in the application.

## Configuration

The ABCProxy client is configured using environment variables. Make sure to set the following variables in your `.env` file:

```
ABCPROXY_BASE_URL="https://info.proxy.abcproxy.com"
```

## Important Notes

1. **IP Whitelist**: Your server's IP address must be whitelisted with ABCProxy. If you get an error like `please add this ip to your ip whitelist`, you need to contact ABCProxy support or use their control panel to add your server's IP to the whitelist.

2. **API Parameters**: 
   - `regions`: Country code (e.g., 'us', 'in')
   - `num`: Number of proxies to retrieve
   - `protocol`: Protocol type ('http' or 'socks5')
   - `return_type`: Format of the response ('json' or 'txt')
   - `lh`: Delimiter type (default: 4 for '\n')
   - `mode`: Always set to 1

## API Endpoints

### Fetch Proxies

**Endpoint**: `POST /api/proxies/fetch`

**Request Body**:
```json
{
  "country": "us",
  "protocol": "socks5",
  "limit": 100
}
```

**Response**:
```json
{
  "message": "Successfully fetched and saved 10 proxies",
  "proxies": [
    {
      "id": "uuid",
      "host": "192.168.1.1",
      "port": 12345,
      "country": "US",
      "protocol": "socks5",
      "isActive": true,
      "createdAt": "2025-05-04T15:18:43.750Z"
    }
    // ... more proxies
  ]
}
```

### Create Session Proxy

**Endpoint**: `POST /api/proxies/session`

**Request Body**:
```json
{
  "minutes": 30
}
```

## Usage Examples

### Fetching Proxies

To fetch proxies from ABCProxy, use the `ProxyService.fetchAndSaveProxies` method:

```typescript
const proxyService = new ProxyService();
const proxies = await proxyService.fetchAndSaveProxies('us', 100);
```

### Creating a Session Proxy

To create a session proxy, use the `ProxyService.createSessionProxy` method:

```typescript
const proxyService = new ProxyService();
const sessionProxy = await proxyService.createSessionProxy(30); // Session valid for 30 minutes
```

## API Response Format

The ABCProxy API returns a response in the following format:

```json
{
    "code": 0,          // 0 indicates success, non-zero indicates failure
    "success": true,    // true indicates success, false indicates failure
    "msg": "0",         // Error message if any
    "request_ip": "x.x.x.x",  // Your server's IP address
    "data": [
        {"ip": "47.244.192.12", "port": 15698}
    ]
}
```

## Database Schema Changes

The proxy model has been simplified to store only essential fields:

```prisma
model Proxy {
  id          String         @id @default(uuid())
  host        String
  port        Int
  country     String?
  protocol    String         @default("https")
  isActive    Boolean        @default(true)
  lastChecked DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  mappings    ProxyMapping[]

  @@unique([host, port])
}
```

## Troubleshooting

1. **IP Not Whitelisted**: Check the logs for messages about IP whitelisting. Contact ABCProxy to add your server's IP to the whitelist.
2. **DNS Resolution Errors**: Ensure your server can resolve the ABCProxy domain.
3. **No Proxies Available**: If the API returns an empty array, check your account's proxy allocations with ABCProxy.
4. **Transaction Errors**: If you see database transaction timeout errors, the system now uses individual operations instead of transactions to improve reliability.

## Development

For local development, the client will automatically use mock data. You can force this behavior by setting `NODE_ENV=development` in your `.env` file. 