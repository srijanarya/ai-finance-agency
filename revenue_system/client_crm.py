#!/usr/bin/env python3
"""
Client CRM System for Treum Algotech
Manages client relationships and deliverables
"""

import json
import os
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClientCRM:
    def __init__(self):
        self.ist = pytz.timezone('Asia/Kolkata')
        self.clients = []
        self.load_clients()
    
    def load_clients(self):
        """Load existing clients from database"""
        if os.path.exists('data/clients/master_clients.json'):
            with open('data/clients/master_clients.json', 'r') as f:
                self.clients = json.load(f)
    
    def add_client(self, client_data: Dict) -> Dict:
        """Add new client to CRM"""
        
        client = {
            'client_id': self.generate_client_id(),
            'company': client_data['compa#!/usr/bin/env python3
""t_person': client_data['contact_person'],
            'email': client_data['email'],
            'phone': client_data.get('phone', ''),
            'package': client_data['package'],
           import pytz
f: datetime.now(self.ist).isoformat(),
            'status': 'active',
            'monthly_value': self.get_package_value(client_data['package']),
            'deliverables': self.setup_deliverables(client_data['package']),
            'notes': client_data.get('notes', ''),
            'created_at': datetime.now(self.ist).isoformat()
        }
        
        self.clients.append(client)
        self.save_clients()
        
        logger.info(f"Client added:                 self.clients = json.load(f)
    
    def generate_client_id(self) -> str:
        """Generate unique client ID"""
        timestamp = datetime.now(self.ist).strftime('%Y%m%d%H%M')
        return f'CLT-{timestamp}'
    
    def get_package_value(self, package: str) -> int:
        """Get monthly value for package"""
        values = {
            'starter': 3000,
            'growth': 7500,
            'enterprise': 15000
        }
        return values.get(package, 3000)
    
    def setup_deliverables(self, package: str) -> Dict:
        """Setup monthly deliverables based on package"""
        
        deliverables = {
            'starter': {
                'blog_posts': 4,
                'social_posts': 8,
                'reports': 1
            },
            'growth': {
                'blog_posts': 8,
                'social_posts': 20,
                'newsletters': 2,
                'reports': 2
            },
            'enterprise': {
                'blog_posts': 20,
                'social_posts': 'unlimited',
                'newsletters': 4,
                'whitepapers': 1,
                'reports': 4
            }
        }
        
        return deliverables.get(package, deliverables['starter'])
    
    def track_deliverable(self, client_id: str, deliverable_type: str, content: Dict):
        """Track completed deliverable for client"""
        
        for client in self.clients:
            if client['client_id'] == client_id:
                if 'delivered' not in client:
                    client['delivered'] = []
                
                client['delivered'].append({
                    'type': deliverable_type,
                    'title': content.get('title', ''),
                    'delivered_at': datetime.now(self.ist).isoformat(),
                    'content_id': content.get('id', '')
                })
                
                self.save_clients()
                logger.info(f"Deliverable tracked for {client['company']}")
                break
    
    def get_client_status(self, client_id: str) -> Dict:
        """Get client status and deliverables"""
        
        for client in self.clients:
            if client['client_id'] == client_id:
                delivered_count = len(client.get('delivered', []))
                expected = sum([v if isinstance(v, int) else 10 for v in client['deliverables'].values()])
                
                return {
                    'client': client['company'],
                    'status': client['status'],
                    'delivered': delivered_count,
                    'expected': expected,
                                   'title': content.get('tited)*100:.0f}%' if expected > 0 else '0%'
                }
        
        return None
    
    def get_active_clients(self) -> List[Dict]:
        """Get all active clients"""
        return [c for c in self.clients if c['status'] == 'active']
    
    def calculate_mrr(self) -> int:
        """Calculate Monthly Recurring Revenue"""
        return sum([c['monthly_value'] for c in self.clients if c['status'] == 'active'])
    
    def save_clients(self):
        """Save clients to database"""
        os.makedirs('data/clients', exist_ok=True)
        
        with open('data/clients/master_clients.json', 'w') as f:
            json.dump(self.clients, f, indent=2)

if __name__ == '__main__':
    crm = ClientCRM()
    
    # Example: Add a client
    new_client = crm.add_client({
        'company': 'XYZ Financial Services',
        'contact_person': 'Priya Sharma',
        'email': 'priya@xyzfinancial.com',
        'package': 'growth',
        'notes': 'Interested in crypto content'
    })
    
    print(f"Client added: {json.dumps(new_client, indent=2)}")
    print(f"Current MRR: ₹{crm.calculate_mrr()}")
