#!/usr/bin/env python3
"""
Browser Automation Testing with Playwright
Captures screenshots and tests UI workflows
"""

import asyncio
import os
import time
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BrowserAutomationTester:
    def __init__(self):
        self.screenshot_dir = Path("sandbox_testing/screenshots")
        self.screenshot_dir.mkdir(parents=True, exist_ok=True)
        self.test_results = []
        self.playwright = None
        self.browser = None
        self.context = None
        
    async def setup(self):
        """Setup Playwright browser"""
        try:
            from playwright.async_api import async_playwright
            self.playwright = await async_playwright().start()
            self.browser = await self.playwright.chromium.launch(
                headless=True,  # Set to False to see the browser
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            self.context = await self.browser.new_context(
                viewport={'width': 1920, 'height': 1080},
                ignore_https_errors=True
            )
            logger.info("Browser automation setup complete")
            return True
        except ImportError:
            logger.error("Playwright not installed. Installing...")
            os.system("pip install playwright")
            os.system("playwright install chromium")
            return False
        except Exception as e:
            logger.error(f"Failed to setup browser: {e}")
            return False
    
    async def test_dashboard(self, name: str, port: int, path: str = "/"):
        """Test a specific dashboard"""
        page = await self.context.new_page()
        url = f"http://localhost:{port}{path}"
        test_result = {
            'dashboard': name,
            'url': url,
            'status': 'pending',
            'screenshots': [],
            'errors': []
        }
        
        try:
            logger.info(f"Testing {name} at {url}")
            
            # Navigate to dashboard
            response = await page.goto(url, wait_until='networkidle', timeout=10000)
            
            if response and response.status < 400:
                test_result['status'] = 'loaded'
                
                # Take screenshot
                screenshot_path = self.screenshot_dir / f"{name.lower().replace(' ', '_')}_main.png"
                await page.screenshot(path=str(screenshot_path), full_page=True)
                test_result['screenshots'].append(str(screenshot_path))
                logger.info(f"Screenshot saved: {screenshot_path}")
                
                # Test interactive elements
                await self._test_interactive_elements(page, name, test_result)
                
                test_result['status'] = 'success'
            else:
                test_result['status'] = 'failed'
                test_result['errors'].append(f"HTTP {response.status if response else 'No response'}")
                
        except Exception as e:
            test_result['status'] = 'error'
            test_result['errors'].append(str(e))
            logger.error(f"Error testing {name}: {e}")
        finally:
            await page.close()
            
        self.test_results.append(test_result)
        return test_result
    
    async def _test_interactive_elements(self, page, dashboard_name: str, test_result: dict):
        """Test interactive elements on the page"""
        
        # Test buttons
        buttons = await page.query_selector_all('button')
        logger.info(f"Found {len(buttons)} buttons on {dashboard_name}")
        
        # Click first few buttons and capture results
        for i, button in enumerate(buttons[:3]):  # Test first 3 buttons
            try:
                button_text = await button.inner_text()
                logger.info(f"Clicking button: {button_text}")
                
                # Click and wait for potential navigation or API call
                await button.click()
                await page.wait_for_timeout(1000)  # Wait 1 second
                
                # Take screenshot after action
                screenshot_path = self.screenshot_dir / f"{dashboard_name.lower().replace(' ', '_')}_button_{i}.png"
                await page.screenshot(path=str(screenshot_path))
                test_result['screenshots'].append(str(screenshot_path))
                
            except Exception as e:
                logger.warning(f"Could not click button {i}: {e}")
        
        # Test forms
        forms = await page.query_selector_all('form')
        logger.info(f"Found {len(forms)} forms on {dashboard_name}")
        
        # Test input fields
        inputs = await page.query_selector_all('input[type="text"], textarea')
        for i, input_field in enumerate(inputs[:2]):  # Test first 2 inputs
            try:
                await input_field.fill(f"Test input {i}")
                logger.info(f"Filled input field {i}")
            except Exception as e:
                logger.warning(f"Could not fill input {i}: {e}")
    
    async def test_approval_workflow(self):
        """Test the complete approval workflow"""
        logger.info("Testing approval workflow...")
        page = await self.context.new_page()
        
        try:
            # Navigate to approval dashboard
            await page.goto("http://localhost:5001", wait_until='networkidle', timeout=10000)
            
            # Click generate content button
            generate_btn = await page.query_selector('button:has-text("Generate")')
            if generate_btn:
                await generate_btn.click()
                await page.wait_for_timeout(3000)
                
                # Screenshot after generation
                await page.screenshot(
                    path=str(self.screenshot_dir / "approval_after_generate.png"),
                    full_page=True
                )
            
            # Find and click approve button
            approve_btn = await page.query_selector('button:has-text("Approve")')
            if approve_btn:
                await approve_btn.click()
                await page.wait_for_timeout(1000)
                
                # Screenshot after approval
                await page.screenshot(
                    path=str(self.screenshot_dir / "approval_after_approve.png"),
                    full_page=True
                )
                
            logger.info("Approval workflow test complete")
            
        except Exception as e:
            logger.error(f"Approval workflow test failed: {e}")
        finally:
            await page.close()
    
    async def test_queue_monitor(self):
        """Test queue monitor dashboard"""
        logger.info("Testing queue monitor...")
        page = await self.context.new_page()
        
        try:
            await page.goto("http://localhost:5003", wait_until='networkidle', timeout=10000)
            
            # Screenshot main view
            await page.screenshot(
                path=str(self.screenshot_dir / "queue_monitor_main.png"),
                full_page=True
            )
            
            # Look for queue status elements
            queue_stats = await page.query_selector('.queue-stats, #queue-stats')
            if queue_stats:
                stats_text = await queue_stats.inner_text()
                logger.info(f"Queue stats: {stats_text}")
            
            # Check for refresh button
            refresh_btn = await page.query_selector('button:has-text("Refresh")')
            if refresh_btn:
                await refresh_btn.click()
                await page.wait_for_timeout(1000)
                await page.screenshot(
                    path=str(self.screenshot_dir / "queue_monitor_refreshed.png"),
                    full_page=True
                )
                
        except Exception as e:
            logger.error(f"Queue monitor test failed: {e}")
        finally:
            await page.close()
    
    async def test_all_dashboards(self):
        """Test all configured dashboards"""
        dashboards = [
            ('Main Dashboard', 5000, '/'),
            ('Approval Dashboard', 5001, '/'),
            ('Platform Backend', 5002, '/'),
            ('Queue Monitor', 5003, '/'),
            ('Unified Platform', 5010, '/'),
            ('Treum AI Platform', 5011, '/'),
            ('Automated Social Manager', 5020, '/')
        ]
        
        for name, port, path in dashboards:
            await self.test_dashboard(name, port, path)
            await asyncio.sleep(1)  # Brief pause between tests
    
    async def cleanup(self):
        """Cleanup browser resources"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    def generate_visual_report(self):
        """Generate HTML report with screenshots"""
        html = """<!DOCTYPE html>
<html>
<head>
    <title>Dashboard Visual Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
        .dashboard { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { display: inline-block; padding: 5px 10px; border-radius: 4px; color: white; font-weight: bold; }
        .success { background: #28a745; }
        .failed { background: #dc3545; }
        .error { background: #ffc107; color: #333; }
        .pending { background: #6c757d; }
        .screenshots { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
        .screenshot { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
        .screenshot img { width: 300px; height: auto; display: block; }
        .errors { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; }
        .summary { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .metric { display: inline-block; margin: 0 20px 10px 0; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <h1>🖥️ Dashboard Visual Test Report</h1>
    <div class="summary">
        <h2>Test Summary</h2>"""
        
        # Calculate summary stats
        total = len(self.test_results)
        success = sum(1 for r in self.test_results if r['status'] == 'success')
        failed = sum(1 for r in self.test_results if r['status'] == 'failed')
        errors = sum(1 for r in self.test_results if r['status'] == 'error')
        
        html += f"""
        <div class="metric">
            <div class="metric-value">{total}</div>
            <div class="metric-label">Total Dashboards</div>
        </div>
        <div class="metric">
            <div class="metric-value">{success}</div>
            <div class="metric-label">Successful</div>
        </div>
        <div class="metric">
            <div class="metric-value">{failed}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">{errors}</div>
            <div class="metric-label">Errors</div>
        </div>
    </div>"""
        
        # Add dashboard results
        for result in self.test_results:
            html += f"""
    <div class="dashboard">
        <h2>{result['dashboard']}</h2>
        <p><strong>URL:</strong> {result['url']}</p>
        <p><strong>Status:</strong> <span class="status {result['status']}">{result['status'].upper()}</span></p>"""
            
            if result['errors']:
                html += f"""
        <div class="errors">
            <strong>Errors:</strong><br>
            {'<br>'.join(result['errors'])}
        </div>"""
            
            if result['screenshots']:
                html += """
        <div class="screenshots">"""
                for screenshot in result['screenshots']:
                    rel_path = Path(screenshot).name
                    html += f"""
            <div class="screenshot">
                <img src="screenshots/{rel_path}" alt="{result['dashboard']} screenshot">
            </div>"""
                html += """
        </div>"""
            
            html += """
    </div>"""
        
        html += f"""
    <p style="text-align: center; color: #666; margin-top: 40px;">
        Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    </p>
</body>
</html>"""
        
        # Save HTML report
        report_path = self.screenshot_dir.parent / "visual_test_report.html"
        with open(report_path, 'w') as f:
            f.write(html)
        
        logger.info(f"Visual report saved to {report_path}")
        return report_path

async def main():
    """Main test execution"""
    tester = BrowserAutomationTester()
    
    # Setup browser
    if not await tester.setup():
        logger.error("Failed to setup browser automation. Installing Playwright...")
        os.system("pip install playwright")
        os.system("playwright install chromium")
        if not await tester.setup():
            logger.error("Could not setup browser automation")
            return
    
    try:
        # Run tests
        await tester.test_all_dashboards()
        await tester.test_approval_workflow()
        await tester.test_queue_monitor()
        
        # Generate report
        report_path = tester.generate_visual_report()
        
        print("\\n" + "="*60)
        print("BROWSER AUTOMATION TESTING COMPLETE!")
        print("="*60)
        print(f"\\n📊 Visual report generated: {report_path}")
        print(f"📸 Screenshots saved in: {tester.screenshot_dir}")
        print(f"\\n✅ Dashboards tested: {len(tester.test_results)}")
        
        # Print summary
        success_count = sum(1 for r in tester.test_results if r['status'] == 'success')
        print(f"✅ Successful: {success_count}")
        print(f"❌ Failed: {len(tester.test_results) - success_count}")
        
    finally:
        await tester.cleanup()

if __name__ == "__main__":
    asyncio.run(main())