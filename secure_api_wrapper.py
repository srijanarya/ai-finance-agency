#!/usr/bin/env python3
"""
Secure API Wrapper with JWT Authentication and HTTPS
Provides security layer for all dashboard APIs
"""

import os
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.security import check_password_hash, generate_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SecureAPIWrapper:
    def __init__(self, app: Flask = None):
        self.app = app
        self.jwt = None
        self.limiter = None
        self.talisman = None
        
        # Generate secure secret key if not exists
        self.jwt_secret = os.environ.get('JWT_SECRET_KEY') or secrets.token_urlsafe(32)
        
        # Store users (in production, use database)
        self.users = {
            'admin': generate_password_hash('admin_password_change_me'),
            'user': generate_password_hash('user_password_change_me')
        }
        
        if app:
            self.init_app(app)
    
    def init_app(self, app: Flask):
        """Initialize security features for Flask app"""
        self.app = app
        
        # JWT Configuration
        app.config['JWT_SECRET_KEY'] = self.jwt_secret
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
        app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
        app.config['JWT_COOKIE_SECURE'] = True  # Only send cookie over HTTPS
        app.config['JWT_COOKIE_CSRF_PROTECT'] = True
        
        self.jwt = JWTManager(app)
        
        # Rate Limiting
        self.limiter = Limiter(
            app=app,
            key_func=get_remote_address,
            default_limits=["200 per day", "50 per hour"],
            storage_uri="redis://localhost:6379"
        )
        
        # HTTPS enforcement (disable in development)
        if os.environ.get('FLASK_ENV') != 'development':
            self.talisman = Talisman(
                app,
                force_https=True,
                strict_transport_security=True,
                strict_transport_security_max_age=31536000,
                session_cookie_secure=True,
                session_cookie_http_only=True,
                content_security_policy={
                    'default-src': "'self'",
                    'script-src': "'self' 'unsafe-inline'",
                    'style-src': "'self' 'unsafe-inline'",
                    'img-src': "'self' data:",
                    'font-src': "'self'"
                }
            )
        
        # Add security headers
        @app.after_request
        def add_security_headers(response):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
            return response
        
        # Register authentication endpoints
        self.register_auth_routes()
        
        logger.info("Security features initialized")
    
    def register_auth_routes(self):
        """Register authentication endpoints"""
        
        @self.app.route('/api/auth/login', methods=['POST'])
        @self.limiter.limit("5 per minute")
        def login():
            """Login endpoint"""
            data = request.get_json()
            
            if not data or not data.get('username') or not data.get('password'):
                return jsonify({'msg': 'Missing username or password'}), 400
            
            username = data['username']
            password = data['password']
            
            # Verify credentials
            if username not in self.users:
                return jsonify({'msg': 'Invalid credentials'}), 401
            
            if not check_password_hash(self.users[username], password):
                return jsonify({'msg': 'Invalid credentials'}), 401
            
            # Create JWT token
            access_token = create_access_token(
                identity=username,
                additional_claims={
                    'role': 'admin' if username == 'admin' else 'user',
                    'timestamp': datetime.utcnow().isoformat()
                }
            )
            
            return jsonify({
                'access_token': access_token,
                'user': username,
                'expires_in': 86400  # 24 hours in seconds
            }), 200
        
        @self.app.route('/api/auth/refresh', methods=['POST'])
        @jwt_required()
        def refresh():
            """Refresh token endpoint"""
            current_user = get_jwt_identity()
            new_token = create_access_token(identity=current_user)
            return jsonify({'access_token': new_token}), 200
        
        @self.app.route('/api/auth/verify', methods=['GET'])
        @jwt_required()
        def verify():
            """Verify token endpoint"""
            current_user = get_jwt_identity()
            return jsonify({'valid': True, 'user': current_user}), 200
        
        @self.app.route('/api/auth/logout', methods=['POST'])
        @jwt_required()
        def logout():
            """Logout endpoint (client should remove token)"""
            return jsonify({'msg': 'Successfully logged out'}), 200
    
    def require_auth(self, f):
        """Decorator to require authentication"""
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    
    def require_admin(self, f):
        """Decorator to require admin role"""
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user = get_jwt_identity()
            if current_user != 'admin':
                return jsonify({'msg': 'Admin access required'}), 403
            return f(*args, **kwargs)
        return decorated_function

def add_security_to_app(app: Flask):
    """Helper function to add security to existing Flask app"""
    security = SecureAPIWrapper(app)
    return security

# Middleware for CORS (if needed for frontend)
def add_cors_support(app: Flask):
    """Add CORS support for frontend access"""
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin and origin in ['http://localhost:3000', 'http://localhost:5173']:
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

# Example usage for protecting routes
def protect_routes(app: Flask):
    """Example of protecting existing routes"""
    security = SecureAPIWrapper(app)
    
    # Protect specific routes
    @app.route('/api/protected/data')
    @security.require_auth
    def protected_data():
        current_user = get_jwt_identity()
        return jsonify({'data': 'secret', 'user': current_user})
    
    @app.route('/api/admin/settings')
    @security.require_admin
    def admin_settings():
        return jsonify({'settings': 'admin only'})
    
    return security

# Create standalone secure API server
def create_secure_api_server():
    """Create a standalone secure API gateway"""
    app = Flask(__name__)
    
    # Initialize security
    security = SecureAPIWrapper(app)
    
    # Add CORS support
    add_cors_support(app)
    
    # Health check endpoint (no auth required)
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})
    
    # Protected API endpoints
    @app.route('/api/dashboards/status')
    @security.require_auth
    def dashboards_status():
        """Get status of all dashboards"""
        from dashboard_manager import DashboardManager
        manager = DashboardManager()
        return jsonify(manager.status())
    
    @app.route('/api/dashboards/health')
    @security.require_auth
    def dashboards_health():
        """Get health check of all dashboards"""
        from dashboard_manager import DashboardManager
        manager = DashboardManager()
        return jsonify(manager.health_check())
    
    @app.route('/api/dashboards/start', methods=['POST'])
    @security.require_admin
    def start_dashboards():
        """Start dashboard services (admin only)"""
        from dashboard_manager import DashboardManager
        manager = DashboardManager()
        
        data = request.get_json()
        service_id = data.get('service') if data else None
        
        if service_id:
            success = manager.start_service(service_id)
            return jsonify({'success': success, 'service': service_id})
        else:
            count = manager.start_all()
            return jsonify({'success': count > 0, 'started': count})
    
    @app.route('/api/dashboards/stop', methods=['POST'])
    @security.require_admin
    def stop_dashboards():
        """Stop dashboard services (admin only)"""
        from dashboard_manager import DashboardManager
        manager = DashboardManager()
        
        data = request.get_json()
        service_id = data.get('service') if data else None
        
        if service_id:
            success = manager.stop_service(service_id)
            return jsonify({'success': success, 'service': service_id})
        else:
            manager.stop_all()
            return jsonify({'success': True})
    
    @app.route('/api/dashboards/restart', methods=['POST'])
    @security.require_admin
    def restart_dashboards():
        """Restart dashboard services (admin only)"""
        from dashboard_manager import DashboardManager
        manager = DashboardManager()
        
        data = request.get_json()
        service_id = data.get('service') if data else None
        
        if service_id:
            success = manager.restart_service(service_id)
            return jsonify({'success': success, 'service': service_id})
        else:
            count = manager.restart_all()
            return jsonify({'success': count > 0, 'restarted': count})
    
    return app

if __name__ == "__main__":
    # Run secure API gateway
    app = create_secure_api_server()
    
    print("\n" + "="*60)
    print("🔒 SECURE API GATEWAY")
    print("="*60)
    print("\nSecurity Features:")
    print("✅ JWT Authentication")
    print("✅ Rate Limiting")
    print("✅ HTTPS Enforcement (production)")
    print("✅ Security Headers")
    print("✅ CORS Support")
    print("\nDefault Credentials (CHANGE THESE!):")
    print("  Username: admin")
    print("  Password: admin_password_change_me")
    print("\nAPI Endpoints:")
    print("  POST /api/auth/login - Login")
    print("  GET  /api/dashboards/status - Dashboard status")
    print("  GET  /api/dashboards/health - Health check")
    print("  POST /api/dashboards/start - Start services (admin)")
    print("  POST /api/dashboards/stop - Stop services (admin)")
    print("\n" + "="*60)
    
    port = int(os.environ.get('API_GATEWAY_PORT', 5555))
    app.run(debug=False, host='0.0.0.0', port=port)