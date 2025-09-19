# PhantomNet Mobile App Setup Guide

This guide will help you set up and connect the PhantomNet mobile app to the C2 server.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** (`npm install -g @expo/cli`)
3. **Expo Go app** on your mobile device (iOS/Android)
4. **PhantomNet C2 Server** running

## Quick Start

### 1. Install Dependencies

```bash
cd phantomnet-mobile
npm install
```

### 2. Start the Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### 3. Connect Your Mobile Device

1. Install **Expo Go** from the App Store (iOS) or Google Play Store (Android)
2. Scan the QR code with your device's camera (iOS) or the Expo Go app (Android)
3. The app will load on your device

### 4. Configure Server Connection

When you first open the app, you'll see the login screen with server configuration options:

- **Server URL**: `localhost` (for local development)
- **Port**: `8443`
- **Use SSL**: `true`

### 5. Login

Use the default credentials:
- **Username**: `wappafloppa`
- **Password**: `Stelz17@`

## Server Configuration

### For Local Development

If you're running the server locally:

1. **Server URL**: `localhost` or your computer's IP address
2. **Port**: `8443`
3. **Use SSL**: `true` (server uses self-signed certificates)

### For Remote Server

If you're connecting to a remote server:

1. **Server URL**: The server's IP address or domain
2. **Port**: `8443` (or the configured port)
3. **Use SSL**: `true` (recommended for production)

## Troubleshooting

### Connection Issues

1. **"Connection Failed" Error**:
   - Ensure the C2 server is running
   - Check the server URL and port
   - Verify SSL settings

2. **"Network Error"**:
   - Check your internet connection
   - Ensure the server is accessible from your device
   - Try disabling SSL if using self-signed certificates

3. **"Invalid Credentials"**:
   - Verify username and password
   - Check if the admin user exists in the server database

### SSL Certificate Issues

If you're using self-signed certificates (common in development):

1. The app will show SSL warnings
2. You can temporarily disable SSL in the server configuration
3. For production, use proper SSL certificates

### Mobile Device Issues

1. **App won't load**:
   - Ensure Expo Go is installed
   - Check that your device and computer are on the same network
   - Try restarting the Expo development server

2. **Connection timeouts**:
   - Increase the timeout in server configuration
   - Check network stability

## Features

The mobile app provides:

- **Dashboard**: View server statistics and connected bots
- **Bot Management**: Monitor and control connected systems
- **Command Execution**: Send commands to bots
- **Payload Generation**: Create and download payloads
- **Target Discovery**: Discover and manage targets
- **Campaign Management**: Create and monitor campaigns
- **Settings**: Configure server connection and app preferences

## Security Notes

- **Development**: The app uses self-signed SSL certificates for local development
- **Production**: Use proper SSL certificates and secure server configuration
- **Credentials**: Change default credentials in production
- **Network**: Ensure secure network connections in production environments

## API Endpoints

The mobile app communicates with these server endpoints:

- `POST /admin/login` - Authentication
- `GET /admin/stats` - Server statistics
- `GET /admin/bots` - List connected bots
- `POST /admin/commands` - Send commands
- `GET /admin/payloads` - List payloads
- `POST /admin/payloads` - Generate payloads
- `GET /admin/targets` - List targets
- `POST /admin/targets/discover` - Discover targets
- `GET /admin/campaigns` - List campaigns
- `POST /admin/campaigns` - Create campaigns

## Development

### Running in Development Mode

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Support

If you encounter issues:

1. Check the server logs
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Check the mobile app console for errors

For additional help, refer to the main README.md file.
