# Email Warmup Frontend

A modern React-based frontend for the Email Warmup application, built with TypeScript and Material-UI.

## Features

- Email account management
- Proxy configuration
- Task automation
- Real-time monitoring
- Human-like behavior simulation
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
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
   VITE_API_BASE_URL=http://localhost:8000
   VITE_AUTH_TOKEN_KEY=auth_token
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Testing

Run tests:
```bash
npm test
```

## Project Structure

```
src/
├── api/          # API client and endpoints
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
└── app/          # Main application pages
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

MIT 