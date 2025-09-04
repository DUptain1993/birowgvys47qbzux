# PhantomNet C2 Mobile App

A powerful React Native mobile application for controlling the PhantomNet C2 server. Built with Expo Go for easy development and testing.

## Features

### 🔐 **Authentication & Security**
- Secure login to C2 server
- Server configuration management
- SSL/TLS support
- Session management
- Secure credential storage

### 📊 **Dashboard & Monitoring**
- Real-time server statistics
- Live bot status monitoring
- Recent commands tracking
- Target discovery overview
- Campaign progress tracking
- Auto-refresh capabilities

### 🤖 **Bot Management**
- View all connected bots
- Real-time bot status updates
- Bot capability overview
- Send commands to individual bots
- Batch bot operations
- Bot termination controls

### ⚡ **Command & Control**
- Send commands to bots
- Real-time command execution
- Command history and results
- Batch command operations
- Command templates and shortcuts

### 💣 **Payload Management**
- Generate custom payloads
- Multi-platform support (Windows, Linux, macOS)
- Payload download and deployment
- Payload history and management

### 🎯 **Target Discovery**
- Automated target scanning
- Shodan, Censys, and network scanning integration
- Target reputation checking
- Vulnerability assessment
- Target categorization and filtering

### 🚀 **Campaign Management**
- Create and manage exploitation campaigns
- Automated target exploitation
- Campaign progress tracking
- Success rate monitoring
- Campaign templates and automation

### 🗄️ **Database Access**
- Direct database queries
- Real-time data monitoring
- Export capabilities
- Data visualization
- Backup and restore functions

### ⚙️ **Advanced Features**
- Offline data caching
- Background sync
- Push notifications
- Multi-server support
- Custom themes and preferences

## Installation

### Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo CLI**:
   ```bash
   npm install -g @expo/cli
   ```

3. **Expo Go App** on your mobile device (iOS/Android)

### Setup

1. **Clone and navigate to mobile app:**
   ```bash
   cd phantomnet-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Scan QR code** with Expo Go app on your device

## Configuration

### Server Connection

The app supports multiple server configurations:

```typescript
// Default configuration
const serverConfig = {
  url: 'your-c2-server.com',
  port: 8443,
  useSSL: true,
  timeout: 30000,
};
```

### Authentication

- **Default Credentials**: `admin` / `phantom_admin_2024`
- **Session Management**: Automatic token handling
- **Security**: Secure credential storage using Expo SecureStore

## Usage

### First Time Setup

1. **Launch the app** via Expo Go
2. **Configure server settings**:
   - Enter your C2 server URL
   - Set port (default: 8443)
   - Enable SSL/TLS
3. **Login** with your credentials
4. **Start controlling** your C2 infrastructure

### Main Features

#### Dashboard
- **Real-time Statistics**: Monitor bots, targets, campaigns
- **Recent Activity**: View latest commands and operations
- **Quick Actions**: Fast access to common functions

#### Bot Management
- **Bot List**: View all connected bots with status
- **Command Execution**: Send commands to individual or multiple bots
- **Live Monitoring**: Real-time bot status updates

#### Payload Generation
- **Platform Selection**: Windows, Linux, macOS support
- **Architecture Options**: x86, x64 compatibility
- **Download & Deploy**: Seamless payload management

#### Target Discovery
- **Automated Scanning**: Shodan, Censys integration
- **Network Scanning**: Local network discovery
- **Reputation Checking**: Threat intelligence integration

## Project Structure

```
phantomnet-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components
│   │   ├── forms/          # Form components
│   │   └── modals/         # Modal dialogs
│   ├── screens/            # Screen components
│   │   ├── auth/           # Authentication screens
│   │   ├── bots/           # Bot management screens
│   │   ├── commands/       # Command management screens
│   │   ├── payloads/       # Payload generation screens
│   │   ├── targets/        # Target discovery screens
│   │   ├── campaigns/      # Campaign management screens
│   │   ├── database/       # Database access screens
│   │   └── settings/       # Settings screens
│   ├── services/           # API and service layer
│   │   ├── api.ts          # Main API service
│   │   └── storage.ts      # Local storage service
│   ├── utils/              # Utility functions
│   │   ├── helpers.ts      # Helper functions
│   │   ├── validators.ts   # Input validation
│   │   └── formatters.ts   # Data formatting
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Main types file
│   ├── constants/          # App constants
│   │   └── index.ts        # Main constants file
│   ├── navigation/         # Navigation configuration
│   │   └── AppNavigator.tsx # Main navigator
│   └── assets/             # Static assets
├── App.tsx                 # Main app component
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## API Integration

The app communicates with the PhantomNet C2 server via RESTful APIs:

### Authentication
```typescript
POST /admin/login
{
  "username": "admin",
  "password": "password"
}
```

### Bot Management
```typescript
GET /admin/bots          # Get all bots
POST /admin/commands     # Send command
POST /admin/bots/{id}/terminate  # Terminate bot
```

### Payload Generation
```typescript
POST /admin/payloads     # Generate payload
GET /admin/payloads/{id}/download  # Download payload
```

### Target Discovery
```typescript
GET /admin/targets       # Get discovered targets
POST /admin/targets/discover  # Start discovery
```

## Security Features

- **Encrypted Communication**: SSL/TLS support
- **Secure Storage**: Expo SecureStore for credentials
- **Session Management**: Automatic token refresh
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Robust error management
- **Offline Support**: Cached data for offline access

## Development

### Adding New Features

1. **Create Component**:
   ```typescript
   // src/components/NewFeature.tsx
   import React from 'react';
   import { View, Text } from 'react-native';

   export default function NewFeature() {
     return (
       <View>
         <Text>New Feature Component</Text>
       </View>
     );
   }
   ```

2. **Add Screen**:
   ```typescript
   // src/screens/NewScreen.tsx
   import React from 'react';
   import { View, Text } from 'react-native';

   export default function NewScreen() {
     return (
       <View>
         <Text>New Screen</Text>
       </View>
     );
   }
   ```

3. **Update Navigation**:
   ```typescript
   // src/navigation/AppNavigator.tsx
   import NewScreen from '../screens/NewScreen';

   // Add to stack navigator
   <Stack.Screen name="NewScreen" component={NewScreen} />
   ```

4. **Add API Integration**:
   ```typescript
   // src/services/api.ts
   async getNewData(): Promise<ApiResponse<any>> {
     return this.makeRequest('/admin/new-endpoint');
   }
   ```

### Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Building for Production

### Android APK
```bash
expo build:android
```

### iOS App Store
```bash
expo build:ios
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check server URL and port
   - Verify SSL/TLS settings
   - Ensure server is running and accessible

2. **Login Failed**
   - Verify credentials
   - Check server logs for authentication errors
   - Ensure admin user exists in database

3. **App Crashes**
   - Clear Expo Go cache
   - Restart Metro bundler
   - Check console for error messages

### Debug Mode

Enable debug logging:
```typescript
// In api.ts
console.log('API Request:', url, config);
console.log('API Response:', response);
```

## Troubleshooting

### TypeScript Errors

If you encounter TypeScript compilation errors:

1. **Missing Dependencies:**
   ```bash
   npm install @types/react @types/react-native
   npm install @expo/vector-icons
   ```

2. **Clean Install:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Clear Metro Cache:**
   ```bash
   npx expo start --clear
   ```

4. **TypeScript Configuration:**
   - Ensure `tsconfig.json` is properly configured
   - Check that all import paths are correct
   - Verify component prop types match usage

### Common Issues

1. **"Cannot find module" errors:**
   - Run `npm install` to install missing dependencies
   - Check `package.json` for correct dependency versions

2. **Network connection issues:**
   - Verify server URL and port in settings
   - Check SSL/TLS configuration
   - Test server connectivity

3. **Offline functionality not working:**
   - Ensure `@react-native-community/netinfo` is installed
   - Check AsyncStorage permissions
   - Verify offline cache is enabled

### Development Tips

- Use `console.log()` for debugging (logs appear in Expo CLI)
- Enable "Debug JS Remotely" in Expo Go for browser debugging
- Use React DevTools for component inspection
- Check the Expo documentation for platform-specific issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is for educational and research purposes only. Use at your own risk.

## Disclaimer

This software is designed for security research and education. The authors are not responsible for any misuse or illegal activities conducted with this software.
