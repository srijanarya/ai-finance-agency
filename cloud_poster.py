#!/usr/bin/env python3
"""
Cloud-based poster for GitHub Actions
Now uses Centralized Posting Queue to prevent duplicates
"""
import os
import sys
import json
import random
import requests
from datetime import datetime
from content_quality_system import ContentQualitySystem
from posting_monitor import PostingMonitor
from centralized_posting_queue import posting_queue, Platform, Priority
from dotenv import load_dotenv

# Load environment variables from .env if not in GitHub Actions
if not os.getenv('GITHUB_ACTIONS'):
    load_dotenv()

class CloudPoster:
    """Posts content from GitHub Actions"""
    
    def __init__(self):
        self.quality_system = ContentQualitySystem()
        
        # Content rotation for diversity
        self.content_types = [
            # Success stories (40%)
            'options_win_story',
            'successful_trade',
            'smart_investment',
            'wealth_lesson',
            
            # Educational (40%)
            'market_insight',
            'trading_tool',
            'educational_concept',
            'tax_strategies',
            
            # Lessons (20%)
            'options_loss_story',
            'investment_mistake'
        ]
        
        # Use centralized posting queue instead of local history
        self.posting_queue = posting_queue
    
    def get_queue_status(self):
        """Get status from centralized queue"""
        return self.posting_queue.get_queue_status()
    
    def get_next_content_type(self):
        """Get diverse content type"""
        # Simple random selection - queue system handles deduplication
        weights = []
        for ct in self.content_types:
            if 'loss' in ct or 'mistake' in ct:
                weights.append(0.5)  # Lower weight for losses
            elif 'win' in ct or 'successful' in ct:
                weights.append(2.0)  # Higher for success
            else:
                weights.append(1.0)  # Normal for education
        
        # Normalize and select
        total = sum(weights)
        weights = [w/total for w in weights]
        selected = random.choices(self.content_types, weights=weights)[0]
        
        return selected
    
    def generate_and_queue_content(self, platform):
        """Generate content and add to centralized queue"""
        content_type = self.get_next_content_type()
        
        print(f"📝 Generating {content_type} for {platform}...")
        
        # Use the quality system with multi-agent pipeline and validation
        result = self.quality_system.create_content(
            platform=platform,
            content_type=content_type
        )
        
        if result.get('success'):
            print(f"✅ Generated: {content_type}")
            print(f"   Quality Score: {result.get('quality_score')}/10")
            print(f"   Validation: {result.get('validation_status', 'N/A')}")
            if result.get('issues_fixed', 0) > 0:
                print(f"   Auto-fixed {result['issues_fixed']} issues")
            
            # Add to centralized queue instead of posting directly
            queue_result = self.posting_queue.add_to_queue(
                content=result['content'],
                platform=platform,
                priority=Priority.NORMAL,
                source='cloud_poster',
                metadata={
                    'content_type': content_type,
                    'quality_score': result.get('quality_score'),
                    'validation_status': result.get('validation_status')
                }
            )
            
            if queue_result['success']:
                print(f"📋 Added to queue: {queue_result['item_id']}")
                print(f"   Queue Position: {queue_result['queue_position']}")
            else:
                print(f"⚠️ Queue add failed: {queue_result['message']}")
                if queue_result.get('reason') == 'duplicate':
                    print(f"   Content hash: {queue_result['content_hash']}")
            
            return queue_result
        else:
            print(f"❌ Generation failed for {content_type}")
            print(f"   Issues: {result.get('issues', [])}")
            return None
    
    # Posting methods moved to centralized queue - no direct posting here
    
    def run(self):
        """Main execution - Generate content and add to centralized queue"""
        print("="*60)
        print("🌩️ CLOUD POSTER - Centralized Queue Mode")
        print("="*60)
        print(f"Time: {datetime.now()}")
        print(f"Running from: GitHub Actions (Cloud)")
        
        # Get current queue status
        status = self.get_queue_status()
        print(f"\n📊 Current Queue Status:")
        print(f"   Pending: {status['queue_counts'].get('pending', 0)}")
        print(f"   Posted Today: {status['queue_counts'].get('posted', 0)}")
        print(f"   Duplicates Prevented: {status['duplicate_stats']['duplicates_prevented']}")
        
        queue_results = []
        
        # Generate and queue content for LinkedIn
        print("\n📘 LinkedIn Content:")
        result = self.generate_and_queue_content('linkedin')
        if result:
            queue_results.append(('LinkedIn', result))
        
        # Generate and queue content for Twitter/X
        print("\n🐦 Twitter/X Content:")
        result = self.generate_and_queue_content('twitter')
        if result:
            queue_results.append(('Twitter', result))
        
        # Generate and queue content for Telegram
        print("\n💬 Telegram Content:")
        result = self.generate_and_queue_content('telegram')
        if result:
            queue_results.append(('Telegram', result))
        
        # Process some items from the queue
        print("\n🔄 Processing Queue:")
        process_results = self.posting_queue.process_queue(max_items=3)
        
        # Summary
        print("\n" + "="*60)
        print("📊 EXECUTION SUMMARY")
        print("="*60)
        
        successful_queued = [platform for platform, result in queue_results if result and result.get('success')]
        duplicates = [platform for platform, result in queue_results if result and result.get('reason') == 'duplicate']
        
        if successful_queued:
            print(f"✅ Content queued for: {', '.join(successful_queued)}")
        if duplicates:
            print(f"⚠️ Duplicates prevented for: {', '.join(duplicates)}")
        
        print(f"\n🔄 Queue Processing:")
        print(f"   Processed: {process_results['processed']}")
        print(f"   Posted: {process_results['successful']}")
        print(f"   Failed: {process_results['failed']}")
        print(f"   Skipped: {process_results['skipped']}")
        
        print("\n🚀 Using centralized queue - no duplicates possible!")
        print("📊 Dashboard: http://localhost:5001")
        
        # Return results for GitHub Actions
        return {
            'content_generated': len(queue_results),
            'successfully_queued': len(successful_queued),
            'duplicates_prevented': len(duplicates),
            'posts_executed': process_results['successful'],
            'posts_failed': process_results['failed']
        }


if __name__ == "__main__":
    poster = CloudPoster()
    poster.run()