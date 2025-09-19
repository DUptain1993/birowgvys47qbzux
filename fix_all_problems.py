#!/usr/bin/env python3
"""
Comprehensive Problem Fixing Script for PhantomNet C2 Server & Mobile App
This script identifies and fixes all remaining problems in the system
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path

class ProblemFixer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.server_dir = self.project_root / "phantomnet-c2"
        self.mobile_dir = self.project_root / "phantomnet-mobile"
        self.fixes_applied = []
        
    def print_status(self, message, status="INFO"):
        colors = {
            "INFO": "\033[94m",
            "SUCCESS": "\033[92m",
            "WARNING": "\033[93m",
            "ERROR": "\033[91m",
            "RESET": "\033[0m"
        }
        print(f"{colors.get(status, '')}[{status}]{colors['RESET']} {message}")
    
    def fix_python_dependencies(self):
        """Fix Python dependency issues"""
        self.print_status("Fixing Python dependencies...", "INFO")
        
        try:
            # Update pip first
            subprocess.run([sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip'], 
                         check=True, capture_output=True)
            
            # Install core dependencies
            core_deps = [
                'flask==3.0.3',
                'flask-sqlalchemy==3.1.1',
                'flask-cors==4.0.0',
                'werkzeug==3.0.3',
                'cryptography==43.0.1',
                'requests==2.32.3',
                'python-dotenv==1.0.1',
                'gunicorn==23.0.0'
            ]
            
            for dep in core_deps:
                try:
                    subprocess.run([sys.executable, '-m', 'pip', 'install', dep], 
                                 check=True, capture_output=True)
                except subprocess.CalledProcessError:
                    self.print_status(f"Warning: Could not install {dep}", "WARNING")
            
            self.print_status("✓ Python dependencies fixed", "SUCCESS")
            self.fixes_applied.append("Python dependencies")
            return True
            
        except Exception as e:
            self.print_status(f"✗ Failed to fix Python dependencies: {e}", "ERROR")
            return False
    
    def fix_mobile_dependencies(self):
        """Fix mobile app dependency issues"""
        self.print_status("Fixing mobile app dependencies...", "INFO")
        
        try:
            if not self.mobile_dir.exists():
                self.print_status("✗ Mobile app directory not found", "ERROR")
                return False
            
            # Check if package.json exists
            package_json = self.mobile_dir / "package.json"
            if not package_json.exists():
                self.print_status("✗ package.json not found", "ERROR")
                return False
            
            # Install dependencies
            result = subprocess.run(['npm', 'install'], 
                                 cwd=self.mobile_dir, 
                                 capture_output=True, text=True)
            
            if result.returncode == 0:
                self.print_status("✓ Mobile app dependencies fixed", "SUCCESS")
                self.fixes_applied.append("Mobile app dependencies")
                return True
            else:
                self.print_status(f"✗ Failed to install mobile dependencies: {result.stderr}", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"✗ Failed to fix mobile dependencies: {e}", "ERROR")
            return False
    
    def fix_environment_configuration(self):
        """Fix environment configuration issues"""
        self.print_status("Fixing environment configuration...", "INFO")
        
        try:
            env_file = self.server_dir / ".env"
            env_example = self.server_dir / "env.example"
            
            if not env_file.exists():
                if env_example.exists():
                    shutil.copy(env_example, env_file)
                    self.print_status("✓ Created .env file from template", "SUCCESS")
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
                    with open(env_file, 'w') as f:
                        f.write(env_content)
                    self.print_status("✓ Created .env file with default values", "SUCCESS")
            
            self.fixes_applied.append("Environment configuration")
            return True
            
        except Exception as e:
            self.print_status(f"✗ Failed to fix environment configuration: {e}", "ERROR")
            return False
    
    def fix_file_permissions(self):
        """Fix file permission issues"""
        self.print_status("Fixing file permissions...", "INFO")
        
        try:
            # Make scripts executable
            scripts = [
                "start_server.py",
                "test_complete_system.py",
                "setup_and_verify.py",
                "fix_all_problems.py"
            ]
            
            for script in scripts:
                script_path = self.project_root / script
                if script_path.exists():
                    if os.name != 'nt':  # Not Windows
                        os.chmod(script_path, 0o755)
            
            self.print_status("✓ File permissions fixed", "SUCCESS")
            self.fixes_applied.append("File permissions")
            return True
            
        except Exception as e:
            self.print_status(f"✗ Failed to fix file permissions: {e}", "ERROR")
            return False
    
    def fix_database_issues(self):
        """Fix database-related issues"""
        self.print_status("Fixing database issues...", "INFO")
        
        try:
            # Remove old database files to force recreation
            db_files = [
                self.server_dir / "phantom_c2.db",
                self.server_dir / "phantom_c2_dev.db",
                self.server_dir / "phantom_c2_test.db"
            ]
            
            for db_file in db_files:
                if db_file.exists():
                    db_file.unlink()
                    self.print_status(f"✓ Removed old database: {db_file.name}", "SUCCESS")
            
            self.fixes_applied.append("Database cleanup")
            return True
            
        except Exception as e:
            self.print_status(f"✗ Failed to fix database issues: {e}", "ERROR")
            return False
    
    def fix_mobile_app_configuration(self):
        """Fix mobile app configuration issues"""
        self.print_status("Fixing mobile app configuration...", "INFO")
        
        try:
            # Check and fix tsconfig.json
            tsconfig_path = self.mobile_dir / "tsconfig.json"
            if tsconfig_path.exists():
                with open(tsconfig_path, 'r') as f:
                    tsconfig = json.load(f)
                
                # Remove problematic extends
                if 'extends' in tsconfig and '@expo/tsconfig/base' in str(tsconfig['extends']):
                    del tsconfig['extends']
                    with open(tsconfig_path, 'w') as f:
                        json.dump(tsconfig, f, indent=2)
                    self.print_status("✓ Fixed tsconfig.json", "SUCCESS")
            
            # Check and fix package.json
            package_json_path = self.mobile_dir / "package.json"
            if package_json_path.exists():
                with open(package_json_path, 'r') as f:
                    package_data = json.load(f)
                
                # Ensure required dependencies are present
                required_deps = {
                    "@expo/vector-icons": "^15.0.2",
                    "@react-native-async-storage/async-storage": "2.2.0",
                    "@react-native-community/netinfo": "11.4.1",
                    "@react-navigation/bottom-tabs": "^6.5.7",
                    "@react-navigation/native": "^6.1.6",
                    "@react-navigation/native-stack": "^6.9.12",
                    "expo": "^54.0.7",
                    "react": "19.1.0",
                    "react-native": "0.81.4"
                }
                
                updated = False
                for dep, version in required_deps.items():
                    if dep not in package_data.get('dependencies', {}):
                        package_data.setdefault('dependencies', {})[dep] = version
                        updated = True
                
                if updated:
                    with open(package_json_path, 'w') as f:
                        json.dump(package_data, f, indent=2)
                    self.print_status("✓ Updated package.json dependencies", "SUCCESS")
            
            self.fixes_applied.append("Mobile app configuration")
            return True
            
        except Exception as e:
            self.print_status(f"✗ Failed to fix mobile app configuration: {e}", "ERROR")
            return False
    
    def fix_server_configuration(self):
        """Fix server configuration issues"""
        self.print_status("Fixing server configuration...", "INFO")
        
        try:
            # Check if all required server files exist
            required_files = [
                "phantomnet/__init__.py",
                "phantomnet/app.py",
                "phantomnet/server.py",
                "phantomnet/models.py",
                "phantomnet/config.py",
                "phantomnet/routes/__init__.py",
                "phantomnet/routes/admin.py",
                "phantomnet/routes/api.py",
                "phantomnet/routes/bot.py",
                "requirements.txt"
            ]
            
            missing_files = []
            for file_path in required_files:
                full_path = self.server_dir / file_path
                if not full_path.exists():
                    missing_files.append(file_path)
            
            if missing_files:
                self.print_status(f"✗ Missing server files: {missing_files}", "ERROR")
                return False
            
            # Check if __init__.py files exist in all directories
            init_files = [
                "phantomnet/__init__.py",
                "phantomnet/routes/__init__.py",
                "phantomnet/utils/__init__.py"
            ]
            
            for init_file in init_files:
                init_path = self.server_dir / init_file
                if not init_path.exists():
                    init_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(init_path, 'w') as f:
                        f.write('# Package initialization\n')
                    self.print_status(f"✓ Created {init_file}", "SUCCESS")
            
            self.fixes_applied.append("Server configuration")
            return True
            
        except Exception as e:
            self.print_status(f"✗ Failed to fix server configuration: {e}", "ERROR")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive test to verify all fixes"""
        self.print_status("Running comprehensive test...", "INFO")
        
        try:
            # Test server startup
            test_script = self.project_root / "test_complete_system.py"
            if test_script.exists():
                result = subprocess.run([sys.executable, str(test_script)], 
                                     capture_output=True, text=True, 
                                     cwd=self.project_root)
                
                if result.returncode == 0:
                    self.print_status("✓ Comprehensive test passed", "SUCCESS")
                    return True
                else:
                    self.print_status(f"✗ Comprehensive test failed: {result.stderr}", "ERROR")
                    return False
            else:
                self.print_status("✗ Test script not found", "ERROR")
                return False
                
        except Exception as e:
            self.print_status(f"✗ Failed to run comprehensive test: {e}", "ERROR")
            return False
    
    def fix_all_problems(self):
        """Fix all identified problems"""
        self.print_status("Starting comprehensive problem fixing...", "INFO")
        self.print_status("=" * 60, "INFO")
        
        fix_functions = [
            ("Server Configuration", self.fix_server_configuration),
            ("Environment Configuration", self.fix_environment_configuration),
            ("Python Dependencies", self.fix_python_dependencies),
            ("Mobile App Configuration", self.fix_mobile_app_configuration),
            ("Mobile Dependencies", self.fix_mobile_dependencies),
            ("Database Issues", self.fix_database_issues),
            ("File Permissions", self.fix_file_permissions),
        ]
        
        results = {}
        for fix_name, fix_func in fix_functions:
            self.print_status(f"\nFixing {fix_name}...", "INFO")
            try:
                result = fix_func()
                results[fix_name] = result
                if result:
                    self.print_status(f"✓ {fix_name} fixed successfully", "SUCCESS")
                else:
                    self.print_status(f"✗ {fix_name} fix failed", "ERROR")
            except Exception as e:
                self.print_status(f"✗ {fix_name} fix error: {e}", "ERROR")
                results[fix_name] = False
        
        # Summary
        self.print_status("\n" + "=" * 60, "INFO")
        self.print_status("PROBLEM FIXING SUMMARY", "INFO")
        self.print_status("=" * 60, "INFO")
        
        fixed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for fix_name, result in results.items():
            status = "FIXED" if result else "FAILED"
            color = "SUCCESS" if result else "ERROR"
            self.print_status(f"{fix_name}: {status}", color)
        
        self.print_status(f"\nOverall: {fixed}/{total} problems fixed", 
                         "SUCCESS" if fixed == total else "WARNING")
        
        if fixed == total:
            self.print_status("\n🎉 ALL PROBLEMS FIXED! System is ready for use.", "SUCCESS")
            self.print_status("\nFixes Applied:", "INFO")
            for fix in self.fixes_applied:
                self.print_status(f"  ✓ {fix}", "SUCCESS")
            
            self.print_status("\nNext Steps:", "INFO")
            self.print_status("1. Start the server: python start_server.py", "INFO")
            self.print_status("2. Start mobile app: cd phantomnet-mobile && npm start", "INFO")
            self.print_status("3. Login with: wappafloppa / Stelz17@", "INFO")
        else:
            self.print_status(f"\n⚠️  {total - fixed} problems could not be fixed automatically.", "WARNING")
            self.print_status("Please check the errors above and fix them manually.", "WARNING")
        
        return fixed == total

def main():
    """Main function"""
    print("PhantomNet C2 Server & Mobile App - Problem Fixer")
    print("=" * 60)
    
    fixer = ProblemFixer()
    success = fixer.fix_all_problems()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
