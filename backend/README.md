# Email Warmup Backend

A robust backend service for email reputation management and automation, built with Node.js and Express.

## Features

- Email account management
- Proxy rotation and management
- Task scheduling and execution
- Human-like behavior simulation
- Rate limiting and throttling
- Error handling and logging
- RESTful API endpoints

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- Redis (for rate limiting)

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the environment variables in `.env`:
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/email-warmup
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key
   ```

## Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:8000`

## API Documentation

### Authentication
- POST `/api/v1/auth/login` - User login
- POST `/api/v1/auth/register` - User registration

### Email Accounts
- GET `/api/v1/accounts` - List all accounts
- POST `/api/v1/accounts` - Create new account
- PUT `/api/v1/accounts/:id` - Update account
- DELETE `/api/v1/accounts/:id` - Delete account

### Proxies
- GET `/api/v1/proxies` - List all proxies
- POST `/api/v1/proxies` - Add new proxy
- PUT `/api/v1/proxies/:id` - Update proxy
- DELETE `/api/v1/proxies/:id` - Delete proxy

### Tasks
- GET `/api/v1/tasks` - List all tasks
- POST `/api/v1/tasks` - Create new task
- PUT `/api/v1/tasks/:id` - Update task
- DELETE `/api/v1/tasks/:id` - Delete task

## Project Structure

```
src/
├── config/       # Configuration files
├── controllers/  # Route controllers
├── middleware/   # Custom middleware
├── models/       # Database models
├── routes/       # API routes
├── services/     # Business logic
├── utils/        # Utility functions
└── validators/   # Request validation
```

## Testing

Run tests:
```bash
npm test
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT 