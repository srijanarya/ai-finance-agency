#!/usr/bin/env python3
"""
Security vulnerability scanning for AI Finance Agency dependencies
"""

import subprocess
import sys
import json
import os
from typing import Dict, List, Optional

def install_safety():
    """Install safety package if not available"""
    try:
        import safety
        return True
    except ImportError:
        print("Installing safety package...")
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', 'safety'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Safety package installed successfully")
            return True
        else:
            print(f"❌ Failed to install safety: {result.stderr}")
            return False

def run_safety_check(requirements_file: str = "requirements.txt") -> Dict:
    """Run safety check on requirements file"""
    if not os.path.exists(requirements_file):
        print(f"❌ Requirements file not found: {requirements_file}")
        return {"error": f"File not found: {requirements_file}"}
    
    try:
        # Run safety check
        result = subprocess.run([
            sys.executable, '-m', 'safety', 'check', 
            '-r', requirements_file,
            '--json'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            return {"status": "clean", "vulnerabilities": []}
        else:
            # Parse JSON output for vulnerabilities
            try:
                vulnerabilities = json.loads(result.stdout)
                return {"status": "vulnerabilities_found", "vulnerabilities": vulnerabilities}
            except json.JSONDecodeError:
                return {"status": "error", "message": result.stdout + result.stderr}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

def check_package_licenses(requirements_file: str = "requirements.txt") -> Dict:
    """Check package licenses for compliance"""
    try:
        # Run pip-licenses if available
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', 'pip-licenses'
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            license_result = subprocess.run([
                sys.executable, '-m', 'piplicenses', 
                '--format', 'json'
            ], capture_output=True, text=True)
            
            if license_result.returncode == 0:
                licenses = json.loads(license_result.stdout)
                return {"status": "success", "licenses": licenses}
        
        return {"status": "tool_unavailable", "message": "pip-licenses not available"}
    
    except Exception as e:
        return {"status": "error", "message": str(e)}

def analyze_requirements_structure():
    """Analyze the requirements directory structure"""
    req_files = {
        "requirements.txt": "Main requirements file",
        "requirements/base.txt": "Base dependencies",
        "requirements/dev.txt": "Development dependencies",
        "requirements/test.txt": "Testing dependencies", 
        "requirements/prod.txt": "Production dependencies"
    }
    
    analysis = {"files_found": [], "files_missing": [], "total_packages": 0}
    
    for file_path, description in req_files.items():
        if os.path.exists(file_path):
            analysis["files_found"].append({"file": file_path, "description": description})
            
            # Count packages
            try:
                with open(file_path, 'r') as f:
                    lines = f.readlines()
                    # Count non-comment, non-empty lines that don't start with -r
                    packages = [l for l in lines if l.strip() and not l.strip().startswith('#') and not l.strip().startswith('-r')]
                    analysis["total_packages"] += len(packages)
            except:
                pass
        else:
            analysis["files_missing"].append({"file": file_path, "description": description})
    
    return analysis

def generate_security_report():
    """Generate comprehensive security report"""
    print("🔍 AI Finance Agency - Security Scan Report")
    print("=" * 50)
    
    # 1. Requirements structure analysis
    print("\n📁 Requirements Structure Analysis:")
    structure = analyze_requirements_structure()
    
    print(f"✅ Files found: {len(structure['files_found'])}")
    for file_info in structure['files_found']:
        print(f"   • {file_info['file']} - {file_info['description']}")
    
    if structure['files_missing']:
        print(f"⚠️ Files missing: {len(structure['files_missing'])}")
        for file_info in structure['files_missing']:
            print(f"   • {file_info['file']} - {file_info['description']}")
    
    print(f"📦 Total packages across all files: {structure['total_packages']}")
    
    # 2. Security vulnerability scan
    print("\n🛡️ Security Vulnerability Scan:")
    
    # Install safety if needed
    if not install_safety():
        print("❌ Cannot perform security scan - safety package unavailable")
        return
    
    # Scan main requirements
    main_scan = run_safety_check("requirements.txt")
    print(f"Main requirements: {main_scan['status']}")
    
    if main_scan.get('vulnerabilities'):
        print(f"⚠️ Found {len(main_scan['vulnerabilities'])} vulnerabilities:")
        for vuln in main_scan['vulnerabilities'][:5]:  # Show first 5
            print(f"   • {vuln.get('package', 'Unknown')} - {vuln.get('vulnerability', 'No details')}")
    
    # Scan requirements files individually
    req_files = ["requirements/base.txt", "requirements/dev.txt", "requirements/test.txt", "requirements/prod.txt"]
    total_vulnerabilities = 0
    
    for req_file in req_files:
        if os.path.exists(req_file):
            scan_result = run_safety_check(req_file)
            vuln_count = len(scan_result.get('vulnerabilities', []))
            total_vulnerabilities += vuln_count
            print(f"{req_file}: {scan_result['status']} ({vuln_count} vulnerabilities)")
    
    # 3. License compliance check
    print("\n📜 License Compliance Check:")
    license_check = check_package_licenses()
    print(f"License scan: {license_check['status']}")
    
    # 4. Summary and recommendations
    print("\n📋 Summary:")
    if total_vulnerabilities == 0:
        print("✅ No security vulnerabilities detected")
    else:
        print(f"⚠️ Total vulnerabilities found: {total_vulnerabilities}")
        print("📝 Recommendation: Review and update vulnerable packages")
    
    print(f"✅ Requirements structure: {'Complete' if not structure['files_missing'] else 'Incomplete'}")
    print(f"✅ Total packages managed: {structure['total_packages']}")
    
    # 5. Next steps
    print("\n🔄 Recommended Actions:")
    print("1. Review any vulnerabilities found above")
    print("2. Update packages with known security issues")
    print("3. Run 'pip-audit' for additional security scanning")
    print("4. Consider using 'dependabot' for automated updates")
    print("5. Regularly scan dependencies (weekly/monthly)")
    
    print("\n" + "=" * 50)
    print("Security scan completed! 🎉")

if __name__ == "__main__":
    generate_security_report()