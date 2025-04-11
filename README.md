# Email Automation Tool

A simple tool for automating email management tasks.

## Features

- Upload email accounts and passwords via CSV
- Configure proxy servers
- Set maximum simultaneous browser windows
- Automate moving spam emails to inbox

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Material-UI
- Axios

## Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Project Structure

```
.
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── api/         # API client
│   │   ├── components/  # React components
│   │   ├── types/       # TypeScript types
│   │   └── utils/       # Utility functions
│   └── package.json     # Frontend dependencies
└── README.md            # Project documentation
```

## Usage

1. Upload a CSV file containing email accounts and passwords
2. Upload a CSV file containing proxy server information
3. Set the maximum number of simultaneous browser windows
4. Click "Start Automation" to begin the process

## CSV Format

### Email Accounts CSV
```
email,password
user1@example.com,password1
user2@example.com,password2
```

### Proxy Servers CSV
```
host,port,username,password
proxy1.example.com,8080,user1,pass1
proxy2.example.com,8080,user2,pass2
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 