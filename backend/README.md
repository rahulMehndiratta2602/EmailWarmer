# Email Automation Pipeline Backend

This is the backend service for the Email Automation Pipeline application. It provides API endpoints for managing email automation pipelines with Redis caching and Prisma ORM.

## Features

- RESTful API for pipeline management
- Redis caching for improved performance
- Prisma ORM for database operations
- TypeScript support
- Environment-based configuration
- Error handling and logging

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Redis
- npm or yarn

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/email_pipeline?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=your_redis_password

# JWT Configuration (if needed)
JWT_SECRET=your_jwt_secret
```

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Generate Prisma client:
```bash
npx prisma generate
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## API Endpoints

### Pipelines

- `GET /api/pipelines` - Get all pipelines
- `GET /api/pipelines/:id` - Get a specific pipeline
- `POST /api/pipelines` - Create a new pipeline
- `PUT /api/pipelines/:id` - Update a pipeline
- `DELETE /api/pipelines/:id` - Delete a pipeline

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.ts          # Express application
├── prisma/             # Prisma schema and migrations
├── .env                # Environment variables
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Development

- Run tests: `npm run test`
- Build for production: `npm run build`
- Start production server: `npm start`

## License

MIT 