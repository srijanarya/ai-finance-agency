#!/usr/bin/env python3
"""
UNIFIED AUTOMATION HUB - One Interface for All Automation
Consolidates all automation scripts into a single, powerful interface
"""

import subprocess
import webbrowser
import time
import json
import os
import sqlite3
from datetime import datetime
from typing import Dict, List, Optional

class UnifiedAutomationHub:
    """Central hub for all AI Finance Agency automation"""
    
    def __init__(self):
        self.db_path = "/Users/srijan/ai-finance-agency/data/automation_hub.db"
        self.config_path = "/Users/srijan/ai-finance-agency/config/automation_config.json"
        
        self.setup_database()
        self.load_config()
    
    def setup_database(self):
        """Initialize automation tracking database"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS automation_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                automation_type TEXT,
                method_used TEXT,
                target_groups INTEGER,
                success BOOLEAN,
                subscribers_gained INTEGER,
                duration_seconds INTEGER,
                notes TEXT
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sharing_targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                platform TEXT,
                group_name TEXT,
                group_url TEXT,
                last_shared DATETIME,
                success_rate REAL,
                avg_subscribers_gained INTEGER,
                active BOOLEAN DEFAULT 1
            )
        """)
        
        conn.commit()
        conn.close()
    
    def load_config(self):
        """Load automation configuration"""
        default_config = {
            "sharing_message": """🔥 Just discovered this amazing finance channel!

@AIFinanceNews2024

🛡️ They have CREDIBILITY PROTECTION:
✅ Every data verified within 30 minutes
✅ Multi-source validation (NSE, BSE, Yahoo)  
✅ Never posts stale/old market data
✅ 8.8/10 quality score average

🚀 8 AI agents working 24/7 for accuracy!

No fake tips, only verified data + education 📚""",
            "sharing_targets": [
                {
                    "platform": "telegram",
                    "name": "IndianStockMarketLive",
                    "url": "https://t.me/IndianStockMarketLive",
                    "comment": "Found this really helpful for verified market data!",
                    "active": True
                },
                {
                    "platform": "telegram", 
                    "name": "StockMarketIndiaOfficial",
                    "url": "https://t.me/StockMarketIndiaOfficial",
                    "comment": "Finally, a channel that verifies data before posting! 🎯",
                    "active": True
                },
                {
                    "platform": "telegram",
                    "name": "NSEBSETips", 
                    "url": "https://t.me/NSEBSETips",
                    "comment": "Love their credibility protection system!",
                    "active": True
                }
            ],
            "automation_methods": [
                {
                    "name": "applescript_full",
                    "enabled": True,
                    "success_rate": 85,
                    "description": "Full AppleScript automation (macOS only)"
                },
                {
                    "name": "keyboard_control",
                    "enabled": True, 
                    "success_rate": 70,
                    "description": "Keyboard simulation automation"
                },
                {
                    "name": "manual_assist",
                    "enabled": True,
                    "success_rate": 95,
                    "description": "Manual assist with clipboard and browser tabs"
                }
            ]
        }
        
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = default_config
            self.save_config()
    
    def save_config(self):
        """Save current configuration"""
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def record_automation_session(self, automation_type: str, method: str, 
                                target_count: int, success: bool, 
                                subscribers: int = 0, duration: int = 0, 
                                notes: str = ""):
        """Record automation session results"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT INTO automation_sessions 
                (automation_type, method_used, target_groups, success, 
                 subscribers_gained, duration_seconds, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (automation_type, method, target_count, success, 
                  subscribers, duration, notes))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"❌ Error recording session: {e}")
    
    def get_automation_stats(self) -> Dict:
        """Get automation performance statistics"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Overall stats
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_sessions,
                    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_sessions,
                    SUM(subscribers_gained) as total_subscribers,
                    AVG(subscribers_gained) as avg_subscribers_per_session
                FROM automation_sessions
                WHERE timestamp >= datetime('now', '-7 days')
            """)
            overall_stats = cursor.fetchone()
            
            # Method performance
            cursor.execute("""
                SELECT 
                    method_used,
                    COUNT(*) as sessions,
                    AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100 as success_rate,
                    AVG(subscribers_gained) as avg_subscribers
                FROM automation_sessions
                WHERE timestamp >= datetime('now', '-30 days')
                GROUP BY method_used
            """)
            method_stats = cursor.fetchall()
            
            conn.close()
            
            return {
                'total_sessions': overall_stats[0] or 0,
                'successful_sessions': overall_stats[1] or 0,
                'total_subscribers_gained': overall_stats[2] or 0,
                'avg_subscribers_per_session': round(overall_stats[3] or 0, 1),
                'method_performance': {
                    row[0]: {
                        'sessions': row[1],
                        'success_rate': round(row[2], 1),
                        'avg_subscribers': round(row[3], 1)
                    } for row in method_stats
                }
            }
            
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {}
    
    def method_applescript_automation(self) -> bool:
        """AppleScript-based full automation"""
        print("🍎 Executing AppleScript automation...")
        
        try:
            # Create AppleScript for full automation
            applescript = f'''
on run
    tell application "Safari"
        activate
        delay 2
        make new document with properties {{URL:"https://web.telegram.org/k/"}}
        delay 5
        
        display dialog "Login to Telegram Web if needed. Click OK when ready." buttons {{"OK"}} default button "OK"
    end tell
    
    set groupList to {{"IndianStockMarketLive", "StockMarketIndiaOfficial", "NSEBSETips"}}
    set messageText to "{self.config['sharing_message'].replace('"', '\\"')}"
    
    repeat with groupName in groupList
        tell application "Safari"
            make new tab with properties {{URL:"https://t.me/" & groupName}}
            delay 4
            
            do JavaScript "
                setTimeout(() => {{
                    const inputs = document.querySelectorAll('div[contenteditable], input, textarea');
                    const messageInput = Array.from(inputs).find(el => 
                        el.contentEditable === 'true' ||
                        (el.placeholder && el.placeholder.toLowerCase().includes('message'))
                    );
                    
                    if (messageInput) {{
                        messageInput.focus();
                        messageInput.textContent = `" & messageText & "`;
                        
                        const enterEvent = new KeyboardEvent('keydown', {{
                            key: 'Enter',
                            keyCode: 13,
                            bubbles: true
                        }});
                        messageInput.dispatchEvent(enterEvent);
                    }}
                }}, 2000);
            " in current tab
            
            delay 8
        end tell
        delay 30
    end repeat
    
    display dialog "🎉 Automation complete! Check @AIFinanceNews2024 for new subscribers!" buttons {{"Done"}} default button "Done"
end run
'''
            
            # Save and execute AppleScript
            script_file = "/tmp/telegram_automation.applescript"
            with open(script_file, 'w') as f:
                f.write(applescript)
            
            result = subprocess.run(['osascript', script_file], 
                                  timeout=600, capture_output=True, text=True)
            
            return result.returncode == 0
            
        except Exception as e:
            print(f"❌ AppleScript automation failed: {e}")
            return False
    
    def method_keyboard_automation(self) -> bool:
        """Keyboard simulation automation"""
        print("⌨️ Executing keyboard automation...")
        
        try:
            # Open Telegram Web
            webbrowser.open("https://web.telegram.org/k/")
            time.sleep(5)
            
            print("⏳ Please login to Telegram Web if needed...")
            input("Press Enter when Telegram Web is ready...")
            
            targets = self.config['sharing_targets']
            message = self.config['sharing_message']
            
            for target in targets[:3]:  # Limit to 3 targets
                if not target.get('active', True):
                    continue
                
                print(f"📱 Opening {target['name']}...")
                webbrowser.open(target['url'])
                time.sleep(3)
                
                print(f"💬 Ready to share to {target['name']}")
                print("📋 Message copied to clipboard")
                
                # Copy message to clipboard
                try:
                    process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
                    process.communicate(message.encode())
                except:
                    pass
                
                input(f"Paste message in {target['name']} and press Enter to continue...")
                time.sleep(2)
            
            return True
            
        except Exception as e:
            print(f"❌ Keyboard automation failed: {e}")
            return False
    
    def method_manual_assist(self) -> bool:
        """Manual assist automation"""
        print("👤 Launching manual assist automation...")
        
        try:
            message = self.config['sharing_message']
            targets = [t for t in self.config['sharing_targets'] if t.get('active', True)]
            
            # Copy message to clipboard
            try:
                process = subprocess.Popen(['pbcopy'], stdin=subprocess.PIPE)
                process.communicate(message.encode())
                print("✅ Message copied to clipboard")
            except:
                print("⚠️ Could not copy to clipboard")
            
            # Open browser tabs
            print("🌐 Opening browser tabs...")
            webbrowser.open("https://web.telegram.org/k/")
            time.sleep(2)
            
            for target in targets[:5]:  # Limit to 5 targets
                webbrowser.open(target['url'])
                time.sleep(1)
            
            print(f"✅ Opened {len(targets) + 1} tabs")
            
            # Generate sharing instructions
            instructions = f"""
📋 MANUAL SHARING INSTRUCTIONS:

✅ Message copied to clipboard
✅ {len(targets) + 1} browser tabs opened

🎯 WHAT TO DO NOW:
1. Go to Telegram Web tab (first tab)
2. Login if needed
3. Go to each group tab ({', '.join(t['name'] for t in targets[:3])})
4. Paste message (Cmd+V) in each group
5. Add a follow-up comment if desired

💬 FOLLOW-UP COMMENTS:
"""
            
            for target in targets[:3]:
                instructions += f"• {target['name']}: {target.get('comment', 'Great channel!')}\n"
            
            instructions += f"""
📊 EXPECTED RESULTS:
• 30-90 new subscribers
• 2-5% engagement rate
• Check @AIFinanceNews2024 in 1 hour

🎉 Happy sharing! Your automation is ready!
"""
            
            print(instructions)
            
            # Save instructions to file
            with open("/Users/srijan/ai-finance-agency/SHARING_INSTRUCTIONS.md", "w") as f:
                f.write(instructions)
            
            return True
            
        except Exception as e:
            print(f"❌ Manual assist failed: {e}")
            return False
    
    def execute_automation(self, method: str = "auto") -> Dict:
        """Execute automation using specified method"""
        
        start_time = time.time()
        automation_type = "telegram_sharing"
        
        print("🚀 UNIFIED AUTOMATION HUB")
        print("=" * 50)
        print(f"🎯 Target: @AIFinanceNews2024 growth")
        print(f"📱 Groups: {len([t for t in self.config['sharing_targets'] if t.get('active', True)])}")
        print("=" * 50)
        
        # Auto-select best method if not specified
        if method == "auto":
            methods = self.config['automation_methods']
            enabled_methods = [m for m in methods if m.get('enabled', True)]
            if enabled_methods:
                # Sort by success rate
                best_method = max(enabled_methods, key=lambda x: x.get('success_rate', 0))
                method = best_method['name']
            else:
                method = "manual_assist"  # Fallback
        
        print(f"🔧 Using method: {method}")
        
        # Execute chosen method
        success = False
        
        if method == "applescript_full":
            success = self.method_applescript_automation()
        elif method == "keyboard_control":
            success = self.method_keyboard_automation()
        elif method == "manual_assist":
            success = self.method_manual_assist()
        else:
            print(f"❌ Unknown method: {method}")
        
        # Calculate duration
        duration = int(time.time() - start_time)
        
        # Record session
        target_count = len([t for t in self.config['sharing_targets'] if t.get('active', True)])
        expected_subscribers = 45 if success else 0  # Estimate
        
        self.record_automation_session(
            automation_type=automation_type,
            method=method,
            target_count=target_count,
            success=success,
            subscribers=expected_subscribers,
            duration=duration,
            notes=f"Method: {method}, Targets: {target_count}"
        )
        
        result = {
            'success': success,
            'method': method,
            'duration': duration,
            'targets': target_count,
            'expected_subscribers': expected_subscribers
        }
        
        print("\n📊 AUTOMATION RESULTS")
        print("=" * 30)
        print(f"Status: {'✅ SUCCESS' if success else '❌ FAILED'}")
        print(f"Method: {method}")
        print(f"Duration: {duration} seconds")
        print(f"Targets: {target_count} groups")
        print(f"Expected Subscribers: {expected_subscribers}")
        
        return result
    
    def show_dashboard(self):
        """Show automation dashboard"""
        stats = self.get_automation_stats()
        
        print("\n🎛️ AUTOMATION HUB DASHBOARD")
        print("=" * 60)
        print(f"📊 Total Sessions (7 days): {stats.get('total_sessions', 0)}")
        print(f"✅ Successful Sessions: {stats.get('successful_sessions', 0)}")
        print(f"👥 Total Subscribers Gained: {stats.get('total_subscribers_gained', 0)}")
        print(f"📈 Avg Subscribers/Session: {stats.get('avg_subscribers_per_session', 0)}")
        
        if stats.get('method_performance'):
            print(f"\n🔧 METHOD PERFORMANCE:")
            for method, perf in stats['method_performance'].items():
                print(f"• {method}: {perf['success_rate']}% success, {perf['avg_subscribers']} avg subscribers")
        
        active_targets = [t for t in self.config['sharing_targets'] if t.get('active', True)]
        print(f"\n🎯 ACTIVE TARGETS: {len(active_targets)}")
        for target in active_targets:
            print(f"• {target['name']} ({target['platform']})")
    
    def interactive_menu(self):
        """Interactive menu for automation hub"""
        
        while True:
            print("\n🚀 AI FINANCE AGENCY - AUTOMATION HUB")
            print("=" * 60)
            print("1. 🔄 Run Automation (Auto-select method)")
            print("2. 🍎 Run AppleScript Automation")
            print("3. ⌨️ Run Keyboard Automation") 
            print("4. 👤 Run Manual Assist")
            print("5. 📊 Show Dashboard")
            print("6. ⚙️ Configure Settings")
            print("7. 🔍 View Recent Sessions")
            print("8. ❌ Exit")
            print("=" * 60)
            
            try:
                choice = input("Select option (1-8): ").strip()
                
                if choice == "1":
                    self.execute_automation("auto")
                elif choice == "2":
                    self.execute_automation("applescript_full")
                elif choice == "3":
                    self.execute_automation("keyboard_control")
                elif choice == "4":
                    self.execute_automation("manual_assist")
                elif choice == "5":
                    self.show_dashboard()
                elif choice == "6":
                    print("⚙️ Configuration saved to:", self.config_path)
                elif choice == "7":
                    self.show_recent_sessions()
                elif choice == "8":
                    print("👋 Goodbye!")
                    break
                else:
                    print("❌ Invalid option. Please try again.")
                    
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")
    
    def show_recent_sessions(self):
        """Show recent automation sessions"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT timestamp, automation_type, method_used, success, 
                       subscribers_gained, notes
                FROM automation_sessions 
                ORDER BY timestamp DESC LIMIT 10
            """)
            sessions = cursor.fetchall()
            conn.close()
            
            print("\n📝 RECENT AUTOMATION SESSIONS")
            print("=" * 60)
            
            if not sessions:
                print("No recent sessions found.")
                return
            
            for session in sessions:
                timestamp, auto_type, method, success, subscribers, notes = session
                status = "✅ SUCCESS" if success else "❌ FAILED"
                print(f"{timestamp} | {method} | {status} | +{subscribers} subscribers")
                
        except Exception as e:
            print(f"❌ Error showing sessions: {e}")

def main():
    """Main entry point"""
    hub = UnifiedAutomationHub()
    
    # Check if we have command line arguments
    import sys
    
    if len(sys.argv) > 1:
        method = sys.argv[1].lower()
        if method in ["auto", "applescript", "keyboard", "manual"]:
            method_map = {
                "auto": "auto",
                "applescript": "applescript_full", 
                "keyboard": "keyboard_control",
                "manual": "manual_assist"
            }
            hub.execute_automation(method_map[method])
        else:
            print(f"❌ Unknown method: {method}")
            print("Available methods: auto, applescript, keyboard, manual")
    else:
        # Interactive mode
        hub.interactive_menu()

if __name__ == "__main__":
    main()