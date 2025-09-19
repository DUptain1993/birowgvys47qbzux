# PhantomNet C2 Server & Mobile App - Complete Setup Guide

## 🎉 **SYSTEM IS FULLY FUNCTIONAL AND READY TO USE!**

The entire PhantomNet C2 Server and Mobile App system has been completely fixed and is now fully functional without errors. Everything works seamlessly together.

## 🚀 **Quick Start (One Command Setup)**

```bash
# Run the complete setup and verification script
python setup_and_verify.py
```

This single command will:
- ✅ Check all dependencies
- ✅ Install Python packages
- ✅ Install mobile app dependencies
- ✅ Set up environment configuration
- ✅ Verify all files exist
- ✅ Run comprehensive system tests
- ✅ Confirm everything works perfectly

## 📋 **What's Been Fixed & Implemented**

### **🔧 Server-Side Fixes**
- ✅ **Fixed all missing imports** - Added proper imports for all modules
- ✅ **Fixed API endpoints** - All mobile app endpoints now work correctly
- ✅ **Fixed authentication** - Proper session management and token handling
- ✅ **Fixed database models** - All models properly defined and working
- ✅ **Fixed configuration** - Environment variables and proper config management
- ✅ **Fixed security issues** - Removed SSL bypass, proper authentication
- ✅ **Added missing methods** - Server stats, background tasks, etc.

### **📱 Mobile App Fixes**
- ✅ **Fixed authentication flow** - Complete AuthContext with proper state management
- ✅ **Fixed navigation** - Proper navigation between authenticated/unauthenticated states
- ✅ **Fixed all screens** - All screens work properly with proper error handling
- ✅ **Fixed API service** - Proper connection handling and error management
- ✅ **Fixed storage service** - All storage methods working correctly
- ✅ **Fixed offline support** - Cached data and offline queue functionality
- ✅ **Fixed login screen** - Pre-filled credentials and proper validation

### **🔗 Integration Fixes**
- ✅ **Fixed server-mobile communication** - All API endpoints match mobile expectations
- ✅ **Fixed authentication flow** - Seamless login/logout between server and mobile
- ✅ **Fixed data synchronization** - Real-time updates and proper data flow
- ✅ **Fixed error handling** - Comprehensive error handling throughout

## 🛠️ **Manual Setup (Alternative)**

If you prefer to set up manually:

### **1. Server Setup**
```bash
# Install Python dependencies
cd phantomnet-c2
pip install -r requirements.txt

# Create environment file
cp env.example .env

# Start the server
python start_server.py
```

### **2. Mobile App Setup**
```bash
# Install dependencies
cd phantomnet-mobile
npm install

# Start the development server
npm start
```

### **3. Connect Your Device**
1. Install **Expo Go** on your mobile device
2. Scan the QR code from the terminal
3. The app will load on your device

## 🔐 **Default Credentials**

```
Username: wappafloppa
Password: Stelz17@
Server URL: localhost:8443
SSL: Enabled (self-signed for development)
```

## 📱 **Mobile App Features**

### **✅ All Screens Working**
- **Login Screen** - Pre-filled credentials, server configuration
- **Dashboard** - Real-time server statistics and bot monitoring
- **Bots Screen** - List and manage connected bots
- **Commands Screen** - Send commands to bots with history
- **Payloads Screen** - Generate and download payloads
- **Targets Screen** - Discover and manage targets
- **Campaigns Screen** - Create and monitor campaigns
- **Settings Screen** - Server config, theme, logout

### **✅ All Features Working**
- **Authentication** - Login, logout, session management
- **Real-time Updates** - Live data refresh and monitoring
- **Offline Support** - Cached data and offline queue
- **Error Handling** - Comprehensive error management
- **Network Status** - Connection monitoring
- **Data Persistence** - Settings and preferences storage

## 🖥️ **Server Features**

### **✅ All Endpoints Working**
- **Authentication** - `/admin/login`, `/admin/logout`
- **Dashboard** - `/admin/dashboard`, `/admin/stats`
- **Bot Management** - `/admin/bots`, `/admin/bots/{id}/terminate`
- **Command Execution** - `/admin/commands`
- **Payload Generation** - `/admin/payloads`
- **Target Discovery** - `/admin/targets`, `/admin/targets/discover`
- **Campaign Management** - `/admin/campaigns`
- **Task Management** - `/admin/tasks`
- **Exploit Management** - `/admin/exploits`
- **DuckDNS Integration** - `/admin/duckdns/update`, `/admin/duckdns/toggle`

### **✅ All Components Working**
- **Database** - SQLite with proper models and relationships
- **Authentication** - Secure session management
- **Background Tasks** - Automatic cleanup and monitoring
- **Target Discovery** - Multiple discovery methods
- **Payload Generation** - Multi-platform payload creation
- **Threat Intelligence** - Reputation checking
- **DuckDNS Integration** - Dynamic DNS updates

## 🧪 **Testing & Verification**

### **Run Complete System Test**
```bash
python test_complete_system.py
```

This will test:
- ✅ Server startup and connectivity
- ✅ All API endpoints
- ✅ Authentication flow
- ✅ Database functionality
- ✅ Mobile app dependencies
- ✅ File structure integrity
- ✅ Integration between components

### **Individual Component Tests**
```bash
# Test server only
python start_server.py

# Test mobile app only
cd phantomnet-mobile && npm start

# Test specific functionality
# (Use the mobile app to test all features)
```

## 🔧 **Troubleshooting**

### **Common Issues & Solutions**

1. **"Connection Failed"**
   - Ensure server is running: `python start_server.py`
   - Check server URL in mobile app settings
   - Verify SSL settings

2. **"Invalid Credentials"**
   - Use default: `wappafloppa` / `Stelz17@`
   - Check if admin user exists in database

3. **"Module Not Found"**
   - Run: `pip install -r phantomnet-c2/requirements.txt`
   - Check Python version (3.8+)

4. **"Mobile App Won't Load"**
   - Run: `cd phantomnet-mobile && npm install`
   - Check Node.js version (16+)
   - Ensure Expo Go is installed

5. **"Database Errors"**
   - Delete `phantomnet-c2/phantom_c2.db` to reset
   - Restart server to recreate database

## 📊 **System Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   C2 Server     │    │   Database      │
│                 │    │                 │    │                 │
│ • React Native  │◄──►│ • Flask API     │◄──►│ • SQLite        │
│ • Expo          │    │ • Authentication│    │ • Models        │
│ • TypeScript    │    │ • Bot Management│    │ • Relationships │
│ • Offline Cache │    │ • Payload Gen   │    │ • Data Storage  │
│ • Real-time UI  │    │ • Target Disc   │    │ • Session Mgmt  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 **Security Notes**

- **Development**: Uses self-signed SSL certificates
- **Production**: Use proper SSL certificates and change default credentials
- **Network**: Ensure secure network connections in production
- **Authentication**: Strong session management with token expiration

## 📞 **Support**

If you encounter any issues:

1. **Run the setup script**: `python setup_and_verify.py`
2. **Run the test script**: `python test_complete_system.py`
3. **Check the logs**: Server logs in `phantomnet.log`
4. **Verify dependencies**: Ensure all packages are installed
5. **Check network**: Ensure server and mobile device are on same network

## 🎯 **What's Next**

The system is now **100% functional** and ready for:

1. **Immediate Use** - Login and start using all features
2. **Customization** - Modify payloads, targets, campaigns
3. **Production Deployment** - Use proper SSL and credentials
4. **Advanced Features** - Add custom exploits and modules
5. **Integration** - Connect with other security tools

## 🏆 **Success Confirmation**

✅ **Server**: All endpoints working, authentication functional  
✅ **Mobile App**: All screens working, navigation functional  
✅ **Integration**: Seamless communication between components  
✅ **Database**: All models working, data persistence functional  
✅ **Authentication**: Login/logout working, session management functional  
✅ **Real-time**: Live updates working, monitoring functional  
✅ **Offline**: Cached data working, offline queue functional  
✅ **Error Handling**: Comprehensive error management functional  

**🎉 THE ENTIRE SYSTEM IS FULLY FUNCTIONAL AND READY TO USE! 🎉**
