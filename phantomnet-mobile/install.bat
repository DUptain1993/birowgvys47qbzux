@echo off
echo 🚀 Installing PhantomNet Mobile App Dependencies...
echo =================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version

REM Clean node_modules if it exists
if exist "node_modules" (
    echo 🧹 Cleaning existing node_modules...
    rmdir /s /q node_modules
)

REM Clean package-lock.json if it exists
if exist "package-lock.json" (
    echo 🧹 Removing package-lock.json...
    del package-lock.json
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully!
    echo.
    echo 🎉 Setup Complete!
    echo ==================
    echo To start the development server:
    echo   npm start
    echo.
    echo Then scan the QR code with Expo Go app on your device.
    echo.
    echo Default server credentials:
    echo   URL: your-c2-server.com
    echo   Port: 8443
    echo   Username: admin
    echo   Password: phantom_admin_2024
) else (
    echo ❌ Failed to install dependencies. Please check the error messages above.
    pause
    exit /b 1
)

pause
