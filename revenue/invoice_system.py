#!/usr/bin/env python3
'''
Invoice System - Generate and manage invoices
'''

import sqlite3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
import logging
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InvoiceSystem:
    def __init__(self):
        self.db_path = 'data/invoices.db'
        self.init_database()
        
        # Company details
        self.company_details = {
            'name': 'TREUM ALGOTECH (OPC) PRIVATE LIMITED',
            'address': 'Tower-B, FT1 D, Western Express Highway',
            'city': 'Thakur Village, Kandivali East, Mumbai-400101',
            'gstin': '27AAJCT9389F1ZM',
            'pan': 'AAJCT9389F',
            'email': 'srijanaryay@gmail.com',
            'phone': '+91-XXXXXXXXXX'
        }
    
    def init_database(self):
        os.makedirs('data', exist_ok=True)
        os.makedirs('invoices', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE,
                client_id INTEGER,
                client_name TEXT,
                client_address TEXT,
                client_gstin TEXT,
                amount INTEGER,
                tax_amount INTEGER,
                total_amount INTEGER,
                description TEXT,
                status TEXT DEFAULT 'unpaid',
                issue_date DATE,
                due_date DATE,
                paid_date DATE,
                pdf_path TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER,
                description TEXT,
                quantity INTEGER,
                rate INTEGER,
                amount INTEGER,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_invoice_number(self) -> str:
        '''Generate unique invoice number'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM invoices')
        count = cursor.fetchone()[0]
        conn.close()
        
        # Format: TA/2024-25/001
        year = datetime.now().year
        month = datetime.now().month
        fiscal_year = f'{year}-{str(year+1)[2:]}' if month >= 4 else f'{year-1}-{str(year)[2:]}'
        
        return f'TA/{fiscal_year}/{str(count + 1).zfill(3)}'
    
    def create_invoice(self, invoice_data: Dict) -> str:
        '''Create new invoice'''
        invoice_number = self.generate_invoice_number()
        
        # Calculate tax (18% GST)
        amount = invoice_data['amount']
        tax_amount = int(amount * 0.18)
        total_amount = amount + tax_amount
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO invoices (invoice_number, client_id, client_name, 
                                client_address, client_gstin, amount, 
                                tax_amount, total_amount, description,
                                issue_date, due_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            invoice_number,
            invoice_data.get('client_id'),
            invoice_data['client_name'],
            invoice_data.get('client_address', ''),
            invoice_data.get('client_gstin', ''),
            amount,
            tax_amount,
            total_amount,
            invoice_data.get('description', 'AI-Powered Finance Content Services'),
            datetime.now().date(),
            (datetime.now() + timedelta(days=7)).date()  # Due in 7 days
        ))
        
        invoice_id = cursor.lastrowid
        
        # Add line items
        items = invoice_data.get('items', [
            {'description': 'Content Creation Services', 'quantity': 1, 'rate': amount}
        ])
        
        for item in items:
            cursor.execute('''
                INSERT INTO invoice_items (invoice_id, description, quantity, rate, amount)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                invoice_id,
                item['description'],
                item.get('quantity', 1),
                item.get('rate', amount),
                item.get('quantity', 1) * item.get('rate', amount)
            ))
        
        conn.commit()
        conn.close()
        
        # Generate PDF
        pdf_path = self.generate_pdf(invoice_number)
        
        logger.info(f'Invoice created: {invoice_number} for ₹{total_amount}')
        return invoice_number
    
    def generate_pdf(self, invoice_number: str) -> str:
        '''Generate PDF invoice'''
        # Get invoice data
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM invoices WHERE invoice_number = ?', (invoice_number,))
        invoice = cursor.fetchone()
        
        if not invoice:
            conn.close()
            return ''
        
        # Get line items
        cursor.execute('SELECT * FROM invoice_items WHERE invoice_id = ?', (invoice[0],))
        items = cursor.fetchall()
        conn.close()
        
        # Create PDF
        pdf_path = f'invoices/{invoice_number.replace("/", "_")}.pdf'
        
        try:
            c = canvas.Canvas(pdf_path, pagesize=letter)
            width, height = letter
            
            # Header
            c.setFont('Helvetica-Bold', 20)
            c.drawString(50, height - 50, 'TAX INVOICE')
            
            # Company details
            c.setFont('Helvetica-Bold', 14)
            c.drawString(50, height - 90, self.company_details['name'])
            c.setFont('Helvetica', 10)
            c.drawString(50, height - 105, self.company_details['address'])
            c.drawString(50, height - 120, self.company_details['city'])
            c.drawString(50, height - 135, f'GSTIN: {self.company_details["gstin"]}')
            c.drawString(50, height - 150, f'PAN: {self.company_details["pan"]}')
            
            # Invoice details
            c.setFont('Helvetica-Bold', 10)
            c.drawString(400, height - 90, f'Invoice No: {invoice_number}')
            c.drawString(400, height - 105, f'Date: {invoice[11]}')  # issue_date
            c.drawString(400, height - 120, f'Due Date: {invoice[12]}')  # due_date
            
            # Client details
            c.setFont('Helvetica-Bold', 12)
            c.drawString(50, height - 190, 'Bill To:')
            c.setFont('Helvetica', 10)
            c.drawString(50, height - 205, invoice[3])  # client_name
            if invoice[4]:  # client_address
                c.drawString(50, height - 220, invoice[4])
            if invoice[5]:  # client_gstin
                c.drawString(50, height - 235, f'GSTIN: {invoice[5]}')
            
            # Table header
            y = height - 280
            c.setFont('Helvetica-Bold', 10)
            c.drawString(50, y, 'Description')
            c.drawString(350, y, 'Qty')
            c.drawString(400, y, 'Rate')
            c.drawString(450, y, 'Amount')
            
            # Line items
            y -= 20
            c.setFont('Helvetica', 10)
            for item in items:
                c.drawString(50, y, item[2][:40])  # description
                c.drawString(350, y, str(item[3]))  # quantity
                c.drawString(400, y, f'₹{item[4]:,}')  # rate
                c.drawString(450, y, f'₹{item[5]:,}')  # amount
                y -= 20
            
            # Totals
            y -= 20
            c.setFont('Helvetica-Bold', 10)
            c.drawString(350, y, 'Subtotal:')
            c.drawString(450, y, f'₹{invoice[6]:,}')  # amount
            
            y -= 20
            c.drawString(350, y, 'GST (18%):')
            c.drawString(450, y, f'₹{invoice[7]:,}')  # tax_amount
            
            y -= 20
            c.drawString(350, y, 'Total:')
            c.drawString(450, y, f'₹{invoice[8]:,}')  # total_amount
            
            # Footer
            c.setFont('Helvetica', 8)
            c.drawString(50, 50, 'This is a computer generated invoice.')
            c.drawString(50, 35, f'Contact: {self.company_details["email"]} | {self.company_details["phone"]}')
            
            c.save()
            
            # Update PDF path in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE invoices SET pdf_path = ? WHERE invoice_number = ?',
                (pdf_path, invoice_number)
            )
            conn.commit()
            conn.close()
            
            logger.info(f'PDF generated: {pdf_path}')
            return pdf_path
            
        except Exception as e:
            logger.error(f'PDF generation failed: {e}')
            # Create simple text invoice as fallback
            with open(pdf_path.replace('.pdf', '.txt'), 'w') as f:
                f.write(f'INVOICE: {invoice_number}\n')
                f.write(f'Client: {invoice[3]}\n')
                f.write(f'Amount: ₹{invoice[6]}\n')
                f.write(f'GST: ₹{invoice[7]}\n')
                f.write(f'Total: ₹{invoice[8]}\n')
            return pdf_path.replace('.pdf', '.txt')
    
    def mark_paid(self, invoice_number: str):
        '''Mark invoice as paid'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE invoices 
            SET status = 'paid', paid_date = ?
            WHERE invoice_number = ?
        ''', (datetime.now().date(), invoice_number))
        
        conn.commit()
        conn.close()
        
        logger.info(f'Invoice marked as paid: {invoice_number}')
    
    def get_unpaid_invoices(self) -> List[Dict]:
        '''Get all unpaid invoices'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT invoice_number, client_name, total_amount, due_date
            FROM invoices
            WHERE status = 'unpaid'
            ORDER BY due_date
        ''')
        
        invoices = []
        for row in cursor.fetchall():
            invoices.append({
                'invoice_number': row[0],
                'client_name': row[1],
                'total_amount': row[2],
                'due_date': row[3]
            })
        
        conn.close()
        return invoices

if __name__ == '__main__':
    invoice_sys = InvoiceSystem()
    
    # Example: Create invoice
    invoice_num = invoice_sys.create_invoice({
        'client_id': 1,
        'client_name': 'Sample Financial Services Ltd',
        'client_address': 'Mumbai, Maharashtra',
        'amount': 3000,
        'description': 'Starter Package - Monthly Subscription'
    })
    
    print(f'Invoice created: {invoice_num}')
