#!/usr/bin/env python3
'''
Lead Generation Agent - Finds and qualifies potential clients
'''

import asyncio
import sqlite3
import json
import logging
from datetime import datetime
from typing import Dict, List
import os
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LeadGenerationAgent:
    def __init__(self):
        self.db_path = 'data/leads.db'
        self.init_database()
        
        # Target companies (Indian financial services)
        self.target_companies = [
            {'name': 'Zerodha', 'type': 'Broker', 'size': 'Large'},
            {'name': 'Groww', 'type': 'Broker', 'size': 'Medium'},
            {'name': 'Upstox', 'type': 'Broker', 'size': 'Medium'},
            {'name': '5paisa', 'type': 'Broker', 'size': 'Small'},
            {'name': 'Angel One', 'type': 'Broker', 'size': 'Medium'},
            {'name': 'Paytm Money', 'type': 'Fintech', 'size': 'Large'},
            {'name': 'ET Money', 'type': 'Fintech', 'size': 'Medium'},
            {'name': 'Kuvera', 'type': 'Wealth Management', 'size': 'Small'},
            {'name': 'Scripbox', 'type': 'Wealth Management', 'size': 'Small'},
            {'name': 'IIFL Securities', 'type': 'Broker', 'size': 'Large'},
            {'name': 'Motilal Oswal', 'type': 'Broker', 'size': 'Large'},
            {'name': 'HDFC Securities', 'type': 'Bank Broker', 'size': 'Large'},
            {'name': 'ICICI Direct', 'type': 'Bank Broker', 'size': 'Large'},
            {'name': 'Kotak Securities', 'type': 'Bank Broker', 'size': 'Large'},
            {'name': 'Axis Direct', 'type': 'Bank Broker', 'size': 'Medium'}
        ]
        
        # Decision maker titles to target
        self.target_titles = [
            'Chief Marketing Officer',
            'Head of Marketing',
            'VP Marketing',
            'Director of Digital Marketing',
            'Head of Content',
            'Content Manager',
            'Social Media Manager',
            'Brand Manager'
        ]
    
    def init_database(self):
        os.makedirs('data', exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT,
                contact_name TEXT,
                title TEXT,
                email TEXT,
                phone TEXT,
                linkedin_url TEXT,
                company_size TEXT,
                industry TEXT,
                score INTEGER,
                status TEXT DEFAULT 'new',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_contacted DATETIME
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS outreach (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id INTEGER,
                message TEXT,
                channel TEXT,
                status TEXT,
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                response TEXT,
                FOREIGN KEY (lead_id) REFERENCES leads(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def score_lead(self, lead: Dict) -> int:
        '''Score lead quality 0-100'''
        score = 0
        
        # Company size scoring
        if lead.get('company_size') == 'Large':
            score += 40
        elif lead.get('company_size') == 'Medium':
            score += 30
        elif lead.get('company_size') == 'Small':
            score += 20
        
        # Title scoring
        title = lead.get('title', '').lower()
        if 'chief' in title or 'cmo' in title:
            score += 30
        elif 'vp' in title or 'head' in title:
            score += 25
        elif 'director' in title:
            score += 20
        elif 'manager' in title:
            score += 15
        
        # Industry fit
        if lead.get('industry') in ['Broker', 'Fintech', 'Bank Broker']:
            score += 20
        elif lead.get('industry') == 'Wealth Management':
            score += 15
        
        # Has contact info
        if lead.get('email') or lead.get('linkedin_url'):
            score += 10
        
        return min(score, 100)
    
    async def find_leads(self) -> List[Dict]:
        '''Find potential leads'''
        leads = []
        
        # For each target company
        for company in self.target_companies:
            # Create lead records for each title
            for title in self.target_titles[:3]:  # Top 3 titles per company
                lead = {
                    'company': company['name'],
                    'title': title,
                    'company_size': company['size'],
                    'industry': company['type'],
                    'contact_name': '',  # Will be filled by LinkedIn scraping
                    'email': f"{title.lower().replace(' ', '.')}@{company['name'].lower().replace(' ', '')}.com",
                    'linkedin_url': f"linkedin.com/company/{company['name'].lower()}",
                    'score': 0
                }
                
                # Score the lead
                lead['score'] = self.score_lead(lead)
                leads.append(lead)
        
        # Sort by score
        leads.sort(key=lambda x: x['score'], reverse=True)
        
        return leads[:50]  # Top 50 leads
    
    async def save_leads(self, leads: List[Dict]):
        '''Save leads to database'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for lead in leads:
            # Check if lead already exists
            cursor.execute(
                'SELECT id FROM leads WHERE company = ? AND title = ?',
                (lead['company'], lead['title'])
            )
            
            if not cursor.fetchone():
                cursor.execute('''
                    INSERT INTO leads (company, contact_name, title, email, 
                                     linkedin_url, company_size, industry, score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    lead['company'],
                    lead.get('contact_name', ''),
                    lead['title'],
                    lead.get('email', ''),
                    lead.get('linkedin_url', ''),
                    lead['company_size'],
                    lead['industry'],
                    lead['score']
                ))
        
        conn.commit()
        conn.close()
    
    def generate_outreach_message(self, lead: Dict) -> str:
        '''Generate personalized outreach message'''
        templates = [
            '''Hi {title} at {company},

I noticed {company} is one of India's leading {industry}s. Impressive growth!

We help financial services companies like yours generate 10x more engagement with AI-powered content that's 100% SEBI compliant.

Our clients typically see:
• 300% increase in social media engagement
• 50% reduction in content costs
• 100% compliance rate

Worth a quick 15-minute call to explore how we could help {company}?

Best regards,
Srijan Arya
Treum Algotech | AI-Powered Finance Content
''',
            '''Dear {title},

Quick question - how is {company} currently handling the challenge of creating daily market content at scale?

We've developed an AI solution specifically for Indian {industry}s that produces:
• Pre-market analysis (8:30 AM daily)
• Post-market wrap-ups (4 PM daily)
• Educational content
• Social media posts

All 100% SEBI/NSE compliant.

Recent client result: 400% increase in user engagement in 60 days.

Interested in a brief demo?

Regards,
Treum Algotech Team
'''
        ]
        
        import random
        template = random.choice(templates)
        
        return template.format(
            title=lead.get('title', 'there'),
            company=lead.get('company', 'your company'),
            industry=lead.get('industry', 'financial service company')
        )
    
    async def send_outreach(self, lead_id: int, lead: Dict) -> bool:
        '''Send outreach message to lead'''
        message = self.generate_outreach_message(lead)
        
        # Save outreach record
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO outreach (lead_id, message, channel, status)
            VALUES (?, ?, ?, ?)
        ''', (lead_id, message, 'email', 'sent'))
        
        # Update lead status
        cursor.execute(
            'UPDATE leads SET status = ?, last_contacted = ? WHERE id = ?',
            ('contacted', datetime.now(), lead_id)
        )
        
        conn.commit()
        conn.close()
        
        logger.info(f"Outreach sent to {lead['company']} - {lead['title']}")
        
        # Save message to file for manual sending
        os.makedirs('outreach', exist_ok=True)
        filename = f"outreach/{lead['company'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(filename, 'w') as f:
            f.write(f"To: {lead.get('email', 'Unknown')}\n")
            f.write(f"Subject: AI-Powered Content for {lead['company']}\n\n")
            f.write(message)
        
        return True
    
    async def run_outreach_campaign(self, daily_limit: int = 30):
        '''Run daily outreach campaign'''
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get unconctacted leads
        cursor.execute('''
            SELECT id, company, title, email, linkedin_url, company_size, industry, score
            FROM leads
            WHERE status = 'new'
            ORDER BY score DESC
            LIMIT ?
        ''', (daily_limit,))
        
        leads = cursor.fetchall()
        conn.close()
        
        sent_count = 0
        for lead_data in leads:
            lead = {
                'id': lead_data[0],
                'company': lead_data[1],
                'title': lead_data[2],
                'email': lead_data[3],
                'linkedin_url': lead_data[4],
                'company_size': lead_data[5],
                'industry': lead_data[6],
                'score': lead_data[7]
            }
            
            await self.send_outreach(lead['id'], lead)
            sent_count += 1
            
            # Small delay between messages
            await asyncio.sleep(5)
        
        logger.info(f'Outreach campaign complete. Sent {sent_count} messages.')
        return sent_count
    
    async def run(self):
        '''Main execution loop'''
        logger.info('Lead Generation Agent starting...')
        
        # Initial lead generation
        logger.info('Finding initial leads...')
        leads = await self.find_leads()
        await self.save_leads(leads)
        logger.info(f'Found and saved {len(leads)} leads')
        
        while True:
            try:
                current_hour = datetime.now().hour
                
                # Run outreach at 10 AM IST
                if current_hour == 10:
                    logger.info('Starting daily outreach campaign...')
                    sent = await self.run_outreach_campaign(30)
                    logger.info(f'Daily outreach complete: {sent} messages sent')
                
                # Find new leads at 2 PM IST
                elif current_hour == 14:
                    logger.info('Searching for new leads...')
                    new_leads = await self.find_leads()
                    await self.save_leads(new_leads)
                    logger.info(f'Added {len(new_leads)} new leads')
                
                # Wait 1 hour before next check
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f'Lead generation error: {e}')
                await asyncio.sleep(60)

if __name__ == '__main__':
    agent = LeadGenerationAgent()
    asyncio.run(agent.run())
