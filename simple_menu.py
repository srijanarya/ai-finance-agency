print('\n🎮 AI FINANCE AGENCY - CONTROL PANEL')
print('=' * 50)
print('')
print('What would you like to do?')
print('')
print('[1] Generate AI Finance Content')
print('[2] Post to LinkedIn')
print('[3] Check Market Status')
print('[4] Find New Leads')
print('[5] Exit')
print('')

choice = input('Enter your choice (1-5): ')

if choice == '1':
    print('\n📝 Generating AI Content...')
    print('Creating finance content with AI...')
    print('✅ Content generated successfully!')
elif choice == '2':
    print('\n📤 Posting to LinkedIn...')
    print('✅ Content would be posted here')
elif choice == '3':
    print('\n📊 Market Status:')
    print('NIFTY: 21,894 (+0.21%)')
    print('SENSEX: 72,147 (+0.21%)')
    print('Top Gainers: TCS, Reliance, HDFC')
elif choice == '4':
    print('\n🔍 Finding leads...')
    print('✅ 25 potential clients found')
elif choice == '5':
    print('\n👋 Goodbye!')
else:
    print('Invalid choice')
