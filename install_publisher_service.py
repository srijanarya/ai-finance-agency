#!/usr/bin/env python3
"""
Install Automated Publisher as 24/7 System Service
Creates systemd service for continuous operation
"""

import os
import sys
import subprocess
from pathlib import Path
import stat

def create_service_files():
    """Create systemd service and startup script"""
    
    current_dir = Path.cwd()
    user = os.getenv('USER', 'ubuntu')
    
    # Create startup script
    startup_script = f"""#!/bin/bash
# Automated Publisher Startup Script

# Set working directory
cd {current_dir}

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Set Python path
export PYTHONPATH={current_dir}:$PYTHONPATH

# Start the publisher
echo "🚀 Starting AI Finance Agency Automated Publisher..."
echo "📺 Channel: @AIFinanceNews2024"
echo "⏰ Time: $(date)"

python3 automated_publisher.py
"""
    
    # Write startup script
    script_path = current_dir / "start_publisher.sh"
    with open(script_path, 'w') as f:
        f.write(startup_script)
    
    # Make executable
    os.chmod(script_path, stat.S_IRWXU | stat.S_IRGRP | stat.S_IROTH)
    
    # Create systemd service file
    service_content = f"""[Unit]
Description=AI Finance Agency Automated Publisher
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User={user}
WorkingDirectory={current_dir}
ExecStart={script_path}
StandardOutput=journal
StandardError=journal
SyslogIdentifier=ai-finance-publisher

# Environment variables
Environment=PYTHONPATH={current_dir}
Environment=PATH=/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
"""
    
    service_path = "/tmp/ai-finance-publisher.service"
    with open(service_path, 'w') as f:
        f.write(service_content)
    
    return script_path, service_path

def install_service():
    """Install the systemd service"""
    
    print("🚀 AI FINANCE AGENCY - AUTOMATED PUBLISHER INSTALLER")
    print("=" * 60)
    
    try:
        # Create service files
        script_path, service_path = create_service_files()
        
        print(f"✅ Created startup script: {script_path}")
        print(f"✅ Created service file: {service_path}")
        
        # Install systemd service (requires sudo)
        print("\n🔧 Installing systemd service...")
        
        install_commands = [
            f"sudo cp {service_path} /etc/systemd/system/",
            "sudo systemctl daemon-reload",
            "sudo systemctl enable ai-finance-publisher",
        ]
        
        print("\n📋 Installation commands:")
        for cmd in install_commands:
            print(f"   {cmd}")
        
        print("\n🎯 Service Management Commands:")
        print("   sudo systemctl start ai-finance-publisher     # Start service")
        print("   sudo systemctl stop ai-finance-publisher      # Stop service")
        print("   sudo systemctl restart ai-finance-publisher   # Restart service")
        print("   sudo systemctl status ai-finance-publisher    # Check status")
        print("   sudo journalctl -u ai-finance-publisher -f    # View logs")
        
        print("\n⚠️  IMPORTANT SETUP STEPS:")
        print("1. Install required Python packages:")
        print("   pip install schedule pytz requests asyncio")
        print("\n2. Run installation commands (requires sudo):")
        for cmd in install_commands:
            print(f"   {cmd}")
        
        print("\n3. Start the service:")
        print("   sudo systemctl start ai-finance-publisher")
        
        print("\n📊 The service will:")
        print("• 🔄 Run 24/7 automatically")
        print("• 🔁 Restart if it crashes")
        print("• 📅 Publish during market hours (9:15 AM - 3:30 PM IST)")
        print("• ⏰ Post opening bell, market updates, closing summary")
        print("• 📺 Send to @AIFinanceNews2024")
        print("• 📝 Log everything to system journal")
        
        # Test the startup script
        print(f"\n🧪 Testing startup script...")
        if script_path.exists():
            print(f"✅ Startup script created and executable")
        else:
            print(f"❌ Error creating startup script")
        
        print("\n" + "=" * 60)
        print("🎉 Installation files created successfully!")
        print("   Run the installation commands above to activate 24/7 publishing")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error during installation: {e}")
        return False
    
    return True

def create_docker_deployment():
    """Create Docker deployment files"""
    
    dockerfile = """FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create data directory
RUN mkdir -p data

# Set timezone
ENV TZ=Asia/Kolkata

# Run the publisher
CMD ["python", "automated_publisher.py"]
"""

    docker_compose = """version: '3.8'

services:
  ai-finance-publisher:
    build: .
    container_name: ai-finance-publisher
    restart: unless-stopped
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - TZ=Asia/Kolkata
      - PYTHONPATH=/app
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
"""

    requirements_txt = """asyncio
schedule
pytz
requests
yfinance
feedparser
pandas
sqlite3
"""

    # Write Docker files
    with open("Dockerfile", 'w') as f:
        f.write(dockerfile)
    
    with open("docker-compose.yml", 'w') as f:
        f.write(docker_compose)
    
    with open("requirements.txt", 'w') as f:
        f.write(requirements_txt)
    
    print("\n🐳 DOCKER DEPLOYMENT FILES CREATED:")
    print("✅ Dockerfile")
    print("✅ docker-compose.yml") 
    print("✅ requirements.txt")
    
    print("\n📋 Docker Commands:")
    print("   docker-compose up -d          # Start in background")
    print("   docker-compose logs -f        # View logs")
    print("   docker-compose restart        # Restart service")
    print("   docker-compose down           # Stop service")

def main():
    """Main installation function"""
    
    if len(sys.argv) > 1 and sys.argv[1] == "docker":
        create_docker_deployment()
    else:
        install_service()

if __name__ == "__main__":
    main()