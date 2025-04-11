# Email Warmup System - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- Git
- Docker (optional, for containerized deployment)

## Project Structure

```
EmailWarmup/
├── frontend/           # React/TypeScript frontend application
├── backend/            # Python backend application
├── docker/            # Docker configuration files
├── .env.example       # Example environment variables
└── docker-compose.yml # Docker Compose configuration
```

## Quick Start with Docker

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/EmailWarmup.git
   cd EmailWarmup
   ```

2. Copy environment files:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

3. Start the application:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - MongoDB: mongodb://localhost:27017

## Manual Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   python init_db.py
   ```

6. Start the backend server:
   ```bash
   python start.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/email_warmup
MONGODB_DB=email_warmup

# Server
PORT=8000
HOST=0.0.0.0
DEBUG=True

# Security
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Authentication
VITE_AUTH_TOKEN_KEY=auth_token
VITE_REFRESH_TOKEN_KEY=refresh_token

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# UI Configuration
VITE_THEME=light
VITE_DEFAULT_LANGUAGE=en
```

## Development Workflow

1. **Backend Development**
   - API endpoints are in `backend/api/`
   - Models are in `backend/models/`
   - Services are in `backend/services/`
   - Run tests: `pytest`

2. **Frontend Development**
   - Components are in `frontend/src/components/`
   - Pages are in `frontend/src/app/`
   - API client is in `frontend/src/api/`
   - Run tests: `npm test`

## Common Issues and Solutions

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify network access

2. **API Connection Issues**
   - Check if backend server is running
   - Verify CORS settings
   - Check network connectivity

3. **Authentication Issues**
   - Clear browser storage
   - Check JWT configuration
   - Verify token expiration

## Production Deployment

1. **Backend Deployment**
   ```bash
   # Build Docker image
   docker build -t email-warmup-backend -f docker/backend.Dockerfile .

   # Run container
   docker run -d -p 8000:8000 --env-file backend/.env email-warmup-backend
   ```

2. **Frontend Deployment**
   ```bash
   # Build production version
   cd frontend
   npm run build

   # Serve static files
   npm run preview
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

## License

This project is licensed under the MIT License - see the LICENSE file for details. 