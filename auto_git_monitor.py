#!/usr/bin/env python3
"""
Automated Git Monitor - Commits and pushes changes every 5 minutes or when 100+ lines changed
"""
import subprocess
import time
import datetime
import os
import sys

class AutoGitMonitor:
    def __init__(self):
        self.last_commit_time = time.time()
        self.commit_interval = 300  # 5 minutes in seconds
        self.line_threshold = 100
        
    def run_git_command(self, command):
        """Execute git command and return output"""
        try:
            result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd=os.getcwd())
            return result.stdout.strip(), result.stderr.strip(), result.returncode
        except Exception as e:
            return "", str(e), 1
    
    def count_changed_lines(self):
        """Count total lines changed (additions + deletions)"""
        stdout, stderr, returncode = self.run_git_command("git diff --numstat")
        if returncode != 0:
            return 0
        
        total_lines = 0
        for line in stdout.split('\n'):
            if line.strip():
                parts = line.split('\t')
                if len(parts) >= 2 and parts[0].isdigit() and parts[1].isdigit():
                    additions = int(parts[0])
                    deletions = int(parts[1])
                    total_lines += additions + deletions
        
        return total_lines
    
    def has_changes(self):
        """Check if there are any uncommitted changes"""
        stdout, stderr, returncode = self.run_git_command("git status --porcelain")
        return len(stdout.strip()) > 0
    
    def create_commit(self):
        """Create commit with current changes"""
        if not self.has_changes():
            return False
        
        # Add all changes
        self.run_git_command("git add .")
        
        # Create commit message with timestamp
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        commit_message = f"""Auto-commit: Development checkpoint {timestamp}

Automated commit triggered by:
- Time interval (5 min) or line changes (100+ lines)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"""
        
        # Commit changes
        stdout, stderr, returncode = self.run_git_command(f'git commit -m "{commit_message}"')
        
        if returncode == 0:
            print(f"✅ Committed changes at {timestamp}")
            return True
        else:
            print(f"❌ Commit failed: {stderr}")
            return False
    
    def push_changes(self):
        """Push changes to GitHub"""
        stdout, stderr, returncode = self.run_git_command("git push origin clean-branch")
        
        if returncode == 0:
            print(f"🚀 Pushed to GitHub successfully")
            return True
        else:
            print(f"❌ Push failed: {stderr}")
            return False
    
    def should_commit(self):
        """Determine if we should commit based on time or line changes"""
        current_time = time.time()
        time_elapsed = current_time - self.last_commit_time
        changed_lines = self.count_changed_lines()
        
        if time_elapsed >= self.commit_interval:
            print(f"⏰ Time threshold reached: {time_elapsed:.0f}s >= {self.commit_interval}s")
            return True
        
        if changed_lines >= self.line_threshold:
            print(f"📝 Line threshold reached: {changed_lines} >= {self.line_threshold}")
            return True
        
        return False
    
    def monitor_loop(self):
        """Main monitoring loop"""
        print("🔄 Starting automated git monitor...")
        print(f"📊 Will commit every {self.commit_interval}s or when {self.line_threshold}+ lines change")
        
        try:
            while True:
                if self.has_changes() and self.should_commit():
                    if self.create_commit():
                        self.push_changes()
                        self.last_commit_time = time.time()
                
                # Check every 30 seconds
                time.sleep(30)
                
        except KeyboardInterrupt:
            print("\n🛑 Stopping git monitor...")
            sys.exit(0)
        except Exception as e:
            print(f"❌ Error in monitor loop: {e}")
            sys.exit(1)

if __name__ == "__main__":
    monitor = AutoGitMonitor()
    monitor.monitor_loop()