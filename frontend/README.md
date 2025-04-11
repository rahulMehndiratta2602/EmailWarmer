# Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
src/
├── api/         # API client and endpoints
├── components/  # React components
├── types/       # TypeScript type definitions
└── utils/       # Utility functions
```

## Components

- `AutomationForm`: Main form for uploading files and starting automation
- `LoadingErrorState`: Reusable component for loading and error states

## API Client

The API client (`src/api/client.ts`) handles:
- Email file upload
- Proxy file upload
- Starting automation process

## Type Definitions

- `EmailAccount`: Email account information
- `Proxy`: Proxy server configuration
- `AutomationConfig`: Configuration for the automation process
- `ApiResponse`: Standard API response format 