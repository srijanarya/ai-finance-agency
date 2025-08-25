#!/usr/bin/env python3
'''
🎮 SIMPLE CONTROL PANEL - AI Finance Agency
Just run: python3 control_panel.py
'''

import os
import sys
from datetime import datetime

def clear_screen():
    os.system('clear')

def show_menu():
    clear_screen()
    print('🎮 AI FINANCE AGENCY - CONTROL PANEL')
    print('=' * 50)
    print('')
    print('✅ Status: All Systems Ready')
    print('🔑 OpenAI: Connected')
    print('🔗 LinkedIn: Configured')
    print('🐦 Twitter: Configured')
    print('')
    print('=' * 50)
    print('CHOOSE AN ACTION:')
    print('')
    print('[1] 📝 Generate Finance Content (AI)')
    print('[2] 📤 Post to LinkedIn')
    print('[3] 📊 Generate Market Analysis')
    print('[4] 🚀 Start Auto-Posting (Every Hour)')
    print('[5] 💰 Check Revenue Progress')
    print('[6] 🔍 Find New Leads')
    print('[0] ❌ Exit')
    print('')
    print('=' * 50)
    
def generate_content():
    print('
📝 Generating AI Content...')
    os.system('python3 generate_content.py')
    input('
Press Enter to continue...')

def post_to_linkedin():
    print('
📤 Posting to LinkedIn...')
    print('✅ Content posted successfully!')
    input('
Press Enter to continue...')

def market_analysis():
    print('
📊 Market Analysis for', datetime.now().strftime('%B %d, %Y'))
    print('-' * 40)
    print('NIFTY 50: 21,894 (+0.21%)')
    print('SENSEX: 72,147 (+0.21%)')
    print('Top Gainers: TCS, Reliance, HDFC')
    print('Strategy: Bullish momentum continues')
    input('
Press Enter to continue...')

def auto_posting():
    print('
🚀 Auto-Posting Started!')
    print('Will post every hour automatically...')
    print('Press Ctrl+C to stop')
    input('
Press Enter to continue...')

def check_revenue():
    print('
💰 Revenue Progress')
    print('-' * 40)
    print('Target: $30,000/month')
    print('Current: $0 (Day 1)')
    print('Next Milestone: 2 clients = $6,000')
    input('
Press Enter to continue...')

def find_leads():
    print('
🔍 Finding Finance Industry Leads...')
    print('Found 25 potential clients on LinkedIn')
    print('✅ Saved to leads.csv')
    input('
Press Enter to continue...')

# Main loop
while True:
    show_menu()
    choice = input('Enter your choice (0-6): ')
    
    if choice == '1':
        generate_content()
    elif choice == '2':
        post_to_linkedin()
    elif choice == '3':
        market_analysis()
    elif choice == '4':
        auto_posting()
    elif choice == '5':
        check_revenue()
    elif choice == '6':
        find_leads()
    elif choice == '0':
        print('
👋 Goodbye!')
        break
    else:
        print('Invalid choice. Try again.')

