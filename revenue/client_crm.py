#!/usr/bin/env python3
'''
Client CRM System - Track clients, deliverables, and relationships
'''

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ClientCRM:
    def __init__(self):
        self.db_path = 'data/crm.db'
        self.init_database()
        
    def init_database(self):
        os.makedirs('data', exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Clients table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS clients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                contact_name TEXT,
                email TEXT,
                phone TEXT,
                package TEXT,
                monthly_fee INTEGER,
                status TEXT DEFAULT 'active',
                start_date DATE,
                next_billing DATE,
                total_paid INTEGER DEFAULT 0,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Deliverables table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS deliverables (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER,
                type TEXT,
                title TEXT,
                content TEXT,
                status TEXT DEFAULT 'pending',
                due_date DATE,
                delivered_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        ''')
        
        # Communications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS communications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id INTEGER,
                type TEXT,
                subject TEXT,
                content TEXT,
                direction TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def add_client(self, client_data: Dict) -> int:
        '''Add new client to CRM'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO clients (company_name, contact_name, email, phone, 
                               package, monthly_fee, start_date, next_billing)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            client_data['company_name'],
            client_data.get('contact_name', ''),
            client_data.get('email', ''),
            client_data.get('phone', ''),
            client_data.get('package', 'Starter'),
            client_data.get('monthly_fee', 3000),
            datetime.now().date(),
            (datetime.now() + timedelta(days=30)).date()
        ))
        
        client_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"Added client: {client_data['company_name']} (ID: {client_id})")
        return client_id
    
    def get_client(self, client_id: int) -> Optional[Dict]:
        '''Get client details'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM clients WHERE id = ?', (client_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'id': row[0],
                'company_name': row[1],
                'contact_name': row[2],
                'email': row[3],
                'phone': row[4],
                'package': row[5],
                'monthly_fee': row[6],
                'status': row[7],
                'start_date': row[8],
                'next_billing': row[9],
                'total_paid': row[10]
            }
        return None
    
    def list_active_clients(self) -> List[Dict]:
        '''List all active clients'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, company_name, package, monthly_fee, next_billing
            FROM clients
            WHERE status = 'active'
            ORDER BY company_name
        ''')
        
        clients = []
        for row in cursor.fetchall():
            clients.append({
                'id': row[0],
                'company_name': row[1],
                'package': row[2],
                'monthly_fee': row[3],
                'next_billing': row[4]
            })
        
        conn.close()
        return clients
    
    def add_deliverable(self, client_id: int, deliverable: Dict) -> int:
        '''Add deliverable for client'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO deliverables (client_id, type, title, content, due_date)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            client_id,
            deliverable['type'],
            deliverable['title'],
            deliverable.get('content', ''),
            deliverable.get('due_date', (datetime.now() + timedelta(days=1)).date())
        ))
        
        deliverable_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return deliverable_id
    
    def mark_delivered(self, deliverable_id: int):
        '''Mark deliverable as delivered'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE deliverables 
            SET status = 'delivered', delivered_date = ?
            WHERE id = ?
        ''', (datetime.now().date(), deliverable_id))
        
        conn.commit()
        conn.close()
    
    def get_pending_deliverables(self) -> List[Dict]:
        '''Get all pending deliverables'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT d.id, d.title, d.type, d.due_date, c.company_name
            FROM deliverables d
            JOIN clients c ON d.client_id = c.id
            WHERE d.status = 'pending'
            ORDER BY d.due_date
        ''')
        
        deliverables = []
        for row in cursor.fetchall():
            deliverables.append({
                'id': row[0],
                'title': row[1],
                'type': row[2],
                'due_date': row[3],
                'client': row[4]
            })
        
        conn.close()
        return deliverables
    
    def calculate_mrr(self) -> int:
        '''Calculate Monthly Recurring Revenue'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT SUM(monthly_fee)
            FROM clients
            WHERE status = 'active'
        ''')
        
        result = cursor.fetchone()[0]
        conn.close()
        
        return result if result else 0
    
    def generate_client_report(self, client_id: int) -> Dict:
        '''Generate client performance report'''
        client = self.get_client(client_id)
        if not client:
            return {}
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get deliverables count
        cursor.execute('''
            SELECT COUNT(*), 
                   SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)
            FROM deliverables
            WHERE client_id = ?
        ''', (client_id,))
        
        total_deliverables, delivered = cursor.fetchone()
        
        conn.close()
        
        return {
            'client': client['company_name'],
            'package': client['package'],
            'monthly_fee': client['monthly_fee'],
            'total_deliverables': total_deliverables,
            'delivered': delivered,
            'delivery_rate': (delivered / total_deliverables * 100) if total_deliverables > 0 else 0,
            'total_paid': client['total_paid'],
            'next_billing': client['next_billing']
        }

if __name__ == '__main__':
    crm = ClientCRM()
    
    # Example usage
    print(f'Current MRR: ₹{crm.calculate_mrr()}')
    print(f'Active Clients: {len(crm.list_active_clients())}')
