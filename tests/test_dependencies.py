#!/usr/bin/env python3
"""
Unit tests for dependency management functionality
"""

import unittest
import os
import sys
import subprocess
import tempfile
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestRequirementsStructure(unittest.TestCase):
    """Test requirements file structure"""
    
    def test_main_requirements_exists(self):
        """Test main requirements.txt exists"""
        self.assertTrue(os.path.exists('requirements.txt'))
    
    def test_requirements_directory_exists(self):
        """Test requirements directory structure"""
        self.assertTrue(os.path.exists('requirements/'))
        self.assertTrue(os.path.exists('requirements/base.txt'))
        self.assertTrue(os.path.exists('requirements/dev.txt'))
        self.assertTrue(os.path.exists('requirements/test.txt'))
        self.assertTrue(os.path.exists('requirements/prod.txt'))
    
    def test_requirements_content(self):
        """Test requirements files have content"""
        req_files = [
            'requirements.txt',
            'requirements/base.txt',
            'requirements/dev.txt',
            'requirements/test.txt',
            'requirements/prod.txt'
        ]
        
        for req_file in req_files:
            with self.subTest(file=req_file):
                with open(req_file, 'r') as f:
                    content = f.read().strip()
                    self.assertGreater(len(content), 0, f"{req_file} is empty")
    
    def test_base_requirements_included(self):
        """Test main requirements includes base requirements"""
        with open('requirements.txt', 'r') as f:
            content = f.read()
            self.assertIn('-r requirements/base.txt', content)


class TestSetupScripts(unittest.TestCase):
    """Test setup script functionality"""
    
    def test_unix_setup_script_exists(self):
        """Test Unix setup script exists and is executable"""
        script_path = 'scripts/setup_env.sh'
        self.assertTrue(os.path.exists(script_path))
        self.assertTrue(os.access(script_path, os.X_OK))
    
    def test_windows_setup_script_exists(self):
        """Test Windows setup script exists"""
        script_path = 'scripts/setup_env.ps1'
        self.assertTrue(os.path.exists(script_path))
    
    def test_security_scan_script_exists(self):
        """Test security scan script exists"""
        script_path = 'scripts/security_scan.py'
        self.assertTrue(os.path.exists(script_path))


class TestDependencyImports(unittest.TestCase):
    """Test that critical dependencies can be imported"""
    
    def test_core_imports(self):
        """Test core dependency imports"""
        try:
            import requests
            import pandas
            import numpy
            import flask
        except ImportError as e:
            self.fail(f"Failed to import core dependency: {e}")
    
    def test_ai_imports(self):
        """Test AI library imports"""
        ai_packages = ['openai']
        available_packages = []
        
        for package in ai_packages:
            try:
                __import__(package)
                available_packages.append(package)
            except ImportError:
                pass
        
        # At least one AI package should be available
        self.assertGreater(len(available_packages), 0, 
                          "No AI packages available")
    
    def test_database_imports(self):
        """Test database dependency imports"""
        try:
            import sqlalchemy
            # Redis might not be available in all environments
            try:
                import redis
            except ImportError:
                pass
        except ImportError as e:
            self.fail(f"Failed to import database dependency: {e}")


class TestPackageVersions(unittest.TestCase):
    """Test package versions and compatibility"""
    
    def test_python_version(self):
        """Test Python version meets requirements"""
        major, minor = sys.version_info[:2]
        self.assertGreaterEqual(major, 3, "Python 3+ required")
        self.assertGreaterEqual(minor, 9, "Python 3.9+ recommended")
    
    def test_package_list_availability(self):
        """Test that pip list works"""
        try:
            result = subprocess.run([
                sys.executable, '-m', 'pip', 'list'
            ], capture_output=True, text=True, timeout=30)
            self.assertEqual(result.returncode, 0, "pip list failed")
        except subprocess.TimeoutExpired:
            self.fail("pip list command timed out")
        except Exception as e:
            self.fail(f"pip list failed: {e}")


class TestEnvironmentValidation(unittest.TestCase):
    """Test environment validation functionality"""
    
    def test_env_example_exists(self):
        """Test .env.example file exists"""
        self.assertTrue(os.path.exists('.env.example'))
    
    def test_validation_script_exists(self):
        """Test validation script exists"""
        self.assertTrue(os.path.exists('validate_environment.py'))
    
    def test_validation_script_executable(self):
        """Test validation script can be executed"""
        try:
            result = subprocess.run([
                sys.executable, 'validate_environment.py', '--enhanced'
            ], capture_output=True, text=True, timeout=60)
            # Script should complete (may have warnings but shouldn't crash)
            self.assertNotEqual(result.returncode, 1, 
                              "Validation script crashed")
        except subprocess.TimeoutExpired:
            self.fail("Validation script timed out")
        except Exception as e:
            self.fail(f"Validation script failed: {e}")


class TestDocumentation(unittest.TestCase):
    """Test documentation completeness"""
    
    def test_install_documentation_exists(self):
        """Test installation documentation exists"""
        self.assertTrue(os.path.exists('docs/INSTALL.md'))
    
    def test_install_doc_content(self):
        """Test installation documentation has required sections"""
        with open('docs/INSTALL.md', 'r') as f:
            content = f.read()
            
        required_sections = [
            'Prerequisites',
            'Quick Start',
            'Manual Installation',
            'Environment Configuration',
            'Troubleshooting'
        ]
        
        for section in required_sections:
            with self.subTest(section=section):
                self.assertIn(section, content, 
                            f"Missing section: {section}")


class TestSecurityScanning(unittest.TestCase):
    """Test security scanning functionality"""
    
    def test_security_scan_script_runs(self):
        """Test security scanning script executes"""
        try:
            result = subprocess.run([
                sys.executable, 'scripts/security_scan.py'
            ], capture_output=True, text=True, timeout=120)
            
            # Should complete successfully
            self.assertEqual(result.returncode, 0, 
                           f"Security scan failed: {result.stderr}")
            
            # Should contain expected output
            self.assertIn('Security Scan Report', result.stdout)
            self.assertIn('packages managed:', result.stdout)
            
        except subprocess.TimeoutExpired:
            self.fail("Security scan timed out")
        except Exception as e:
            self.fail(f"Security scan failed: {e}")


class TestProjectStructure(unittest.TestCase):
    """Test overall project structure"""
    
    def test_directory_structure(self):
        """Test required directories exist"""
        required_dirs = [
            'requirements',
            'scripts',
            'docs',
            'tests',
            'config'
        ]
        
        for directory in required_dirs:
            with self.subTest(directory=directory):
                self.assertTrue(os.path.exists(directory), 
                              f"Missing directory: {directory}")
    
    def test_file_structure(self):
        """Test required files exist"""
        required_files = [
            'requirements.txt',
            '.env.example',
            'validate_environment.py',
            'config/config.py',
            'config/enhanced_config.py'
        ]
        
        for file_path in required_files:
            with self.subTest(file=file_path):
                self.assertTrue(os.path.exists(file_path), 
                              f"Missing file: {file_path}")


if __name__ == '__main__':
    # Change to project root directory for tests
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)
    
    # Run tests with verbose output
    unittest.main(verbosity=2)