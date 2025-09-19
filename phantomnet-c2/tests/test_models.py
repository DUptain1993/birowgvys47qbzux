"""
Tests for database models
"""

import pytest
from datetime import datetime
from phantomnet.models import db, Bot, Command, Admin, Payload, Target, Campaign


class TestBotModel:
    """Test Bot model functionality"""
    
    def test_create_bot(self, app, sample_bot_data):
        """Test creating a bot"""
        with app.app_context():
            bot = Bot(
                id='test-bot-123',
                ip_address='192.168.1.100',
                hostname=sample_bot_data['hostname'],
                os_info=sample_bot_data['os_info'],
                username=sample_bot_data['username'],
                capabilities=str(sample_bot_data['capabilities']),
                session_token='test-session-token'
            )
            
            db.session.add(bot)
            db.session.commit()
            
            # Verify bot was created
            retrieved_bot = Bot.query.get('test-bot-123')
            assert retrieved_bot is not None
            assert retrieved_bot.hostname == 'test-bot'
            assert retrieved_bot.os_info == 'Windows 10'
            assert retrieved_bot.username == 'testuser'
    
    def test_bot_relationships(self, app):
        """Test bot relationships with commands"""
        with app.app_context():
            # Create bot
            bot = Bot(
                id='test-bot-456',
                hostname='test-bot-2',
                session_token='test-token'
            )
            db.session.add(bot)
            db.session.commit()
            
            # Create command for bot
            command = Command(
                id='test-command-123',
                bot_id='test-bot-456',
                command='system_info',
                args='{"detailed": true}',
                status='pending'
            )
            db.session.add(command)
            db.session.commit()
            
            # Test relationship
            assert len(bot.commands) == 1
            assert bot.commands[0].command == 'system_info'


class TestCommandModel:
    """Test Command model functionality"""
    
    def test_create_command(self, app, sample_command_data):
        """Test creating a command"""
        with app.app_context():
            command = Command(
                id='test-command-456',
                bot_id='test-bot-123',
                command=sample_command_data['command'],
                args=str(sample_command_data['args']),
                status='pending'
            )
            
            db.session.add(command)
            db.session.commit()
            
            # Verify command was created
            retrieved_command = Command.query.get('test-command-456')
            assert retrieved_command is not None
            assert retrieved_command.command == 'system_info'
            assert retrieved_command.status == 'pending'
    
    def test_command_status_update(self, app):
        """Test updating command status"""
        with app.app_context():
            command = Command(
                id='test-command-789',
                bot_id='test-bot-123',
                command='test_command',
                status='pending'
            )
            db.session.add(command)
            db.session.commit()
            
            # Update status
            command.status = 'completed'
            command.result = 'Command executed successfully'
            db.session.commit()
            
            # Verify update
            updated_command = Command.query.get('test-command-789')
            assert updated_command.status == 'completed'
            assert updated_command.result == 'Command executed successfully'


class TestAdminModel:
    """Test Admin model functionality"""
    
    def test_create_admin(self, app):
        """Test creating an admin user"""
        with app.app_context():
            from werkzeug.security import generate_password_hash
            
            admin = Admin(
                username='testadmin',
                password_hash=generate_password_hash('testpassword'),
                email='test@example.com'
            )
            
            db.session.add(admin)
            db.session.commit()
            
            # Verify admin was created
            retrieved_admin = Admin.query.filter_by(username='testadmin').first()
            assert retrieved_admin is not None
            assert retrieved_admin.email == 'test@example.com'
    
    def test_admin_password_verification(self, app):
        """Test admin password verification"""
        with app.app_context():
            from werkzeug.security import generate_password_hash, check_password_hash
            
            password = 'testpassword123'
            admin = Admin(
                username='testadmin2',
                password_hash=generate_password_hash(password),
                email='test2@example.com'
            )
            
            db.session.add(admin)
            db.session.commit()
            
            # Test password verification
            retrieved_admin = Admin.query.filter_by(username='testadmin2').first()
            assert check_password_hash(retrieved_admin.password_hash, password)
            assert not check_password_hash(retrieved_admin.password_hash, 'wrongpassword')


class TestPayloadModel:
    """Test Payload model functionality"""
    
    def test_create_payload(self, app, sample_payload_data):
        """Test creating a payload"""
        with app.app_context():
            payload = Payload(
                name=sample_payload_data['name'],
                payload_type=sample_payload_data['payload_type'],
                platform=sample_payload_data['platform'],
                architecture=sample_payload_data['architecture'],
                payload_data=b'test payload data',
                encryption_key='test-encryption-key'
            )
            
            db.session.add(payload)
            db.session.commit()
            
            # Verify payload was created
            retrieved_payload = Payload.query.filter_by(name='test-payload').first()
            assert retrieved_payload is not None
            assert retrieved_payload.platform == 'windows'
            assert retrieved_payload.architecture == 'x64'
            assert retrieved_payload.payload_data == b'test payload data'


class TestTargetModel:
    """Test Target model functionality"""
    
    def test_create_target(self, app):
        """Test creating a target"""
        with app.app_context():
            target = Target(
                ip_address='192.168.1.200',
                hostname='target.example.com',
                os_info='Linux Ubuntu 20.04',
                open_ports='[22, 80, 443]',
                status='discovered'
            )
            
            db.session.add(target)
            db.session.commit()
            
            # Verify target was created
            retrieved_target = Target.query.filter_by(ip_address='192.168.1.200').first()
            assert retrieved_target is not None
            assert retrieved_target.hostname == 'target.example.com'
            assert retrieved_target.status == 'discovered'


class TestCampaignModel:
    """Test Campaign model functionality"""
    
    def test_create_campaign(self, app):
        """Test creating a campaign"""
        with app.app_context():
            campaign = Campaign(
                name='test-campaign',
                description='Test campaign for unit testing',
                target_criteria='{"os": "windows"}',
                status='active'
            )
            
            db.session.add(campaign)
            db.session.commit()
            
            # Verify campaign was created
            retrieved_campaign = Campaign.query.filter_by(name='test-campaign').first()
            assert retrieved_campaign is not None
            assert retrieved_campaign.description == 'Test campaign for unit testing'
            assert retrieved_campaign.status == 'active'
