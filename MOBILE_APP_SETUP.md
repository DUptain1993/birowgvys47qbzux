# PhantomNet Mobile App - Complete Setup Guide

## ✅ **Mobile App Login & Navigation - FIXED**

The mobile app has been completely fixed and is now ready for use. Here's what has been implemented:

### **🔐 Authentication System**
- ✅ **AuthContext** - Complete authentication state management
- ✅ **Login Flow** - Proper login with server validation
- ✅ **Session Management** - Automatic token handling and storage
- ✅ **Logout Functionality** - Complete logout with data cleanup
- ✅ **Auto-login** - Remembers login state across app restarts

### **📱 Screen Navigation**
- ✅ **Login Screen** - Pre-filled with default credentials
- ✅ **Dashboard** - Real-time server statistics and bot monitoring
- ✅ **Bots Screen** - List and manage connected bots
- ✅ **Commands Screen** - Send commands to bots
- ✅ **Payloads Screen** - Generate and manage payloads
- ✅ **Targets Screen** - Discover and manage targets
- ✅ **Campaigns Screen** - Create and monitor campaigns
- ✅ **Settings Screen** - Server configuration and logout

### **🛠️ Technical Improvements**
- ✅ **Error Handling** - Comprehensive error handling throughout
- ✅ **Loading States** - Proper loading indicators
- ✅ **Offline Support** - Cached data and offline queue
- ✅ **Network Status** - Connection monitoring
- ✅ **Data Persistence** - Settings and preferences storage

## 🚀 **Quick Start Guide**

### **1. Start the Server**
```bash
# From the project root
python start_server.py
```

### **2. Start the Mobile App**
```bash
# In a new terminal
cd phantomnet-mobile
npm install
npm start
```

### **3. Connect Your Device**
1. Install **Expo Go** on your mobile device
2. Scan the QR code from the terminal
3. The app will load on your device

### **4. Login**
- **Username**: `wappafloppa`
- **Password**: `Stelz17@`
- **Server**: `localhost:8443` (pre-configured)

## 📋 **Default Credentials**

```
Username: wappafloppa
Password: Stelz17@
Server URL: localhost
Port: 8443
SSL: Enabled
```

## 🔧 **Features Available**

### **Dashboard**
- Real-time server statistics
- Connected bots overview
- Recent commands and activities
- System health monitoring

### **Bot Management**
- View all connected bots
- Bot status monitoring (Active/Inactive/Offline)
- Bot details and capabilities
- Terminate bot connections

### **Command Execution**
- Send commands to specific bots
- Command history and results
- Real-time command status updates
- Batch command operations

### **Payload Generation**
- Create payloads for different platforms
- Windows (EXE, DLL)
- Linux (ELF, Shell scripts)
- macOS (Mach-O)
- Download generated payloads

### **Target Discovery**
- Network scanning capabilities
- Port scanning
- Service enumeration
- Vulnerability detection
- Target management

### **Campaign Management**
- Create targeted campaigns
- Campaign monitoring
- Success rate tracking
- Automated exploitation

### **Settings & Configuration**
- Server connection settings
- Theme preferences (Light/Dark/Auto)
- Auto-refresh settings
- Notification preferences
- Data management
- Logout functionality

## 🐛 **Troubleshooting**

### **Connection Issues**
1. **"Connection Failed"**
   - Ensure server is running (`python start_server.py`)
   - Check server URL and port in settings
   - Verify SSL settings

2. **"Invalid Credentials"**
   - Use default credentials: `wappafloppa` / `Stelz17@`
   - Check if admin user exists in server database

3. **"Network Error"**
   - Check internet connection
   - Ensure device and server are on same network
   - Try disabling SSL for local development

### **App Issues**
1. **App won't load**
   - Ensure Expo Go is installed
   - Check that device and computer are on same network
   - Restart Expo development server

2. **Navigation issues**
   - Force close and reopen the app
   - Clear app data in device settings
   - Restart the development server

### **Server Issues**
1. **Server won't start**
   - Check Python version (3.8+)
   - Install dependencies: `pip install -r phantomnet-c2/requirements.txt`
   - Check port 8443 is not in use

2. **Database errors**
   - Delete `phantomnet-c2/phantom_c2.db` to reset
   - Restart the server to recreate database

## 🔒 **Security Notes**

- **Development**: Uses self-signed SSL certificates
- **Production**: Use proper SSL certificates
- **Credentials**: Change default credentials in production
- **Network**: Ensure secure network connections

## 📱 **Mobile App Architecture**

```
App.tsx
├── AuthProvider (Authentication Context)
├── AppNavigator
│   ├── LoginScreen (Unauthenticated)
│   └── MainTabNavigator (Authenticated)
│       ├── DashboardScreen
│       ├── BotsScreen
│       ├── CommandsScreen
│       ├── PayloadsScreen
│       ├── TargetsScreen
│       ├── CampaignsScreen
│       └── SettingsScreen
```

## 🎯 **Next Steps**

1. **Test the complete flow**:
   - Login with default credentials
   - Navigate through all screens
   - Test server connection
   - Try generating a payload
   - Test logout functionality

2. **Customize for your needs**:
   - Update server configuration
   - Modify default credentials
   - Add custom payloads
   - Configure target discovery

3. **Production deployment**:
   - Use proper SSL certificates
   - Change default credentials
   - Configure secure server settings
   - Set up proper authentication

## 📞 **Support**

If you encounter any issues:

1. Check the server logs for errors
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Check the mobile app console for errors
5. Refer to the main README.md for additional help

The mobile app is now fully functional and ready for use! 🎉
