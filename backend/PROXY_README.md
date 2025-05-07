# Proxy Management System

This module implements proxy management functionality for the application, allowing you to fetch, manage, and use proxies from ABCProxy with email accounts.

## Features

- Fetch and manage proxies from ABCProxy
- Create session-based proxies with retention time
- Map email accounts to proxies with load balancing
- Open browser windows for email accounts using their assigned proxies
- Full REST API for all operations

## Setup

1. Install the required dependencies:

```bash
npm install
```

2. Configure your environment variables by creating a `.env` file based on `.env.example`:

```
# Database Connection
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

# Server Configuration
PORT=3002
NODE_ENV=development

# ABCProxy Configuration
ABCPROXY_API_KEY="your-abcproxy-api-key"

# Redis Configuration (for session management)
REDIS_URL="redis://localhost:6379"
```

3. Run the database migrations:

```bash
npx prisma migrate dev
```

4. Start the server:

```bash
npm run dev
```

## API Usage

The full API documentation can be found in `API_DOCUMENTATION.md`. Here are the key operations:

### Fetch Proxies

To fetch proxies from ABCProxy and save them to the database:

```bash
curl -X POST http://localhost:3002/api/proxies/fetch \
  -H "Content-Type: application/json" \
  -d '{"country": "US", "limit": 10}'
```

### Create Proxy Mapping

To map email accounts to proxies with load balancing:

```bash
curl -X POST http://localhost:3002/api/proxies/mapping \
  -H "Content-Type: application/json" \
  -d '{
    "emailIds": ["email-uuid-1", "email-uuid-2"],
    "maxProxies": 5,
    "maxEmailsPerProxy": 10
  }'
```

### Open Browser Windows

To open browser windows for email accounts with their assigned proxies:

```bash
curl -X POST http://localhost:3002/api/proxies/browser/open
```

## Architecture

The proxy system consists of the following components:

1. **ABCProxy Client** - Utility for making API calls to ABCProxy for fetching proxies
2. **Proxy Service** - Manages CRUD operations for proxies in the database
3. **Proxy Mapping Service** - Handles the relationship between email accounts and proxies
4. **Browser Service** - Manages browser automation to open windows with proxies

## Database Schema

The system adds the following models to the database:

- `Proxy` - Stores information about each proxy
- `ProxyMapping` - Maps proxies to email accounts
- `EmailAccount` (updated) - Added relationship to ProxyMapping

## Testing

To test the system, you can use the provided Postman collection in the `docs` folder or run the included test suite:

```bash
npm test
``` 