# PhantomNet C2 Server & Mobile App

A sophisticated Command and Control (C2) server with mobile client application for advanced red team operations and security research.

## ⚠️ IMPORTANT DISCLAIMER

**This software is for educational and authorized security testing purposes only.**
- Use only in controlled environments with proper authorization
- The authors are not responsible for any misuse or illegal activities
- Ensure compliance with all applicable laws and regulations
- Obtain proper authorization before testing on any systems

## 🚀 Quick Start

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd c2server-client-app-1

# Run the automated setup script
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### Server Setup

1. **Install Python Dependencies**
   ```bash
   cd phantomnet-c2
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**
   ```bash
   python phantomnet-server.py
   ```

#### Mobile App Setup

1. **Install Dependencies**
   ```bash
   cd phantomnet-mobile
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

## 📋 System Requirements

### Server Requirements
- Python 3.8 or higher
- 2GB RAM minimum (4GB recommended)
- 10GB free disk space
- Network access for threat intelligence APIs

### Mobile App Requirements
- Node.js 18 or higher
- npm or yarn
- Expo CLI
- Android Studio (for Android builds)
- Xcode (for iOS builds)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `phantomnet-c2` directory:

```env
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=False

# Database
DATABASE_URL=sqlite:///phantom_c2.db

# Server Settings
HOST=0.0.0.0
PORT=8443

# API Keys (Optional)
SHODAN_API_KEY=your-shodan-api-key
VIRUSTOTAL_API_KEY=your-virustotal-api-key
ABUSEIPDB_API_KEY=your-abuseipdb-api-key

# Security
MAX_LOGIN_ATTEMPTS=5
PASSWORD_MIN_LENGTH=8
```

### Mobile App Configuration

Edit `phantomnet-mobile/src/constants/index.ts`:

```typescript
export const API_BASE_URL = 'https://your-server.com:8443';
export const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'phantom_admin_2024'
};
```

## 🏗️ Architecture

### Server Components

- **Core Server** (`phantomnet-server.py`): Main Flask application
- **Database Models** (`models.py`): SQLAlchemy ORM models
- **API Routes** (`routes/`): RESTful API endpoints
- **Target Discovery** (`discovery.py`): Automated target discovery
- **Payload Generation** (`payload_generator.py`): Custom payload creation
- **Threat Intelligence** (`threat_intelligence.py`): Reputation checking

### Mobile App Components

- **Navigation** (`src/navigation/`): React Navigation setup
- **Screens** (`src/screens/`): Main application screens
- **Services** (`src/services/`): API and offline services
- **Components** (`src/components/`): Reusable UI components
- **Types** (`src/types/`): TypeScript type definitions

## 🔐 Security Features

### Server Security
- SSL/TLS encryption
- Session-based authentication
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection
- CSRF protection

### Mobile App Security
- Secure credential storage
- Certificate pinning
- Offline data encryption
- Network security policies

## 📱 Mobile App Features

- **Dashboard**: System overview and statistics
- **Bot Management**: View and control connected systems
- **Command Execution**: Send commands to bots
- **Payload Generation**: Create custom payloads
- **Target Discovery**: Find potential targets
- **Campaign Management**: Run automated campaigns
- **Data Collection**: View harvested data
- **Settings**: Configure server connection

## 🛠️ Development

### Running Tests

```bash
# Server tests
cd phantomnet-c2
source venv/bin/activate
pytest

# Mobile app tests
cd phantomnet-mobile
npm test
```

### Code Quality

```bash
# Python code formatting
black phantomnet-c2/
flake8 phantomnet-c2/
mypy phantomnet-c2/

# TypeScript linting
cd phantomnet-mobile
npm run lint
```

### Building for Production

#### Server
```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:8443 phantomnet-server:app
```

#### Mobile App
```bash
# Android
cd phantomnet-mobile
eas build --platform android

# iOS
eas build --platform ios
```

## 📊 API Documentation

### Authentication
All API endpoints require authentication via session cookies or JWT tokens.

### Bot Endpoints
- `POST /bot/register` - Register new bot
- `GET /bot/command/<bot_id>` - Get pending commands
- `POST /bot/result/<command_id>` - Submit command results
- `POST /bot/data/*` - Submit collected data

### Admin Endpoints
- `GET /admin/dashboard` - Web dashboard
- `POST /admin/commands` - Send commands to bots
- `POST /admin/payloads` - Generate payloads
- `POST /admin/campaigns` - Create campaigns
- `POST /admin/targets/discover` - Discover targets

## 🔍 Monitoring & Logging

### Log Files
- Server logs: `phantomnet-c2/logs/phantom.log`
- Access logs: `phantomnet-c2/logs/access.log`
- Error logs: `phantomnet-c2/logs/error.log`

### Monitoring
- Real-time dashboard with system statistics
- Bot status monitoring
- Command execution tracking
- Data collection metrics

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Errors**
   - Ensure proper SSL certificates are configured
   - Check certificate paths in `.env` file

2. **Database Connection Issues**
   - Verify database URL in configuration
   - Check database permissions

3. **Mobile App Connection Issues**
   - Verify server URL in constants
   - Check network connectivity
   - Ensure SSL certificates are valid

4. **API Key Issues**
   - Verify API keys are correctly set
   - Check API key permissions and quotas

### Getting Help

1. Check the logs for error messages
2. Verify configuration settings
3. Ensure all dependencies are installed
4. Check network connectivity and firewall settings

## 📝 License

This project is for educational and research purposes only. Use at your own risk.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the documentation
- Review the troubleshooting section
- Create an issue in the repository

---

**Remember: Always use this software responsibly and in accordance with applicable laws and regulations.**
