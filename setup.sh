#!/bin/bash

# PhantomNet C2 Server & Mobile App Setup Script
# This script sets up the complete PhantomNet environment

set -e  # Exit on any error

echo "🚀 PhantomNet C2 Server & Mobile App Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check system requirements
print_header "Checking system requirements..."

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    print_status "Python 3 found: $PYTHON_VERSION"
    
    # Check if Python version is 3.8 or higher
    if python3 -c "import sys; exit(0 if sys.version_info >= (3, 8) else 1)"; then
        print_status "Python version is compatible"
    else
        print_error "Python 3.8 or higher is required"
        exit 1
    fi
else
    print_error "Python 3 is not installed"
    exit 1
fi

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
    
    # Check if Node.js version is 18 or higher
    if node -e "process.exit(process.version.split('.')[0] >= 'v18' ? 0 : 1)"; then
        print_status "Node.js version is compatible"
    else
        print_error "Node.js 18 or higher is required"
        exit 1
    fi
else
    print_error "Node.js is not installed"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Setup Python virtual environment
print_header "Setting up Python virtual environment..."

if [ ! -d "venv" ]; then
    print_status "Creating Python virtual environment..."
    python3 -m venv venv
else
    print_status "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
print_header "Installing Python dependencies..."
if [ -f "phantomnet-c2/requirements.txt" ]; then
    print_status "Installing server dependencies..."
    pip install -r phantomnet-c2/requirements.txt
else
    print_error "requirements.txt not found in phantomnet-c2 directory"
    exit 1
fi

# Setup environment file
print_header "Setting up environment configuration..."
if [ ! -f "phantomnet-c2/.env" ]; then
    if [ -f "phantomnet-c2/env.example" ]; then
        print_status "Creating .env file from template..."
        cp phantomnet-c2/env.example phantomnet-c2/.env
        print_warning "Please edit phantomnet-c2/.env with your actual configuration values"
    else
        print_warning "No environment template found, creating basic .env file..."
        cat > phantomnet-c2/.env << EOF
# PhantomNet C2 Server Configuration
FLASK_ENV=development
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
DEBUG=True
DATABASE_URL=sqlite:///phantom_c2.db
HOST=0.0.0.0
PORT=8443
LOG_LEVEL=INFO
EOF
    fi
else
    print_status ".env file already exists"
fi

# Setup mobile app
print_header "Setting up mobile app..."

if [ -d "phantomnet-mobile" ]; then
    cd phantomnet-mobile
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing mobile app dependencies..."
        npm install
    else
        print_status "Mobile app dependencies already installed"
    fi
    
    # Check if Expo CLI is installed
    if ! command -v expo &> /dev/null; then
        print_status "Installing Expo CLI globally..."
        npm install -g @expo/cli
    else
        print_status "Expo CLI already installed"
    fi
    
    cd ..
else
    print_warning "Mobile app directory not found"
fi

# Create necessary directories
print_header "Creating necessary directories..."
mkdir -p phantomnet-c2/logs
mkdir -p phantomnet-c2/uploads
mkdir -p phantomnet-c2/certificates
mkdir -p phantomnet-c2/backups

# Set proper permissions
print_status "Setting proper permissions..."
chmod 755 phantomnet-c2/logs
chmod 755 phantomnet-c2/uploads
chmod 700 phantomnet-c2/certificates
chmod 755 phantomnet-c2/backups

# Create systemd service file (optional)
print_header "Creating systemd service file..."
if command -v systemctl &> /dev/null; then
    print_status "Creating systemd service file..."
    cat > phantomnet-c2.service << EOF
[Unit]
Description=PhantomNet C2 Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)/phantomnet-c2
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/python phantomnet-server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    print_status "Service file created: phantomnet-c2.service"
    print_warning "To install the service, run: sudo cp phantomnet-c2.service /etc/systemd/system/ && sudo systemctl enable phantomnet-c2"
fi

# Create startup scripts
print_header "Creating startup scripts..."

# Server startup script
cat > start-server.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
cd phantomnet-c2
python phantomnet-server.py
EOF
chmod +x start-server.sh

# Mobile app startup script
cat > start-mobile.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")/phantomnet-mobile"
npm start
EOF
chmod +x start-mobile.sh

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r phantomnet-c2/phantom_c2.db "$BACKUP_DIR/" 2>/dev/null || true
cp -r phantomnet-c2/logs "$BACKUP_DIR/" 2>/dev/null || true
echo "Backup created in $BACKUP_DIR"
EOF
chmod +x backup.sh

# Create update script
cat > update.sh << 'EOF'
#!/bin/bash
echo "Updating PhantomNet..."
source venv/bin/activate
pip install --upgrade -r phantomnet-c2/requirements.txt
cd phantomnet-mobile && npm update && cd ..
echo "Update complete!"
EOF
chmod +x update.sh

# Security recommendations
print_header "Security Recommendations"
echo "=========================================="
print_warning "IMPORTANT SECURITY STEPS:"
echo "1. Change default admin password in the web interface"
echo "2. Configure proper SSL certificates in phantomnet-c2/.env"
echo "3. Set up firewall rules to restrict access"
echo "4. Regularly update dependencies with ./update.sh"
echo "5. Monitor logs in phantomnet-c2/logs/"
echo "6. Use strong API keys for threat intelligence services"
echo ""

# Final status
print_header "Setup Complete!"
echo "=========================================="
print_status "Server can be started with: ./start-server.sh"
print_status "Mobile app can be started with: ./start-mobile.sh"
print_status "Backup can be created with: ./backup.sh"
print_status "Updates can be applied with: ./update.sh"
echo ""
print_status "Default admin credentials: admin / phantom_admin_2024"
print_warning "Please change these credentials immediately!"
echo ""
print_status "Server will be available at: https://localhost:8443"
print_status "Mobile app will show QR code for Expo Go app"
echo ""
print_warning "Remember to configure your .env file with proper values!"
echo ""
print_status "Setup completed successfully! 🎉"
