"""
Test configuration and fixtures for PhantomNet C2 Server
"""

import pytest
import tempfile
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from phantomnet.config import TestingConfig
from phantomnet.app import create_app
from phantomnet.models import db


@pytest.fixture
def app():
    """Create and configure a test Flask application"""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client for the Flask application"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """Create a test CLI runner for the Flask application"""
    return app.test_cli_runner()


@pytest.fixture
def temp_db():
    """Create a temporary database for testing"""
    db_fd, db_path = tempfile.mkstemp()
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'
    
    yield db_path
    
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def sample_bot_data():
    """Sample bot data for testing"""
    return {
        'hostname': 'test-bot',
        'os_info': 'Windows 10',
        'username': 'testuser',
        'capabilities': {
            'system_info': True,
            'network_scan': True,
            'process_list': True
        }
    }


@pytest.fixture
def sample_command_data():
    """Sample command data for testing"""
    return {
        'command': 'system_info',
        'args': {'detailed': True}
    }


@pytest.fixture
def sample_payload_data():
    """Sample payload data for testing"""
    return {
        'name': 'test-payload',
        'platform': 'windows',
        'architecture': 'x64',
        'payload_type': 'exe'
    }
