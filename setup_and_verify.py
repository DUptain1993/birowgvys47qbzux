#!/usr/bin/env python3
"""
Complete Setup and Verification Script for PhantomNet C2 Server & Mobile App
This script sets up everything and verifies the complete system works seamlessly
"""

import os
import sys
import time
import json
import subprocess
import platform
from pathlib import Path

class SystemSetup:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.server_dir = self.project_root / "phantomnet-c2"
        self.mobile_dir = self.project_root / "phantomnet-mobile"
        
    def print_status(self, message, status="INFO"):
        colors = {
            "INFO": "\033[94m",
            "SUCCESS": "\033[92m",
            "WARNING": "\033[93m",
            "ERROR": "\033[91m",
            "RESET": "\033[0m"
        }
        print(f"{colors.get(status, '')}[{status}]{colors['RESET']} {message}")
    
    def check_python_version(self):
        """Check if Python version is compatible"""
        self.print_status("Checking Python version...", "INFO")
        
        version = sys.version_info
        if version.major == 3 and version.minor >= 8:
            self.print_status(f"✓ Python {version.major}.{version.minor}.{version.micro} is compatible", "SUCCESS")
            return True
        else:
            self.print_status(f"✗ Python {version.major}.{version.minor}.{version.micro} is not compatible. Need Python 3.8+", "ERROR")
            return False
    
    def check_node_version(self):
        """Check if Node.js is installed and compatible"""
        self.print_status("Checking Node.js version...", "INFO")
        
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.strip()
                self.print_status(f"✓ Node.js {version} is installed", "SUCCESS")
                return True
            else:
                self.print_status("✗ Node.js is not installed", "ERROR")
                return False
        except FileNotFoundError:
            self.print_status("✗ Node.js is not installed", "ERROR")
            return False
    
    def install_python_dependencies(self):
        """Install Python dependencies"""
        self.print_status("Installing Python dependencies...", "INFO")
        
        requirements_file = self.server_dir / "requirements.txt"
        if not requirements_file.exists():
            self.print_status("✗ requirements.txt not found", "ERROR")
            return False
        
        try:
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'install', '-r', str(requirements_file)
            ], capture_output=True, text=True, cwd=self.project_root)
            
            if result.returncode == 0:
                self.print_status("✓ Python dependencies installed successfully", "SUCCESS")
                return True
            else:
                self.print_status(f"✗ Failed to install Python dependencies: {result.stderr}", "ERROR")
                return False
        except Exception as e:
            self.print_status(f"✗ Error installing Python dependencies: {e}", "ERROR")
            return False
    
    def install_mobile_dependencies(self):
        """Install mobile app dependencies"""
        self.print_status("Installing mobile app dependencies...", "INFO")
        
        if not self.mobile_dir.exists():
            self.print_status("✗ Mobile app directory not found", "ERROR")
            return False
        
        package_json = self.mobile_dir / "package.json"
        if not package_json.exists():
            self.print_status("✗ package.json not found", "ERROR")
            return False
        
        try:
            # Check if node_modules exists
            node_modules = self.mobile_dir / "node_modules"
            if node_modules.exists():
                self.print_status("✓ Mobile dependencies already installed", "SUCCESS")
                return True
            
            # Install dependencies
            result = subprocess.run(['npm', 'install'], 
                                 capture_output=True, text=True, 
                                 cwd=self.mobile_dir)
            
            if result.returncode == 0:
                self.print_status("✓ Mobile app dependencies installed successfully", "SUCCESS")
                return True
            else:
                self.print_status(f"✗ Failed to install mobile dependencies: {result.stderr}", "ERROR")
                return False
        except Exception as e:
            self.print_status(f"✗ Error installing mobile dependencies: {e}", "ERROR")
            return False
    
    def create_environment_file(self):
        """Create .env file if it doesn't exist"""
        self.print_status("Setting up environment configuration...", "INFO")
        
        env_file = self.server_dir / ".env"
        if env_file.exists():
            self.print_status("✓ .env file already exists", "SUCCESS")
            return True
        
        env_example = self.project_root / "phantomnet-c2" / "env.example"
        if env_example.exists():
            try:
                # Copy env.example to .env
                with open(env_example, 'r') as src, open(env_file, 'w') as dst:
                    dst.write(src.read())
                self.print_status("✓ .env file created from template", "SUCCESS")
                return True
            except Exception as e:
                self.print_status(f"✗ Failed to create .env file: {e}", "ERROR")
                return False
        else:
            # Create basic .env file
            env_content = """# PhantomNet C2 Server Environment Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///phantom_c2.db

# Server Configuration
HOST=0.0.0.0
PORT=8443

# API Keys (optional)
SHODAN_API_KEY=
CENSYS_API_ID=
CENSYS_API_SECRET=
VIRUSTOTAL_API_KEY=
ABUSEIPDB_API_KEY=
OTX_API_KEY=

# DuckDNS Configuration
DUCKDNS_DOMAIN=into-the-nothingnesssss.duckdns.org
DUCKDNS_TOKEN=d6d0b3fa-a957-47c5-ba7f-f17e668990cb
"""
            try:
                with open(env_file, 'w') as f:
                    f.write(env_content)
                self.print_status("✓ .env file created with default values", "SUCCESS")
                return True
            except Exception as e:
                self.print_status(f"✗ Failed to create .env file: {e}", "ERROR")
                return False
    
    def verify_file_structure(self):
        """Verify all required files exist"""
        self.print_status("Verifying file structure...", "INFO")
        
        required_files = [
            "phantomnet-c2/phantomnet/app.py",
            "phantomnet-c2/phantomnet/server.py",
            "phantomnet-c2/phantomnet/models.py",
            "phantomnet-c2/phantomnet/config.py",
            "phantomnet-c2/phantomnet/routes/api.py",
            "phantomnet-c2/phantomnet/routes/admin.py",
            "phantomnet-c2/phantomnet/routes/bot.py",
            "phantomnet-c2/requirements.txt",
            "phantomnet-mobile/App.tsx",
            "phantomnet-mobile/src/contexts/AuthContext.tsx",
            "phantomnet-mobile/src/navigation/AppNavigator.tsx",
            "phantomnet-mobile/src/services/api.ts",
            "phantomnet-mobile/src/screens/auth/LoginScreen.tsx",
            "phantomnet-mobile/package.json",
        ]
        
        missing_files = []
        for file_path in required_files:
            if not (self.project_root / file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            self.print_status(f"✗ Missing files: {missing_files}", "ERROR")
            return False
        else:
            self.print_status("✓ All required files exist", "SUCCESS")
            return True
    
    def run_system_test(self):
        """Run the comprehensive system test"""
        self.print_status("Running comprehensive system test...", "INFO")
        
        test_script = self.project_root / "test_complete_system.py"
        if not test_script.exists():
            self.print_status("✗ test_complete_system.py not found", "ERROR")
            return False
        
        try:
            result = subprocess.run([sys.executable, str(test_script)], 
                                 capture_output=True, text=True, 
                                 cwd=self.project_root)
            
            # Print the test output
            print(result.stdout)
            if result.stderr:
                print(result.stderr)
            
            return result.returncode == 0
        except Exception as e:
            self.print_status(f"✗ Error running system test: {e}", "ERROR")
            return False
    
    def setup_complete_system(self):
        """Setup the complete system"""
        self.print_status("Setting up PhantomNet C2 Server & Mobile App", "INFO")
        self.print_status("=" * 60, "INFO")
        
        setup_steps = [
            ("Python Version Check", self.check_python_version),
            ("Node.js Version Check", self.check_node_version),
            ("File Structure Verification", self.verify_file_structure),
            ("Environment Configuration", self.create_environment_file),
            ("Python Dependencies", self.install_python_dependencies),
            ("Mobile Dependencies", self.install_mobile_dependencies),
        ]
        
        results = {}
        for step_name, step_func in setup_steps:
            self.print_status(f"\n{step_name}...", "INFO")
            try:
                result = step_func()
                results[step_name] = result
                if result:
                    self.print_status(f"✓ {step_name} completed successfully", "SUCCESS")
                else:
                    self.print_status(f"✗ {step_name} failed", "ERROR")
            except Exception as e:
                self.print_status(f"✗ {step_name} error: {e}", "ERROR")
                results[step_name] = False
        
        # Check if all setup steps passed
        setup_success = all(results.values())
        
        if setup_success:
            self.print_status("\n" + "=" * 60, "INFO")
            self.print_status("SETUP COMPLETE - Running System Test", "SUCCESS")
            self.print_status("=" * 60, "INFO")
            
            # Run system test
            test_success = self.run_system_test()
            
            if test_success:
                self.print_status("\n🎉 COMPLETE SYSTEM SETUP SUCCESSFUL!", "SUCCESS")
                self.print_status("\nYour PhantomNet C2 Server & Mobile App is ready to use!", "SUCCESS")
                self.print_status("\nNext Steps:", "INFO")
                self.print_status("1. Start the server: python start_server.py", "INFO")
                self.print_status("2. Start mobile app: cd phantomnet-mobile && npm start", "INFO")
                self.print_status("3. Login with: wappafloppa / Stelz17@", "INFO")
                self.print_status("4. Server URL: https://localhost:8443", "INFO")
                return True
            else:
                self.print_status("\n⚠️  Setup completed but system test failed", "WARNING")
                self.print_status("Please check the test output above for issues", "WARNING")
                return False
        else:
            self.print_status("\n❌ SETUP FAILED", "ERROR")
            self.print_status("Please fix the issues above and run the setup again", "ERROR")
            return False

def main():
    """Main function"""
    print("PhantomNet C2 Server & Mobile App - Complete Setup")
    print("=" * 60)
    
    setup = SystemSetup()
    success = setup.setup_complete_system()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
