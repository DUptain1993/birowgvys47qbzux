#!/bin/bash

echo "🚀 Installing PhantomNet Mobile App Dependencies..."
echo "================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Clean node_modules if it exists
if [ -d "node_modules" ]; then
    echo "🧹 Cleaning existing node_modules..."
    rm -rf node_modules
fi

# Clean package-lock.json if it exists
if [ -f "package-lock.json" ]; then
    echo "🧹 Removing package-lock.json..."
    rm package-lock.json
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo "To start the development server:"
    echo "  npm start"
    echo ""
    echo "Then scan the QR code with Expo Go app on your device."
    echo ""
    echo "Default server credentials:"
    echo "  URL: your-c2-server.com"
    echo "  Port: 8443"
    echo "  Username: admin"
    echo "  Password: phantom_admin_2024"
else
    echo "❌ Failed to install dependencies. Please check the error messages above."
    exit 1
fi
