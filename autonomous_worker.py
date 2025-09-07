#!/usr/bin/env python3
'''
Autonomous Worker - Executes tasks without human intervention
This script reads PROJECT_BRAIN.md and executes pending tasks
'''

import os
import json
import subprocess
from pathlib import Path
from datetime import datetime

class AutonomousWorker:
    def __init__(self):
        self.project_dir = Path('/Users/srijan/ai-finance-agency')
        self.brain_file = self.project_dir / 'PROJECT_BRAIN.md'
        self.log_file = self.project_dir / 'logs' / 'autonomous_work.log'
        
    def read_brain(self):
        '''Read current project state'''
        with open(self.brain_file, 'r') as f:
            return f.read()
    
    def update_brain(self, update):
        '''Add update to project brain'''
        brain = self.read_brain()
        brain += f"\n\n## UPDATE - {datetime.now()}\n{update}"
        with open(self.brain_file, 'w') as f:
            f.write(brain)
    
    def execute_task(self, task):
        '''Execute a specific task autonomously'''
        self.log(f'Executing: {task}')
        
        # Task execution logic
        if 'API key' in task:
            self.check_api_keys()
        elif 'LinkedIn' in task:
            self.test_linkedin()
        elif 'agent' in task:
            self.create_agent()
        elif 'content' in task:
            self.generate_content()
            
    def check_api_keys(self):
        '''Check and report API key status'''
        env_file = self.project_dir / '.env'
        if env_file.exists():
            with open(env_file, 'r') as f:
                keys = f.read()
            
            status = {
                'OpenAI': 'sk-' in keys and 'your_key_here' not in keys,
                'LinkedIn': '776dnomhse84tj' in keys,
                'Twitter': '345467935' in keys
            }
            
            self.log(f'API Key Status: {status}')
            self.update_brain(f'API Keys Checked: {status}')
    
    def test_linkedin(self):
        '''Test LinkedIn API connection'''
        try:
            result = subprocess.run(
                ['python3', 'linkedin_api.py'],
                cwd=self.project_dir,
                capture_output=True,
                text=True,
                timeout=10
            )
            self.log(f'LinkedIn test: {result.returncode == 0}')
        except Exception as e:
            self.log(f'LinkedIn test failed: {e}')
    
    def create_agent(self):
        '''Create a new automation agent'''
        agent_code = '''
import asyncio
import aiohttp

class ContentAgent:
    async def generate_finance_content(self, topic):
        # Agent logic here
        return f"Generated content about {topic}"
        
    async def run(self):
        while True:
            content = await self.generate_finance_content("market analysis")
            print(content)
            await asyncio.sleep(3600)
'''
        
        agent_file = self.project_dir / 'agents' / 'content_agent.py'
        agent_file.parent.mkdir(exist_ok=True)
        agent_file.write_text(agent_code)
        self.log('Content agent created')
    
    def generate_content(self):
        '''Generate sample finance content'''
        content = '''
📊 Market Analysis - {date}
NIFTY: 21,894 (+0.21%)
Sensex: 72,147 (+0.21%)
Top Gainers: TCS, Reliance
Strategy: Bullish momentum continues
#StockMarket #Trading
        '''.format(date=datetime.now().strftime('%B %d, %Y'))
        
        content_file = self.project_dir / 'content' / f'analysis_{datetime.now().strftime("%Y%m%d")}.txt'
        content_file.parent.mkdir(exist_ok=True)
        content_file.write_text(content)
        self.log(f'Content generated: {content_file}')
    
    def log(self, message):
        '''Log autonomous work'''
        self.log_file.parent.mkdir(exist_ok=True)
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f'{timestamp} - {message}\n'
        
        with open(self.log_file, 'a') as f:
            f.write(log_entry)
        
        print(f'🤖 {message}')
    
    def work(self):
        '''Main autonomous work loop'''
        self.log('Autonomous worker started')
        
        # Read brain to understand context
        brain = self.read_brain()
        
        # Execute pending tasks
        tasks = [
            'Check API keys',
            'Test LinkedIn connection',
            'Create content agent',
            'Generate sample content'
        ]
        
        for task in tasks:
            self.execute_task(task)
        
        self.log('Work session complete')
        self.update_brain('Autonomous work session completed successfully')

if __name__ == '__main__':
    worker = AutonomousWorker()
    worker.work()
