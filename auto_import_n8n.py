#!/usr/bin/env python3
"""
Automated n8n Workflow Import via API
Bypasses UI to directly import workflow
"""

import requests
import json
import time
from pathlib import Path

class N8NAutoImporter:
    def __init__(self):
        self.base_url = "http://localhost:5678"
        self.api_url = f"{self.base_url}/rest"
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
    def import_workflow_directly(self):
        """Direct API import without UI"""
        print("🚀 Auto-importing AI Finance Agency workflow...")
        
        # Load the workflow
        workflow_path = Path("n8n_workflows/ai_finance_content_agency.json")
        with open(workflow_path, 'r') as f:
            workflow_data = json.load(f)
        
        # Simplify the workflow for import
        simplified_workflow = {
            "name": "AI Finance Content Agency - Auto Import",
            "nodes": workflow_data.get("nodes", []),
            "connections": workflow_data.get("connections", {}),
            "settings": workflow_data.get("settings", {}),
            "tags": workflow_data.get("tags", []),
            "active": False  # Start inactive
        }
        
        # Try direct import via API
        try:
            # Method 1: Try via workflow endpoint
            response = requests.post(
                f"{self.api_url}/workflows",
                json=simplified_workflow,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print("✅ Workflow imported successfully!")
                workflow_id = response.json().get('id', 'unknown')
                print(f"📋 Workflow ID: {workflow_id}")
                return workflow_id
            else:
                print(f"⚠️ API Response: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Direct import failed: {e}")
            
        # Method 2: Create via CLI command
        print("\n🔄 Trying alternative import method...")
        return self.import_via_cli()
    
    def import_via_cli(self):
        """Import using n8n CLI commands"""
        import subprocess
        
        try:
            # Export the workflow to a temp file
            workflow_file = "n8n_workflows/ai_finance_content_agency.json"
            
            # Use n8n import command
            cmd = f"npx n8n import:workflow --input={workflow_file}"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Workflow imported via CLI!")
                return "imported"
            else:
                print(f"⚠️ CLI import output: {result.stderr}")
                
        except Exception as e:
            print(f"❌ CLI import failed: {e}")
            
        return None
    
    def create_simple_test_workflow(self):
        """Create a simple test workflow first"""
        print("\n📝 Creating simplified test workflow...")
        
        test_workflow = {
            "name": "AI Finance Test - Simple",
            "nodes": [
                {
                    "parameters": {},
                    "id": "start-node",
                    "name": "Start",
                    "type": "n8n-nodes-base.start",
                    "typeVersion": 1,
                    "position": [250, 300]
                },
                {
                    "parameters": {
                        "url": "http://localhost:5000/webhook/n8n/trigger",
                        "method": "POST",
                        "sendBody": True,
                        "bodyParameters": {
                            "parameters": [
                                {
                                    "name": "content_type",
                                    "value": "blog"
                                },
                                {
                                    "name": "topic", 
                                    "value": "Market Analysis"
                                }
                            ]
                        }
                    },
                    "id": "webhook-node",
                    "name": "Trigger AI Finance",
                    "type": "n8n-nodes-base.httpRequest",
                    "typeVersion": 3,
                    "position": [450, 300]
                }
            ],
            "connections": {
                "Start": {
                    "main": [
                        [
                            {
                                "node": "Trigger AI Finance",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                }
            },
            "active": False
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/workflows",
                json=test_workflow,
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print("✅ Test workflow created!")
                return response.json().get('id')
            else:
                print(f"⚠️ Could not create test workflow: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Test workflow failed: {e}")
            
        return None

def main():
    print("🤖 N8N AUTO-IMPORTER FOR AI FINANCE AGENCY")
    print("=" * 50)
    
    importer = N8NAutoImporter()
    
    # Try to import the full workflow
    workflow_id = importer.import_workflow_directly()
    
    if not workflow_id:
        # If full import fails, create simple test workflow
        workflow_id = importer.create_simple_test_workflow()
    
    if workflow_id:
        print("\n✅ SUCCESS!")
        print(f"📌 Workflow ID: {workflow_id}")
        print(f"🔗 Open n8n: http://localhost:5678")
        print("\n📋 Next steps:")
        print("1. Go to n8n dashboard")
        print("2. Find 'AI Finance' workflow")
        print("3. Click to open it")
        print("4. Add your API credentials")
        print("5. Activate the workflow")
    else:
        print("\n⚠️ Auto-import couldn't complete")
        print("Manual steps required:")
        print("1. Open http://localhost:5678")
        print("2. Click 'Add Workflow' → 'Import from File'")
        print("3. Select: n8n_workflows/ai_finance_content_agency.json")

if __name__ == "__main__":
    main()