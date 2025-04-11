# Email Warmup Desktop Application

A desktop application for automating email warmup tasks using browser automation.

## Features

- Upload and manage email accounts
- Configure and manage proxies
- Automate email actions:
  - Move emails from spam to inbox
  - Mark emails as important
  - Click links in emails
- Control concurrent windows and speed
- Human-like behavior simulation
- Real-time task monitoring

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- MongoDB (v4.4 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/email-warmup-desktop.git
cd email-warmup-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/email-warmup
```

## Development

1. Start the development server:
```bash
npm start
```

2. Build the application:
```bash
npm run build
```

## Usage

1. Launch the application
2. Upload your email list (CSV format):
   - Email
   - Password
   - Proxy ID

3. Upload your proxy list (CSV format):
   - Host
   - Port
   - Username
   - Password
   - Protocol

4. Configure settings:
   - Number of concurrent windows
   - Speed of automation
   - Human behavior parameters

5. Start the automation process

## File Formats

### Email List (CSV)
```csv
email,password,proxyId
user1@example.com,password1,proxy1
user2@example.com,password2,proxy2
```

### Proxy List (CSV)
```csv
host,port,username,password,protocol
proxy1.example.com,8080,user1,pass1,http
proxy2.example.com,8080,user2,pass2,https
```

## Security Considerations

- Store sensitive data securely
- Use strong passwords
- Regularly update the application
- Monitor system resources
- Follow email provider terms of service

## Troubleshooting

1. If the application fails to start:
   - Check MongoDB connection
   - Verify Node.js version
   - Check system requirements

2. If automation fails:
   - Check proxy connectivity
   - Verify email credentials
   - Check browser compatibility

## License

MIT License

## Support

For support, please open an issue in the GitHub repository. 