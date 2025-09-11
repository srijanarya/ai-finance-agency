#!/usr/bin/env python3
"""
Claude Code Deployment Checklist
Run this to verify everything is ready for Claude Code
"""

import os
import json
from datetime import datetime

def check_deployment_readiness():
    """Check if project is ready for Claude Code deployment"""
    
    print("🤖 AI Finance Agency - Claude Code Deployment Checklist")
    print("=" * 70)
    print()
    
    checklist = []
    
    # 1. Check essential files
    essential_files = {
        '.env.claude': 'Safe environment template',
        'setup_claude_env.py': 'Environment setup helper',
        'requirements-claude.txt': 'Dependencies list',
        'CLAUDE_CODE_SETUP.md': 'Setup documentation',
        'run.py': 'Main application runner'
    }
    
    print("📁 Essential Files Check:")
    for file_path, description in essential_files.items():
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {file_path}: EXISTS ({size} bytes) - {description}")
            checklist.append(f"✅ {file_path}")
        else:
            print(f"❌ {file_path}: MISSING - {description}")
            checklist.append(f"❌ {file_path}")
    
    print()
    
    # 2. Check agent modules
    agent_modules = [
        'agents/research_agent.py',
        'agents/technical_analysis_agent.py',
        'coherent_content_generator.py',
        'platform_styled_poster.py'
    ]
    
    print("🤖 Agent Modules Check:")
    for module in agent_modules:
        if os.path.exists(module):
            print(f"✅ {module}: EXISTS")
            checklist.append(f"✅ {module}")
        else:
            print(f"⚠️  {module}: NOT FOUND (may be optional)")
            checklist.append(f"⚠️  {module}")
    
    print()
    
    # 3. Check directory structure
    required_dirs = ['data', 'logs', 'templates']
    
    print("📂 Directory Structure Check:")
    for dir_name in required_dirs:
        if os.path.exists(dir_name):
            files_count = len(os.listdir(dir_name)) if os.path.isdir(dir_name) else 0
            print(f"✅ {dir_name}/: EXISTS ({files_count} files)")
            checklist.append(f"✅ {dir_name}/")
        else:
            print(f"❌ {dir_name}/: MISSING")
            checklist.append(f"❌ {dir_name}/")
    
    print()
    
    # 4. Security check - ensure no secrets in safe files
    print("🔒 Security Check:")
    
    safe_files_to_check = ['.env.claude', 'setup_claude_env.py', 'requirements-claude.txt']
    security_issues = []
    
    for file_path in safe_files_to_check:
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                content = f.read()
                
            # Check for potential secrets
            secret_patterns = ['sk-', 'AAAA', 'Bearer ', 'token_secret', 'AQV', 'WPL_AP1']
            found_secrets = []
            
            for pattern in secret_patterns:
                if pattern in content and not content.count(f"your_{pattern.lower()}") > 0:
                    # Found potential real secret
                    found_secrets.append(pattern)
            
            if found_secrets:
                print(f"⚠️  {file_path}: May contain secrets: {found_secrets}")
                security_issues.append(file_path)
                checklist.append(f"⚠️  {file_path} security")
            else:
                print(f"✅ {file_path}: Clean (no secrets detected)")
                checklist.append(f"✅ {file_path} security")
    
    print()
    
    # 5. Generate deployment package info
    print("📦 Deployment Package Summary:")
    
    package_info = {
        'timestamp': datetime.now().isoformat(),
        'total_files': len([f for f in os.listdir('.') if os.path.isfile(f)]),
        'essential_files': len([f for f in essential_files.keys() if os.path.exists(f)]),
        'security_issues': len(security_issues),
        'checklist': checklist
    }
    
    print(f"   📊 Total files: {package_info['total_files']}")
    print(f"   ✅ Essential files: {package_info['essential_files']}/{len(essential_files)}")
    print(f"   🔒 Security issues: {package_info['security_issues']}")
    
    # Save deployment info
    with open('claude_deployment_info.json', 'w') as f:
        json.dump(package_info, f, indent=2)
    
    print(f"   💾 Deployment info saved to: claude_deployment_info.json")
    print()
    
    # 6. Final recommendations
    print("💡 Recommendations for Claude Code:")
    print("   1. Upload .env.claude (safe template)")
    print("   2. Upload setup_claude_env.py (setup helper)")
    print("   3. Upload CLAUDE_CODE_SETUP.md (documentation)")
    print("   4. Upload your core Python modules")
    print("   5. Run setup_claude_env.py in Claude Code first")
    print("   6. Manually add real API keys in Claude Code's .env")
    
    if security_issues:
        print(f"\n⚠️  WARNING: Found potential secrets in {len(security_issues)} files:")
        for file in security_issues:
            print(f"   - {file}")
        print("   Please review these files before sharing!")
    else:
        print("\n🎉 All files appear safe for Claude Code!")
    
    # 7. Calculate readiness score
    total_checks = len(checklist)
    passed_checks = len([c for c in checklist if c.startswith('✅')])
    readiness_score = (passed_checks / total_checks) * 100
    
    print(f"\n📊 Deployment Readiness: {readiness_score:.1f}% ({passed_checks}/{total_checks})")
    
    if readiness_score >= 80:
        print("🚀 Ready for Claude Code deployment!")
    elif readiness_score >= 60:
        print("⚠️  Mostly ready - address missing items")
    else:
        print("❌ Not ready - fix critical issues first")
    
    return package_info

def create_upload_list():
    """Create a list of files safe to upload to Claude Code"""
    
    safe_files = [
        '.env.claude',
        'setup_claude_env.py', 
        'requirements-claude.txt',
        'CLAUDE_CODE_SETUP.md',
        'claude_deployment_checklist.py',
        'run.py',
        'agents/research_agent.py',
        'coherent_content_generator.py',
        'platform_styled_poster.py',
        'agency_dashboard.py'
    ]
    
    # Find existing safe files
    upload_list = []
    for file_path in safe_files:
        if os.path.exists(file_path):
            upload_list.append(file_path)
    
    print("\n📋 Safe Files for Claude Code Upload:")
    print("-" * 50)
    for file_path in upload_list:
        size = os.path.getsize(file_path)
        print(f"   {file_path} ({size} bytes)")
    
    print(f"\n   Total: {len(upload_list)} files")
    
    # Save upload list
    with open('claude_upload_list.txt', 'w') as f:
        f.write("# AI Finance Agency - Files Safe for Claude Code\n")
        f.write(f"# Generated: {datetime.now().isoformat()}\n\n")
        for file_path in upload_list:
            f.write(f"{file_path}\n")
    
    print("   💾 Upload list saved to: claude_upload_list.txt")
    
    return upload_list

if __name__ == "__main__":
    # Run deployment check
    deployment_info = check_deployment_readiness()
    
    # Create upload list
    upload_list = create_upload_list()
    
    print(f"\n✅ Deployment check complete!")
    print(f"📁 Ready to work with Claude Code safely!")
