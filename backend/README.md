# Pipeline Backend Service

A TypeScript-based Express backend service for the Pipeline application with Prisma ORM and PostgreSQL.

## Features

- RESTful API for pipeline management
- TypeScript support
- Express.js framework
- Prisma ORM with PostgreSQL
- Winston logging
- CORS enabled for local development
- Redis caching support

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Redis (optional, for caching)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3002
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?schema=emailWarmer"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Logging Configuration
LOG_LEVEL="info"

# JWT Configuration (if needed)
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
```

3. Initialize Prisma:
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3002`

## Database Management

- View database schema: `prisma/schema.prisma`
- Run migrations: `npm run prisma:migrate`
- Open Prisma Studio: `npm run prisma:studio`
- Generate Prisma client: `npm run prisma:generate`

## Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Pipelines

- `GET /api/pipelines` - Get all pipelines
- `GET /api/pipelines/:id` - Get pipeline by ID
- `POST /api/pipelines` - Create new pipeline
- `PUT /api/pipelines/:id` - Update pipeline
- `DELETE /api/pipelines/:id` - Delete pipeline

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
backend/
├── src/
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # Application entry point
├── prisma/
│   ├── migrations/     # Database migrations
│   └── schema.prisma   # Database schema
├── dist/              # Compiled JavaScript
├── package.json
└── README.md
```

## Database Schema

The application uses Prisma with the following main models:

```prisma
model Pipeline {
  id        String   @id @default(uuid())
  name      String
  nodes     Node[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Node {
  id        String   @id @default(uuid())
  action    String?
  pipeline  Pipeline @relation(fields: [pipelineId], references: [id])
  pipelineId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
``` 