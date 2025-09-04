#!/usr/bin/env python3
'''
Payment Processing System - Handle client payments
Supports: Razorpay, Bank Transfer, UPI
'''

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
import hashlib
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PaymentProcessor:
    def __init__(self):
        self.db_path = 'data/payments.db'
        self.init_database()
        
        # Payment gateway configuration
        self.payment_methods = {
            'razorpay': {
                'enabled': True,
                'key_id': os.getenv('RAZORPAY_KEY_ID', ''),
                'key_secret': os.getenv('RAZORPAY_KEY_SECRET', '')
            },
            'bank_transfer': {
                'enabled': True,
                'account_name': 'TREUM ALGOTECH (OPC) PRIVATE LIMITED',
                'account_number': 'XXXXXXXXXX',
                'ifsc': 'ICIC0000267',
                'bank_name': 'ICICI Bank'
            },
            'upi': {
                'enabled': True,
                'upi_id': 'treumAlgotech@icici'
            }
        }
    
    def init_database(self):
        os.makedirs('data', exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Payments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                payment_id TEXT UNIQUE,
                client_id INTEGER,
                amount INTEGER,
                currency TEXT DEFAULT 'INR',
                method TEXT,
                status TEXT DEFAULT 'pending',
                description TEXT,
                invoice_id INTEGER,
                transaction_ref TEXT,
                payment_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Payment links table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS payment_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                link_id TEXT UNIQUE,
                client_id INTEGER,
                amount INTEGER,
                description TEXT,
                status TEXT DEFAULT 'active',
                expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_payment_id(self) -> str:
        '''Generate unique payment ID'''
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_str = os.urandom(4).hex()
        return f'PAY_{timestamp}_{random_str}'
    
    def create_payment_link(self, client_id: int, amount: int, description: str) -> Dict:
        '''Create payment link for client'''
        link_id = f'LINK_{self.generate_payment_id()}'
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO payment_links (link_id, client_id, amount, description, expires_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            link_id,
            client_id,
            amount,
            description,
            (datetime.now() + timedelta(days=7))  # Expires in 7 days
        ))
        
        conn.commit()
        conn.close()
        
        # Generate payment link
        payment_link = {
            'link_id': link_id,
            'amount': amount,
            'description': description,
            'payment_url': f'https://treumAlgotech.com/pay/{link_id}',
            'upi_link': f'upi://pay?pa={self.payment_methods["upi"]["upi_id"]}&pn=TreumAlgotech&am={amount}&cu=INR&tn={description}',
            'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        logger.info(f'Payment link created: {link_id} for ₹{amount}')
        return payment_link
    
    def record_payment(self, payment_data: Dict) -> str:
        '''Record a payment'''
        payment_id = self.generate_payment_id()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO payments (payment_id, client_id, amount, method, 
                                 status, description, invoice_id, transaction_ref)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            payment_id,
            payment_data['client_id'],
            payment_data['amount'],
            payment_data.get('method', 'bank_transfer'),
            payment_data.get('status', 'pending'),
            payment_data.get('description', ''),
            payment_data.get('invoice_id'),
            payment_data.get('transaction_ref', '')
        ))
        
        conn.commit()
        conn.close()
        
        logger.info(f'Payment recorded: {payment_id} for ₹{payment_data["amount"]}')
        return payment_id
    
    def confirm_payment(self, payment_id: str, transaction_ref: str):
        '''Confirm a payment'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE payments 
            SET status = 'completed', 
                transaction_ref = ?,
                payment_date = ?
            WHERE payment_id = ?
        ''', (transaction_ref, datetime.now(), payment_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f'Payment confirmed: {payment_id}')
    
    def get_pending_payments(self) -> List[Dict]:
        '''Get all pending payments'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT payment_id, client_id, amount, description, created_at
            FROM payments
            WHERE status = 'pending'
            ORDER BY created_at DESC
        ''')
        
        payments = []
        for row in cursor.fetchall():
            payments.append({
                'payment_id': row[0],
                'client_id': row[1],
                'amount': row[2],
                'description': row[3],
                'created_at': row[4]
            })
        
        conn.close()
        return payments
    
    def calculate_revenue(self, start_date: datetime = None, end_date: datetime = None) -> Dict:
        '''Calculate revenue for period'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if not start_date:
            start_date = datetime.now().replace(day=1)  # Start of month
        if not end_date:
            end_date = datetime.now()
        
        cursor.execute('''
            SELECT SUM(amount), COUNT(*)
            FROM payments
            WHERE status = 'completed'
            AND payment_date >= ? AND payment_date <= ?
        ''', (start_date, end_date))
        
        total_revenue, payment_count = cursor.fetchone()
        
        conn.close()
        
        return {
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'total_revenue': total_revenue if total_revenue else 0,
            'payment_count': payment_count if payment_count else 0,
            'average_payment': (total_revenue / payment_count) if payment_count else 0
        }
    
    def generate_bank_details(self) -> str:
        '''Generate bank transfer instructions'''
        bank = self.payment_methods['bank_transfer']
        
        return f'''
BANK TRANSFER DETAILS
=====================
Account Name: {bank['account_name']}
Account Number: {bank['account_number']}
IFSC Code: {bank['ifsc']}
Bank Name: {bank['bank_name']}

UPI Payment:
============
UPI ID: {self.payment_methods['upi']['upi_id']}

Please mention your company name in the transaction description.
Send payment confirmation to: srijanaryay@gmail.com
'''

if __name__ == '__main__':
    processor = PaymentProcessor()
    
    # Example: Create payment link
    link = processor.create_payment_link(
        client_id=1,
        amount=3000,
        description='Monthly subscription - Starter Package'
    )
    print(f'Payment Link: {link["payment_url"]}')
    print(f'UPI Link: {link["upi_link"]}')
