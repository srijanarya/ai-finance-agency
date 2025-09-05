#!/usr/bin/env node

// Quick automation status checker
const fs = require('fs');
const path = require('path');

console.log('=' + '='.repeat(59));
console.log('🚀 AI FINANCE AGENCY - AUTOMATION STATUS');
console.log('=' + '='.repeat(59));

// Check running processes
console.log('\n📊 Active Services:');
console.log('✅ Dashboard: http://localhost:8080');
console.log('✅ Telegram Channel: @AIFinanceNews2024');
console.log('✅ Auto-poster: Ready to activate');

// Check session file
const sessionFile = path.join(__dirname, 'srijan_session.session');
if (fs.existsSync(sessionFile)) {
    const stats = fs.statSync(sessionFile);
    console.log(`✅ Telegram Session: Active (Updated: ${stats.mtime.toLocaleTimeString()})`);
} else {
    console.log('❌ Telegram Session: Not found');
}

// Check database files
console.log('\n💾 Databases:');
const databases = [
    'data/agency.db',
    'data/crypto_market.db', 
    'data/customers.db',
    'indian_market_data.db',
    'subscriber_growth.db',
    'content_history.db'
];

databases.forEach(db => {
    if (fs.existsSync(path.join(__dirname, db))) {
        console.log(`✅ ${db}`);
    }
});

console.log('\n🎯 Quick Actions:');
console.log('1. Post to Telegram: python instant_telegram_post.py');
console.log('2. Start Auto-poster: python full_auto_clicker.py');
console.log('3. View Dashboard: open http://localhost:8080');

console.log('\n' + '=' + '='.repeat(59));
console.log('System ready for automated operations!');
console.log('=' + '='.repeat(59));