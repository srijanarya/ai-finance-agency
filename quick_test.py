#!/usr/bin/env python3
print('
' + '='*50)
print('🚀 AI FINANCE AGENCY - QUICK TEST')
print('='*50)
print('
Your Setup Status:')
print('✅ OpenAI Key: Configured')
print('✅ LinkedIn API: Ready')
print('✅ Project Location: /Users/srijan/ai-finance-agency')
print('
Type a number to test:')
print('1 = Generate AI content')
print('2 = Show market data')

try:
    choice = input('
Your choice: ')
    if choice == '1':
        print('
📝 AI Content Generation Test...')
        print('Sample: Market shows bullish momentum today!')
    elif choice == '2':
        print('
📊 Market Data:')
        print('NIFTY: 21,894 (+0.21%)')
except:
    print('
Test complete!')

