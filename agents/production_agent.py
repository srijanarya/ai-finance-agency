#!/usr/bin/env python3
'''
Production Agent - Mass content creation system
Generates 15-20 pieces of content daily
'''

import asyncio
import openai
import json
import sqlite3
from datetime import datetime
import os
from typing import Dict, List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductionAgent:
    def __init__(self):
        self.openai_key = os.getenv('OPENAI_API_KEY')
        openai.api_key = self.openai_key
        self.db_path = 'data/content.db'
        self.templates = self.load_templates()
        self.init_database()
        
    def init_database(self):
        os.makedirs('data', exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                content TEXT,
                type TEXT,
                platform TEXT,
                status TEXT DEFAULT 'draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                published_at DATETIME
            )
        ''')
        conn.commit()
        conn.close()
    
    def load_templates(self) -> Dict:
        return {
            'market_analysis': '''Write a 1500-word market analysis about {topic}.
                Include: Current data, expert analysis, future outlook.
                Style: Professional finance tone.
                Add FINRA disclaimer at end.''',
            
            'educational': '''Create educational content about {topic}.
                Target: Beginner investors
                Length: 1000 words
                Include: Definitions, examples, tips
                Style: Simple, accessible''',
            
            'social_media': '''Create social media post about {topic}.
                Platform: {platform}
                Length: {length} characters
                Include: Emoji, hashtags, call-to-action
                Style: Engaging, conversational''',
            
            'email': '''Write email about {topic}.
                Subject line: Attention-grabbing
                Length: 200 words
                Include: Key insights, CTA
                Style: Professional, concise'''
        }
    
    async def generate_content(self, brief: Dict) -> str:
        '''Generate content using OpenAI'''
        try:
            template = self.templates.get(brief['type'], self.templates['market_analysis'])
            prompt = template.format(**brief)
            
            response = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            
            # Add compliance disclaimer
            if brief['type'] in ['market_analysis', 'educational']:
                content += '\n\n⚠️ Disclaimer: For educational purposes only. Not investment advice. Consult a SEBI-registered advisor.'
            
            return content
            
        except Exception as e:
            logger.error(f'Content generation error: {e}')
            return self.get_fallback_content(brief)
    
    def get_fallback_content(self, brief: Dict) -> str:
        '''Fallback content if API fails'''
        return f'''📊 Market Update: {brief.get('topic', 'Finance')}

Key Points:
• Market showing mixed signals
• Volatility expected to continue
• Long-term outlook remains positive

Stay tuned for detailed analysis.

#TreumAlgotech #MarketAnalysis #Finance

⚠️ For educational purposes only.'''
    
    async def mass_produce(self, count: int = 15) -> List[Dict]:
        '''Mass produce content pieces'''
        produced = []
        
        # Load opportunities from research agent
        opportunities_file = 'data/content_opportunities.json'
        if os.path.exists(opportunities_file):
            with open(opportunities_file, 'r') as f:
                opportunities = json.load(f)
        else:
            # Default topics
            opportunities = [
                {'title': 'NIFTY Daily Analysis', 'type': 'analysis'},
                {'title': 'Banking Sector Outlook', 'type': 'analysis'},
                {'title': 'How to Read Candlestick Charts', 'type': 'educational'},
                {'title': 'Top 5 Stocks Today', 'type': 'watchlist'},
                {'title': 'Market Opening Bell', 'type': 'social_media'}
            ]
        
        # Generate content for each opportunity
        for i, opp in enumerate(opportunities[:count]):
            brief = {
                'topic': opp['title'],
                'type': opp.get('type', 'analysis'),
                'platform': 'multi',
                'length': 280 if opp.get('type') == 'social_media' else 1500
            }
            
            content = await self.generate_content(brief)
            
            # Store in database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO content (title, content, type, platform) VALUES (?, ?, ?, ?)',
                (brief['topic'], content, brief['type'], brief['platform'])
            )
            conn.commit()
            conn.close()
            
            produced.append({
                'title': brief['topic'],
                'content': content,
                'type': brief['type']
            })
            
            logger.info(f'Produced: {brief["topic"]}')
            
            # Small delay to avoid rate limits
            await asyncio.sleep(2)
        
        return produced
    
    async def run(self):
        '''Main execution loop'''
        logger.info('Production Agent starting...')
        
        while True:
            try:
                # Morning production batch (6 AM)
                current_hour = datetime.now().hour
                
                if current_hour == 6:
                    logger.info('Morning production batch starting...')
                    content = await self.mass_produce(10)
                    logger.info(f'Produced {len(content)} pieces')
                
                elif current_hour == 14:
                    logger.info('Afternoon production batch starting...')
                    content = await self.mass_produce(5)
                    logger.info(f'Produced {len(content)} pieces')
                
                # Wait 1 hour before checking again
                await asyncio.sleep(3600)
                
            except Exception as e:
                logger.error(f'Production agent error: {e}')
                await asyncio.sleep(60)

if __name__ == '__main__':
    agent = ProductionAgent()
    asyncio.run(agent.run())
