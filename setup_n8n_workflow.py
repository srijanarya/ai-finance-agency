#!/usr/bin/env python3
"""
Automated n8n Workflow Setup for AI Finance Agency
Sets up and configures the workflow with credentials
"""

import json
import requests
import time
import os
from pathlib import Path

class N8NSetup:
    def __init__(self):
        self.base_url = "http://localhost:5678"
        self.api_url = f"{self.base_url}/rest"
        self.workflow_file = "n8n_workflows/ai_finance_content_agency.json"
        
    def wait_for_n8n(self, max_attempts=30):
        """Wait for n8n to be ready"""
        print("⏳ Waiting for n8n to start...")
        
        for i in range(max_attempts):
            try:
                response = requests.get(f"{self.base_url}/healthz", timeout=2)
                if response.status_code == 200:
                    print("✅ n8n is ready!")
                    return True
            except:
                pass
            
            time.sleep(2)
            print(f"   Attempt {i+1}/{max_attempts}...")
        
        print("❌ n8n failed to start. Please run ./start_n8n.sh first")
        return False
    
    def import_workflow(self):
        """Import the workflow to n8n"""
        print("\n📤 Importing workflow to n8n...")
        
        # Load workflow
        with open(self.workflow_file, 'r') as f:
            workflow = json.load(f)
        
        # Import via API
        try:
            response = requests.post(
                f"{self.api_url}/workflows",
                json=workflow,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code in [200, 201]:
                workflow_id = response.json().get('id')
                print(f"✅ Workflow imported! ID: {workflow_id}")
                return workflow_id
            else:
                print(f"❌ Import failed: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Error importing workflow: {e}")
            return None
    
    def setup_credentials(self):
        """Guide user through credential setup"""
        print("\n🔐 Credential Setup Required")
        print("=" * 40)
        print("\nYou need to configure the following in n8n UI:")
        print(f"\n1. Open: {self.base_url}")
        print("2. Go to: Settings → Credentials")
        print("3. Add these credentials:\n")
        
        credentials = [
            {
                "name": "Claude API",
                "type": "HTTP Header Auth",
                "instructions": "Get API key from: https://console.anthropic.com"
            },
            {
                "name": "OpenAI API", 
                "type": "HTTP Header Auth",
                "instructions": "Get API key from: https://platform.openai.com"
            },
            {
                "name": "Reddit OAuth2",
                "type": "OAuth2",
                "instructions": "Create app at: https://www.reddit.com/prefs/apps"
            },
            {
                "name": "Telegram Bot",
                "type": "Token",
                "instructions": "Already configured in your Python scripts ✅"
            }
        ]
        
        for cred in credentials:
            print(f"\n📌 {cred['name']}")
            print(f"   Type: {cred['type']}")
            print(f"   {cred['instructions']}")
    
    def create_webhook_test(self):
        """Create a test script for webhook integration"""
        print("\n🧪 Creating webhook test script...")
        
        test_script = '''#!/usr/bin/env python3
"""Test webhook integration between n8n and orchestrator"""

import requests
import json

# Test webhook endpoint
url = "http://localhost:5000/webhook/n8n/trigger"

# Test payload
payload = {
    "content_type": "blog",
    "topic": "Testing n8n Integration - Market Update",
    "platforms": ["telegram"],
    "priority": "high"
}

print("🧪 Testing webhook integration...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, timeout=30)
    
    if response.status_code == 200:
        result = response.json()
        print("\\n✅ Integration successful!")
        print(f"Pipeline ID: {result.get('pipeline_id')}")
        print(f"Title: {result.get('content', {}).get('title')}")
        print(f"Execution Time: {result.get('execution_time')}")
    else:
        print(f"\\n❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"\\n❌ Connection error: {e}")
    print("Make sure webhook server is running: python n8n_webhook_endpoint.py")
'''
        
        with open('test_n8n_integration.py', 'w') as f:
            f.write(test_script)
        
        os.chmod('test_n8n_integration.py', 0o755)
        print("✅ Test script created: test_n8n_integration.py")
    
    def activate_workflow(self, workflow_id):
        """Activate the imported workflow"""
        try:
            response = requests.patch(
                f"{self.api_url}/workflows/{workflow_id}",
                json={"active": True},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                print(f"✅ Workflow activated!")
                return True
            else:
                print(f"⚠️  Please activate workflow manually in n8n UI")
                return False
        except:
            print("⚠️  Please activate workflow manually in n8n UI")
            return False
    
    def display_next_steps(self):
        """Show what to do next"""
        print("\n" + "=" * 50)
        print("🎯 NEXT STEPS")
        print("=" * 50)
        
        steps = [
            "1. Start n8n if not running: ./start_n8n.sh",
            f"2. Open n8n UI: {self.base_url}",
            "3. Configure credentials (see above)",
            "4. Start webhook server: python n8n_webhook_endpoint.py",
            "5. Test integration: python test_n8n_integration.py",
            "6. Activate workflow in n8n UI",
            "7. Monitor executions in n8n dashboard"
        ]
        
        for step in steps:
            print(f"\n{step}")
        
        print("\n" + "=" * 50)
        print("💡 TIP: Keep these running in separate terminals:")
        print("   Terminal 1: ./start_n8n.sh")
        print("   Terminal 2: python n8n_webhook_endpoint.py")
        print("   Terminal 3: python multi_agent_orchestrator.py")
        print("=" * 50)

def main():
    print("🚀 N8N WORKFLOW SETUP FOR AI FINANCE AGENCY")
    print("=" * 50)
    
    setup = N8NSetup()
    
    # Check if n8n is running
    if not setup.wait_for_n8n():
        print("\n⚠️  Please start n8n first:")
        print("   ./start_n8n.sh")
        return
    
    # Import workflow
    workflow_id = setup.import_workflow()
    
    if workflow_id:
        # Try to activate
        setup.activate_workflow(workflow_id)
    
    # Setup credentials
    setup.setup_credentials()
    
    # Create test script
    setup.create_webhook_test()
    
    # Display next steps
    setup.display_next_steps()

if __name__ == "__main__":
    main()