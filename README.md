# Email Warmer

A scalable email automation tool built with Next.js, TypeScript, and Material-UI.

## Project Structure

```
frontend/
├── src/
│   ├── api/        # API client and endpoints
│   ├── app/        # Next.js app router pages
│   ├── components/ # Reusable React components
│   ├── hooks/      # Custom React hooks
│   ├── types/      # TypeScript type definitions
│   └── utils/      # Utility functions
```

## Tech Stack

- **Frontend**
  - Next.js 14
  - TypeScript
  - Material-UI
  - Axios

## Getting Started

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Email account management
- Task scheduling and automation
- Real-time activity monitoring
- Performance analytics
- Customizable settings

## Documentation

For detailed documentation, see [system-design.md](system-design.md) 