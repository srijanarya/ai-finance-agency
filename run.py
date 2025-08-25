#!/usr/bin/env python3
"""
AI Finance Agency - Main Runner Script
Provides easy commands to run different components
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from agents.research_agent import ResearchAgent
from dashboard import app
from config.config import config

def run_agent():
    """Run the research agent"""
    print("🔍 Starting Research Agent...")
    print(f"Configuration loaded from: {config.database.path}")
    
    agent = ResearchAgent()
    asyncio.run(agent.run_continuous())

def run_agent_once():
    """Run the research agent once"""
    print("🔍 Running single research scan...")
    
    agent = ResearchAgent()
    result = asyncio.run(agent.run_once())
    
    print(f"\n✅ Scan completed!")
    print(f"📄 Topics found: {len(result.get('topics', []))}")
    print(f"💡 Ideas generated: {len(result.get('ideas', []))}")
    print(f"🕒 Timestamp: {result.get('timestamp')}")

def run_dashboard():
    """Run the web dashboard"""
    print("🚀 Starting Web Dashboard...")
    print(f"Dashboard will be available at: http://localhost:{config.dashboard.port}")
    
    app.run(
        host='0.0.0.0',
        port=config.dashboard.port,
        debug=config.dashboard.debug
    )

def show_help():
    """Show help information"""
    print("""
🤖 AI Finance Agency - Command Line Interface

Available commands:
  agent         Run the research agent continuously
  scan          Run a single research scan
  dashboard     Start the web dashboard
  help          Show this help message

Examples:
  python run.py agent       # Start continuous research
  python run.py scan        # Single scan and exit
  python run.py dashboard   # Start web interface

Configuration:
  Edit .env file for API keys and settings
  Default database: data/agency.db
  Default dashboard port: 5000
    """)

def main():
    if len(sys.argv) < 2:
        show_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == 'agent':
        run_agent()
    elif command == 'scan':
        run_agent_once()
    elif command == 'dashboard':
        run_dashboard()
    elif command == 'help':
        show_help()
    else:
        print(f"❌ Unknown command: {command}")
        show_help()

if __name__ == "__main__":
    main()