#!/usr/bin/env python3
"""
Sandbox Content Generation and Posting Test
Tests the complete content pipeline in a safe environment
"""

import os
import json
import time
import sqlite3
from datetime import datetime
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SandboxContentTester:
    def __init__(self):
        self.sandbox_dir = Path("sandbox_testing")
        self.sandbox_dir.mkdir(exist_ok=True)
        self.test_results = []
        
    def test_content_generation(self):
        """Test content generation in sandbox"""
        logger.info("Testing content generation in sandbox...")
        
        try:
            from safe_content_generator import SafeContentGenerator
            generator = SafeContentGenerator()
            
            platforms = ['twitter', 'linkedin', 'telegram']
            content_types = ['market_insight', 'educational', 'analysis']
            
            generated_content = []
            
            for platform in platforms:
                for content_type in content_types:
                    logger.info(f"Generating {content_type} for {platform}...")
                    result = generator.generate_safe_content(platform, content_type)
                    
                    if result['safe']:
                        generated_content.append({
                            'platform': platform,
                            'type': content_type,
                            'content': result['content'],
                            'safe': True,
                            'timestamp': datetime.now().isoformat()
                        })
                        logger.info(f"✅ Generated safe content for {platform}")
                    else:
                        logger.warning(f"⚠️ Content flagged: {result['issues']}")
            
            # Save generated content
            output_file = self.sandbox_dir / "generated_content.json"
            with open(output_file, 'w') as f:
                json.dump(generated_content, f, indent=2)
            
            logger.info(f"Generated {len(generated_content)} pieces of content")
            
            # Add to test queue
            self._add_to_test_queue(generated_content)
            
            return generated_content
            
        except Exception as e:
            logger.error(f"Content generation failed: {e}")
            return []
    
    def _add_to_test_queue(self, content_list):
        """Add generated content to test queue"""
        conn = sqlite3.connect('sandbox_queue.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS test_queue (
                id TEXT PRIMARY KEY,
                platform TEXT,
                content TEXT,
                content_type TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP,
                posted_at TIMESTAMP,
                error_message TEXT
            )
        ''')
        
        for item in content_list:
            queue_id = f"test_{item['platform']}_{int(time.time()*1000)}"
            cursor.execute('''
                INSERT INTO test_queue (id, platform, content, content_type, status)
                VALUES (?, ?, ?, ?, 'pending')
            ''', (queue_id, item['platform'], item['content'], item['type']))
            time.sleep(0.001)  # Ensure unique timestamps
        
        conn.commit()
        conn.close()
        logger.info(f"Added {len(content_list)} items to test queue")
    
    def test_approval_workflow(self):
        """Test approval workflow in sandbox"""
        logger.info("Testing approval workflow...")
        
        conn = sqlite3.connect('sandbox_queue.db')
        cursor = conn.cursor()
        
        # Get pending items
        cursor.execute('''
            SELECT id, platform, content FROM test_queue 
            WHERE status = 'pending' LIMIT 5
        ''')
        pending_items = cursor.fetchall()
        
        approved_count = 0
        rejected_count = 0
        
        for item_id, platform, content in pending_items:
            # Simulate approval logic
            if len(content) > 50 and 'test' not in content.lower():
                # Approve
                cursor.execute('''
                    UPDATE test_queue 
                    SET status = 'approved', approved_at = datetime('now')
                    WHERE id = ?
                ''', (item_id,))
                approved_count += 1
                logger.info(f"✅ Approved: {item_id}")
            else:
                # Reject
                cursor.execute('''
                    UPDATE test_queue 
                    SET status = 'rejected', error_message = 'Content too short or test content'
                    WHERE id = ?
                ''', (item_id,))
                rejected_count += 1
                logger.info(f"❌ Rejected: {item_id}")
        
        conn.commit()
        conn.close()
        
        logger.info(f"Approval complete: {approved_count} approved, {rejected_count} rejected")
        return {'approved': approved_count, 'rejected': rejected_count}
    
    def test_posting_simulation(self):
        """Simulate posting to social media"""
        logger.info("Simulating social media posting...")
        
        conn = sqlite3.connect('sandbox_queue.db')
        cursor = conn.cursor()
        
        # Get approved items
        cursor.execute('''
            SELECT id, platform, content FROM test_queue 
            WHERE status = 'approved'
        ''')
        approved_items = cursor.fetchall()
        
        posted_count = 0
        failed_count = 0
        
        for item_id, platform, content in approved_items:
            # Simulate posting
            success = self._simulate_post(platform, content)
            
            if success:
                cursor.execute('''
                    UPDATE test_queue 
                    SET status = 'posted', posted_at = datetime('now')
                    WHERE id = ?
                ''', (item_id,))
                posted_count += 1
                logger.info(f"📤 Posted to {platform}: {item_id}")
            else:
                cursor.execute('''
                    UPDATE test_queue 
                    SET status = 'failed', error_message = 'Simulated posting failure'
                    WHERE id = ?
                ''', (item_id,))
                failed_count += 1
                logger.info(f"⚠️ Failed to post: {item_id}")
        
        conn.commit()
        conn.close()
        
        logger.info(f"Posting complete: {posted_count} posted, {failed_count} failed")
        return {'posted': posted_count, 'failed': failed_count}
    
    def _simulate_post(self, platform, content):
        """Simulate posting to platform"""
        # Simulate API call with 90% success rate
        import random
        return random.random() > 0.1
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        report = f"""# Sandbox Content Testing Report
**Test Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Test Results

### Content Generation
"""
        
        # Read generated content
        content_file = self.sandbox_dir / "generated_content.json"
        if content_file.exists():
            with open(content_file) as f:
                content = json.load(f)
                report += f"- Total content generated: {len(content)}\\n"
                
                # Count by platform
                platform_counts = {}
                for item in content:
                    platform_counts[item['platform']] = platform_counts.get(item['platform'], 0) + 1
                
                for platform, count in platform_counts.items():
                    report += f"  - {platform.title()}: {count}\\n"
        
        # Queue statistics
        conn = sqlite3.connect('sandbox_queue.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT status, COUNT(*) FROM test_queue 
            GROUP BY status
        ''')
        queue_stats = cursor.fetchall()
        
        report += """
### Queue Processing
"""
        
        for status, count in queue_stats:
            report += f"- {status.title()}: {count}\\n"
        
        # Performance metrics
        cursor.execute('''
            SELECT 
                AVG(julianday(approved_at) - julianday(created_at)) * 24 * 60 as avg_approval_time,
                AVG(julianday(posted_at) - julianday(approved_at)) * 24 * 60 as avg_posting_time
            FROM test_queue 
            WHERE posted_at IS NOT NULL
        ''')
        timing = cursor.fetchone()
        
        if timing[0]:
            report += f"""
### Performance Metrics
- Average approval time: {timing[0]:.2f} minutes
- Average posting time: {timing[1]:.2f} minutes
- Total pipeline time: {(timing[0] + timing[1]):.2f} minutes
"""
        
        conn.close()
        
        # Save report
        report_file = self.sandbox_dir / "content_test_report.md"
        with open(report_file, 'w') as f:
            f.write(report)
        
        logger.info(f"Report saved to {report_file}")
        return report

def main():
    """Run sandbox content tests"""
    tester = SandboxContentTester()
    
    print("\\n" + "="*60)
    print("SANDBOX CONTENT TESTING")
    print("="*60)
    
    # Run tests
    print("\\n1. Generating content...")
    content = tester.test_content_generation()
    
    if content:
        print(f"   ✅ Generated {len(content)} pieces of content")
        
        print("\\n2. Testing approval workflow...")
        approval_results = tester.test_approval_workflow()
        print(f"   ✅ Approved: {approval_results['approved']}")
        print(f"   ❌ Rejected: {approval_results['rejected']}")
        
        print("\\n3. Simulating posting...")
        posting_results = tester.test_posting_simulation()
        print(f"   📤 Posted: {posting_results['posted']}")
        print(f"   ⚠️ Failed: {posting_results['failed']}")
        
        print("\\n4. Generating report...")
        report = tester.generate_test_report()
        print("   ✅ Report generated")
    else:
        print("   ❌ Content generation failed")
    
    print("\\n" + "="*60)
    print("Testing complete! Check sandbox_testing/ for results")
    print("="*60)

if __name__ == "__main__":
    main()