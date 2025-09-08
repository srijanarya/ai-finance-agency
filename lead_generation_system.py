#!/usr/bin/env python3
"""
Lead Generation System for TREUM ALGOTECH
==========================================
Automated lead finding and outreach for finance clients
Target: 100+ leads daily → $30K MRR in 90 days

Author: TREUM ALGOTECH
Created: September 8, 2025
"""

import os
import json
import time
import logging
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
from dataclasses import dataclass
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class Lead:
    """Lead data structure"""
    name: str
    title: str
    company: str
    industry: str
    company_size: str
    location: str
    email: Optional[str] = None
    linkedin_url: Optional[str] = None
    score: int = 0
    pain_points: List[str] = None
    status: str = 'new'
    created_at: str = None

class LeadGenerationSystem:
    """
    Automated lead generation system for financial services
    Based on market research: Target regional banks, mutual funds, wealth managers
    """
    
    def __init__(self):
        """Initialize lead generation system"""
        self.db_path = 'leads.db'
        self.init_database()
        
        # Target profiles based on market research
        self.target_profiles = {
            'high_value': {
                'titles': ['CFO', 'Chief Financial Officer', 'VP Finance', 'VP Marketing'],
                'industries': ['Banking', 'Financial Services', 'Investment Management'],
                'company_size': ['1000-5000', '5000-10000'],
                'score_boost': 30
            },
            'medium_value': {
                'titles': ['Director', 'Head of Marketing', 'Head of Digital'],
                'industries': ['FinTech', 'Insurance', 'Wealth Management'],
                'company_size': ['500-1000', '1000-5000'],
                'score_boost': 20
            },
            'nurture': {
                'titles': ['Manager', 'Senior Manager', 'Marketing Lead'],
                'industries': ['Financial Services', 'Banking', 'Investment'],
                'company_size': ['50-500', '500-1000'],
                'score_boost': 10
            }
        }
        
        # Email templates for outreach
        self.email_templates = {
            'high_value': {
                'subject': "Quick question about {company}'s content strategy",
                'body': """Hi {first_name},

I noticed {company} is {pain_point}. 

We help financial institutions like yours generate 50+ pieces of compliant content monthly 
while reducing costs by 70% compared to traditional agencies.

Our AI-powered system ensures 100% FINRA/SEC compliance with zero violations guaranteed.

Worth a quick 15-minute call to discuss how we could help {company}?

Best regards,
Srijan
TREUM ALGOTECH
Startup India Certified FinTech"""
            },
            'medium_value': {
                'subject': "Reduce {company}'s content costs by 70%",
                'body': """Hi {first_name},

Quick question - how much is {company} currently spending on content creation?

We typically save financial services companies 70% on content costs while delivering 
10x more output - all 100% compliant with financial regulations.

Recent client results:
• Regional bank: 48 articles/month → 3x website traffic
• Mutual fund: $6K saved monthly on content
• Wealth manager: 85% time savings on compliance

Interested in a free content audit for {company}?

Best,
Srijan
TREUM ALGOTECH"""
            }
        }
        
        logger.info("Lead Generation System initialized")
    
    def init_database(self):
        """Initialize SQLite database for leads"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                title TEXT,
                company TEXT,
                industry TEXT,
                company_size TEXT,
                location TEXT,
                email TEXT,
                linkedin_url TEXT,
                score INTEGER DEFAULT 0,
                pain_points TEXT,
                status TEXT DEFAULT 'new',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                contacted_at TIMESTAMP,
                response_received BOOLEAN DEFAULT 0,
                meeting_scheduled BOOLEAN DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS outreach (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lead_id INTEGER,
                email_sent_at TIMESTAMP,
                email_subject TEXT,
                email_opened BOOLEAN DEFAULT 0,
                link_clicked BOOLEAN DEFAULT 0,
                response TEXT,
                FOREIGN KEY (lead_id) REFERENCES leads (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_leads(self, count: int = 100) -> List[Lead]:
        """
        Generate qualified leads based on target profiles
        Simulated for demo - in production, integrate with LinkedIn Sales Navigator
        """
        leads = []
        
        # Simulated lead data for demonstration
        sample_companies = [
            ("Regional Bank of New York", "Banking", "1000-5000"),
            ("Midwest Mutual Fund", "Investment Management", "500-1000"),
            ("Pacific Wealth Advisors", "Wealth Management", "100-500"),
            ("Digital First Bank", "FinTech", "1000-5000"),
            ("Heritage Insurance Group", "Insurance", "5000-10000")
        ]
        
        sample_names = [
            ("John Smith", "CFO"),
            ("Sarah Johnson", "VP Marketing"),
            ("Michael Chen", "Director of Digital"),
            ("Emily Davis", "Head of Content"),
            ("Robert Wilson", "Chief Marketing Officer")
        ]
        
        for i in range(min(count, len(sample_companies) * len(sample_names))):
            company = sample_companies[i % len(sample_companies)]
            name_title = sample_names[i % len(sample_names)]
            
            lead = Lead(
                name=name_title[0],
                title=name_title[1],
                company=company[0],
                industry=company[1],
                company_size=company[2],
                location="New York, NY",
                email=self.generate_email(name_title[0], company[0]),
                linkedin_url=f"https://linkedin.com/in/{name_title[0].lower().replace(' ', '')}",
                pain_points=self.identify_pain_points(company[1]),
                created_at=datetime.now().isoformat()
            )
            
            # Score the lead
            lead.score = self.score_lead(lead)
            
            leads.append(lead)
            
        logger.info(f"Generated {len(leads)} leads")
        return sorted(leads, key=lambda x: x.score, reverse=True)
    
    def generate_email(self, name: str, company: str) -> str:
        """Generate probable email address"""
        first = name.split()[0].lower()
        last = name.split()[-1].lower() if len(name.split()) > 1 else ""
        domain = company.lower().replace(" ", "").replace(".", "")
        
        patterns = [
            f"{first}.{last}@{domain}.com",
            f"{first[0]}{last}@{domain}.com",
            f"{first}@{domain}.com"
        ]
        
        return patterns[0]  # Most common pattern
    
    def identify_pain_points(self, industry: str) -> List[str]:
        """Identify industry-specific pain points"""
        pain_points_map = {
            "Banking": [
                "struggling with digital transformation",
                "facing increased compliance requirements",
                "needing to engage younger demographics"
            ],
            "Investment Management": [
                "dealing with fee compression",
                "requiring more investor education content",
                "competing with robo-advisors"
            ],
            "Wealth Management": [
                "scaling personalized client communication",
                "demonstrating value beyond returns",
                "attracting next-gen wealthy clients"
            ],
            "FinTech": [
                "building trust and credibility",
                "educating market on new solutions",
                "competing with established players"
            ],
            "Insurance": [
                "modernizing customer experience",
                "simplifying complex products",
                "improving claim communication"
            ]
        }
        
        return pain_points_map.get(industry, ["improving content marketing efficiency"])
    
    def score_lead(self, lead: Lead) -> int:
        """Score lead based on fit criteria"""
        score = 0
        
        # Title scoring
        for profile_type, profile in self.target_profiles.items():
            if any(title in lead.title for title in profile['titles']):
                score += profile['score_boost']
                break
        
        # Industry scoring
        if lead.industry in ['Banking', 'Financial Services', 'Investment Management']:
            score += 25
        elif lead.industry in ['FinTech', 'Wealth Management', 'Insurance']:
            score += 15
        
        # Company size scoring
        if '1000-5000' in lead.company_size:
            score += 20
        elif '5000-10000' in lead.company_size:
            score += 15
        elif '500-1000' in lead.company_size:
            score += 10
        
        # Email found
        if lead.email:
            score += 10
        
        # Pain points identified
        if lead.pain_points and len(lead.pain_points) > 0:
            score += 5 * len(lead.pain_points)
        
        return min(score, 100)  # Cap at 100
    
    def save_leads(self, leads: List[Lead]):
        """Save leads to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        for lead in leads:
            cursor.execute('''
                INSERT INTO leads (name, title, company, industry, company_size, 
                                 location, email, linkedin_url, score, pain_points, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                lead.name, lead.title, lead.company, lead.industry,
                lead.company_size, lead.location, lead.email, lead.linkedin_url,
                lead.score, json.dumps(lead.pain_points), lead.status
            ))
        
        conn.commit()
        conn.close()
        logger.info(f"Saved {len(leads)} leads to database")
    
    def prepare_outreach_campaign(self, leads: List[Lead]) -> Dict:
        """Prepare personalized outreach campaigns"""
        campaigns = {
            'high_value': [],
            'medium_value': [],
            'nurture': []
        }
        
        for lead in leads:
            # Categorize by score
            if lead.score >= 70:
                category = 'high_value'
            elif lead.score >= 40:
                category = 'medium_value'
            else:
                category = 'nurture'
            
            # Prepare personalized email
            template = self.email_templates.get(category, self.email_templates['medium_value'])
            
            email = {
                'to': lead.email,
                'subject': template['subject'].format(company=lead.company),
                'body': template['body'].format(
                    first_name=lead.name.split()[0],
                    company=lead.company,
                    pain_point=lead.pain_points[0] if lead.pain_points else "expanding its digital presence"
                ),
                'lead': lead,
                'send_time': datetime.now() + timedelta(hours=1)  # Schedule for later
            }
            
            campaigns[category].append(email)
        
        return campaigns
    
    def get_statistics(self) -> Dict:
        """Get lead generation statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # Total leads
        cursor.execute("SELECT COUNT(*) FROM leads")
        stats['total_leads'] = cursor.fetchone()[0]
        
        # Leads by status
        cursor.execute("SELECT status, COUNT(*) FROM leads GROUP BY status")
        stats['by_status'] = dict(cursor.fetchall())
        
        # High-value leads
        cursor.execute("SELECT COUNT(*) FROM leads WHERE score >= 70")
        stats['high_value_leads'] = cursor.fetchone()[0]
        
        # Response rate
        cursor.execute("SELECT COUNT(*) FROM leads WHERE response_received = 1")
        responses = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM leads WHERE contacted_at IS NOT NULL")
        contacted = cursor.fetchone()[0]
        stats['response_rate'] = (responses / contacted * 100) if contacted > 0 else 0
        
        # Meetings scheduled
        cursor.execute("SELECT COUNT(*) FROM leads WHERE meeting_scheduled = 1")
        stats['meetings_scheduled'] = cursor.fetchone()[0]
        
        conn.close()
        return stats

# Usage example
if __name__ == "__main__":
    # Initialize system
    lead_gen = LeadGenerationSystem()
    
    print("🎯 TREUM ALGOTECH Lead Generation System")
    print("=" * 50)
    
    # Generate leads
    print("\n📊 Generating qualified leads...")
    leads = lead_gen.generate_leads(20)  # Generate 20 leads for demo
    
    # Save to database
    lead_gen.save_leads(leads)
    
    # Display top leads
    print(f"\n🏆 Top 5 High-Value Leads:")
    for i, lead in enumerate(leads[:5], 1):
        print(f"\n{i}. {lead.name} - {lead.title}")
        print(f"   Company: {lead.company} ({lead.industry})")
        print(f"   Score: {lead.score}/100")
        print(f"   Email: {lead.email}")
        print(f"   Pain Points: {', '.join(lead.pain_points[:2])}")
    
    # Prepare campaigns
    print("\n📧 Preparing Outreach Campaigns...")
    campaigns = lead_gen.prepare_outreach_campaign(leads)
    
    for category, emails in campaigns.items():
        print(f"\n{category.upper()}: {len(emails)} emails ready")
        if emails:
            print(f"   Sample subject: {emails[0]['subject']}")
    
    # Display statistics
    print("\n📈 Lead Generation Statistics:")
    stats = lead_gen.get_statistics()
    print(f"   Total Leads: {stats['total_leads']}")
    print(f"   High-Value Leads: {stats['high_value_leads']}")
    print(f"   Response Rate: {stats['response_rate']:.1f}%")
    print(f"   Meetings Scheduled: {stats['meetings_scheduled']}")
    
    print("\n✅ Lead generation complete! Ready for outreach.")