#!/usr/bin/env python3
"""
Cloud Environment Manager
Securely manage environment variables for cloud deployment
"""

import os
import json
import base64
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import getpass

class CloudEnvManager:
    def __init__(self):
        self.env_file = '.env'
        self.template_file = '.env.template'
        self.encrypted_file = '.env.encrypted'
        
    def generate_key(self):
        """Generate a new encryption key"""
        return Fernet.generate_key()
    
    def encrypt_env_file(self, password=None):
        """Encrypt .env file for cloud deployment"""
        
        if not os.path.exists(self.env_file):
            print(f"❌ {self.env_file} not found!")
            return False
        
        # Get password
        if not password:
            password = getpass.getpass("🔐 Enter password for encryption: ")
        
        try:
            # Generate key from password
            password_bytes = password.encode('utf-8')
            key = base64.urlsafe_b64encode(password_bytes.ljust(32)[:32])
            fernet = Fernet(key)
            
            # Read and encrypt .env file
            with open(self.env_file, 'rb') as f:
                env_data = f.read()
            
            encrypted_data = fernet.encrypt(env_data)
            
            # Save encrypted file
            with open(self.encrypted_file, 'wb') as f:
                f.write(encrypted_data)
            
            print(f"✅ Environment variables encrypted to {self.encrypted_file}")
            print(f"📁 File size: {len(encrypted_data)} bytes")
            print("🚀 Safe to upload to cloud!")
            
            return True
            
        except Exception as e:
            print(f"❌ Encryption failed: {e}")
            return False
    
    def decrypt_env_file(self, password=None):
        """Decrypt .env file from cloud"""
        
        if not os.path.exists(self.encrypted_file):
            print(f"❌ {self.encrypted_file} not found!")
            return False
        
        # Get password
        if not password:
            password = getpass.getpass("🔐 Enter password for decryption: ")
        
        try:
            # Generate key from password
            password_bytes = password.encode('utf-8')
            key = base64.urlsafe_b64encode(password_bytes.ljust(32)[:32])
            fernet = Fernet(key)
            
            # Read and decrypt file
            with open(self.encrypted_file, 'rb') as f:
                encrypted_data = f.read()
            
            decrypted_data = fernet.decrypt(encrypted_data)
            
            # Save decrypted .env file
            with open(self.env_file, 'wb') as f:
                f.write(decrypted_data)
            
            print(f"✅ Environment variables decrypted to {self.env_file}")
            print("🎯 Ready to use!")
            
            return True
            
        except Exception as e:
            print(f"❌ Decryption failed: {e}")
            print("💡 Check your password and try again")
            return False
    
    def create_cloud_config(self):
        """Create configuration for cloud deployment"""
        
        load_dotenv()
        
        # Get current environment variables
        important_vars = [
            'TELEGRAM_BOT_TOKEN',
            'LINKEDIN_PERSONAL_ACCESS_TOKEN',
            'LINKEDIN_COMPANY_ACCESS_TOKEN', 
            'TWITTER_PERSONAL_BEARER_TOKEN',
            'TWITTER_PERSONAL_ACCESS_TOKEN',
            'OPENAI_API_KEY',
            'ANTHROPIC_API_KEY',
            'ALPHA_VANTAGE_API_KEY',
            'FINNHUB_API_KEY',
            'NEWS_API_KEY'
        ]
        
        config = {}
        missing = []
        
        print("🔍 Checking important environment variables...")
        print()
        
        for var in important_vars:
            value = os.getenv(var)
            if value and not value.startswith('your_'):
                config[var] = value
                print(f"✅ {var}: SET")
            else:
                missing.append(var)
                print(f"❌ {var}: NOT SET")
        
        print(f"\n📊 Summary: {len(config)}/{len(important_vars)} variables configured")
        
        if missing:
            print(f"\n⚠️  Missing variables: {', '.join(missing)}")
        
        # Create cloud-ready config
        cloud_config = {
            'env_vars': config,
            'missing_vars': missing,
            'total_vars': len(important_vars),
            'configured_vars': len(config)
        }
        
        with open('cloud_config.json', 'w') as f:
            json.dump(cloud_config, f, indent=2)
        
        print(f"\n💾 Cloud configuration saved to cloud_config.json")
        
        return cloud_config
    
    def show_status(self):
        """Show current environment status"""
        
        print("🌐 Cloud Environment Manager Status")
        print("=" * 50)
        
        files_status = {
            '.env': 'Your local environment file with secrets',
            '.env.template': 'Template file (safe to share)',
            '.env.encrypted': 'Encrypted environment file (safe for cloud)',
            'cloud_config.json': 'Cloud deployment configuration'
        }
        
        for file_name, description in files_status.items():
            if os.path.exists(file_name):
                size = os.path.getsize(file_name)
                print(f"✅ {file_name}: EXISTS ({size} bytes)")
                print(f"   {description}")
            else:
                print(f"❌ {file_name}: NOT FOUND")
                print(f"   {description}")
            print()
    
    def setup_gitignore(self):
        """Ensure sensitive files are in .gitignore"""
        
        gitignore_entries = [
            '.env',
            '.env.local',
            '*.key',
            'cloud_config.json',
            'secrets/',
            '**/*.secret'
        ]
        
        gitignore_file = '.gitignore'
        existing_entries = set()
        
        # Read existing .gitignore
        if os.path.exists(gitignore_file):
            with open(gitignore_file, 'r') as f:
                existing_entries = set(line.strip() for line in f if line.strip())
        
        # Add missing entries
        new_entries = []
        for entry in gitignore_entries:
            if entry not in existing_entries:
                new_entries.append(entry)
        
        if new_entries:
            with open(gitignore_file, 'a') as f:
                f.write('\n# Environment and secrets\n')
                for entry in new_entries:
                    f.write(f'{entry}\n')
            
            print(f"✅ Added {len(new_entries)} entries to .gitignore")
        else:
            print("✅ .gitignore already configured")

def main():
    """Main CLI interface"""
    
    manager = CloudEnvManager()
    
    print("🌐 AI Finance Agency - Cloud Environment Manager")
    print("=" * 60)
    print()
    print("Choose an option:")
    print("1. 📊 Show status")
    print("2. 🔐 Encrypt .env for cloud")
    print("3. 🔓 Decrypt .env from cloud") 
    print("4. ⚙️  Create cloud configuration")
    print("5. 🚫 Setup .gitignore")
    print("6. 📋 Create .env from template")
    print()
    
    choice = input("Enter choice (1-6): ").strip()
    
    if choice == '1':
        manager.show_status()
        
    elif choice == '2':
        print("\n🔐 Encrypting environment file...")
        if manager.encrypt_env_file():
            print("\n💡 Instructions for cloud deployment:")
            print("1. Upload .env.encrypted to your cloud service")
            print("2. Set your password as an environment variable")
            print("3. Use decrypt_env_file() in your cloud startup script")
        
    elif choice == '3':
        print("\n🔓 Decrypting environment file...")
        manager.decrypt_env_file()
        
    elif choice == '4':
        print("\n⚙️ Creating cloud configuration...")
        config = manager.create_cloud_config()
        print("\n💡 Use cloud_config.json to set environment variables in your cloud service")
        
    elif choice == '5':
        print("\n🚫 Setting up .gitignore...")
        manager.setup_gitignore()
        
    elif choice == '6':
        if os.path.exists('.env.template'):
            print("\n📋 Copy .env.template to .env and fill in your values")
            print("Command: cp .env.template .env")
        else:
            print("❌ .env.template not found!")
    
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()
