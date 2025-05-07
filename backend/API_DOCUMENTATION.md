# API Documentation

This document provides a comprehensive reference for the backend API endpoints. The server runs on port 3002 by default.

## Base URL

All API endpoints are prefixed with `/api`.

## Health Check

**GET** `/api/health`

Check if the API server is running.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2023-06-15T12:34:56.789Z"
}
```

## Email Accounts

### Get All Email Accounts

**GET** `/api/email-accounts`

Retrieve all email accounts.

**Response**:
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "password": "password123",
    "createdAt": "2023-06-15T12:34:56.789Z",
    "updatedAt": "2023-06-15T12:34:56.789Z"
  }
]
```

### Get Email Account by ID

**GET** `/api/email-accounts/:id`

Retrieve a specific email account by ID.

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "password123",
  "createdAt": "2023-06-15T12:34:56.789Z",
  "updatedAt": "2023-06-15T12:34:56.789Z"
}
```

### Create Email Account

**POST** `/api/email-accounts`

Create a new email account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "password123",
  "createdAt": "2023-06-15T12:34:56.789Z",
  "updatedAt": "2023-06-15T12:34:56.789Z"
}
```

### Update Email Account

**PATCH** `/api/email-accounts/:id`

Update an existing email account (password only).

**Request Body**:
```json
{
  "password": "newpassword123"
}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "newpassword123",
  "createdAt": "2023-06-15T12:34:56.789Z",
  "updatedAt": "2023-06-15T12:34:56.789Z"
}
```

### Delete Email Account

**DELETE** `/api/email-accounts/:id`

Delete an email account.

**Response**:
- Status: 204 No Content

### Batch Operations

#### Batch Upsert Email Accounts

**POST** `/api/email-accounts/batch`

Create or update multiple email accounts.

**Request Body**:
```json
{
  "accounts": [
    {
      "email": "user1@example.com",
      "password": "password123"
    },
    {
      "email": "user2@example.com",
      "password": "password456"
    }
  ]
}
```

**Response**:
```json
{
  "count": 2
}
```

#### Batch Delete Email Accounts

**DELETE** `/api/email-accounts/batch`

Delete multiple email accounts.

**Request Body**:
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

**Response**:
```json
{
  "count": 2
}
```

## Proxies

### Get Proxies

**GET** `/api/proxies`

Retrieve all active proxies.

**Query Parameters**:
- `limit` (optional): Maximum number of proxies to retrieve (default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Response**:
```json
[
  {
    "id": "uuid",
    "host": "proxy.abcproxy.com",
    "port": 4950,
    "username": "user-zone-abc-region-US",
    "password": "password123",
    "country": "US",
    "state": "California",
    "city": "San Francisco",
    "protocol": "https",
    "isActive": true,
    "lastChecked": "2023-06-15T12:34:56.789Z",
    "createdAt": "2023-06-15T12:34:56.789Z",
    "updatedAt": "2023-06-15T12:34:56.789Z"
  }
]
```

### Get Proxy by ID

**GET** `/api/proxies/:id`

Retrieve a specific proxy by ID.

**Response**:
```json
{
  "id": "uuid",
  "host": "proxy.abcproxy.com",
  "port": 4950,
  "username": "user-zone-abc-region-US",
  "password": "password123",
  "country": "US",
  "state": "California",
  "city": "San Francisco",
  "protocol": "https",
  "isActive": true,
  "lastChecked": "2023-06-15T12:34:56.789Z",
  "createdAt": "2023-06-15T12:34:56.789Z",
  "updatedAt": "2023-06-15T12:34:56.789Z"
}
```

### Fetch Proxies from ABCProxy

**POST** `/api/proxies/fetch`

Fetch proxies from ABCProxy and save them to the database.

**Request Body**:
```json
{
  "country": "US",
  "state": "California",
  "city": "San Francisco",
  "limit": 10
}
```

**Response**:
```json
{
  "message": "Successfully fetched and saved 10 proxies",
  "proxies": [
    {
      "id": "uuid",
      "host": "proxy.abcproxy.com",
      "port": 4950,
      "username": "user-zone-abc-region-US-st-california-city-sanfrancisco",
      "password": "password123",
      "country": "US",
      "state": "California",
      "city": "San Francisco",
      "protocol": "https",
      "isActive": true,
      "lastChecked": "2023-06-15T12:34:56.789Z",
      "createdAt": "2023-06-15T12:34:56.789Z",
      "updatedAt": "2023-06-15T12:34:56.789Z"
    }
  ]
}
```

### Create Session Proxy

**POST** `/api/proxies/session`

Create a session proxy with specified retention time.

**Request Body**:
```json
{
  "minutes": 30
}
```

**Response**:
```json
{
  "id": "uuid",
  "host": "proxy.abcproxy.com",
  "port": 4950,
  "username": "user-zone-abc-session-a1b2c3d4-sessTime-30",
  "password": "password123",
  "protocol": "https",
  "isActive": true,
  "createdAt": "2023-06-15T12:34:56.789Z",
  "updatedAt": "2023-06-15T12:34:56.789Z"
}
```

### Update Proxy

**PATCH** `/api/proxies/:id`

Update a proxy.

**Request Body**:
```json
{
  "isActive": false,
  "password": "newpassword123"
}
```

**Response**:
```json
{
  "id": "uuid",
  "host": "proxy.abcproxy.com",
  "port": 4950,
  "username": "user-zone-abc-region-US",
  "password": "newpassword123",
  "country": "US",
  "state": "California",
  "city": "San Francisco",
  "protocol": "https",
  "isActive": false,
  "lastChecked": "2023-06-15T12:34:56.789Z",
  "createdAt": "2023-06-15T12:34:56.789Z",
  "updatedAt": "2023-06-15T12:34:56.789Z"
}
```

### Delete Proxies

**DELETE** `/api/proxies`

Delete multiple proxies.

**Request Body**:
```json
{
  "ids": ["uuid1", "uuid2"]
}
```

**Response**:
```json
{
  "message": "Successfully deleted 2 proxies",
  "count": 2
}
```

## Proxy Mappings

### Create Proxy Mapping

**POST** `/api/proxies/mapping`

Create a mapping between email accounts and proxies.

**Request Body**:
```json
{
  "emailIds": ["uuid1", "uuid2"],
  "maxProxies": 5,
  "maxEmailsPerProxy": 10
}
```

**Response**:
```json
{
  "message": "Successfully created 2 email-to-proxy mappings",
  "mappings": [
    {
      "emailId": "uuid1",
      "email": "user1@example.com",
      "proxyId": "proxy-uuid1",
      "proxyHost": "proxy.abcproxy.com",
      "proxyPort": 4950,
      "proxyUsername": "user-zone-abc-region-US",
      "proxyPassword": "password123"
    },
    {
      "emailId": "uuid2",
      "email": "user2@example.com",
      "proxyId": "proxy-uuid1",
      "proxyHost": "proxy.abcproxy.com",
      "proxyPort": 4950,
      "proxyUsername": "user-zone-abc-region-US",
      "proxyPassword": "password123"
    }
  ]
}
```

### Get Proxy Mappings

**GET** `/api/proxies/mapping`

Retrieve all proxy mappings.

**Response**:
```json
[
  {
    "emailId": "uuid1",
    "email": "user1@example.com",
    "proxyId": "proxy-uuid1",
    "proxyHost": "proxy.abcproxy.com",
    "proxyPort": 4950,
    "proxyUsername": "user-zone-abc-region-US",
    "proxyPassword": "password123"
  }
]
```

### Delete Proxy Mapping

**DELETE** `/api/proxies/mapping/:emailId`

Delete a proxy mapping for a specific email account.

**Response**:
- Status: 204 No Content

## Browser Automation

### Open Browser Windows

**POST** `/api/proxies/browser/open`

Open browser windows for each email account with its assigned proxy.

**Response**:
```json
{
  "message": "Successfully opened 2 browser windows for email accounts",
  "count": 2
}
```

### Close All Browser Windows

**POST** `/api/proxies/browser/close`

Close all active browser windows.

**Response**:
```json
{
  "message": "All browser windows have been closed"
}
```

### Get Browser Session Stats

**GET** `/api/proxies/browser/stats`

Get statistics about active browser sessions.

**Response**:
```json
{
  "activeSessions": 2
}
```

## Pipelines and Actions

Refer to the relevant sections for information about pipeline and action endpoints. 