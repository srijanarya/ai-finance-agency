#!/usr/bin/env python3
"""Quick test of analytics system"""

from analytics_dashboard import ContentAnalytics, RealTimeAlerts

def test_analytics():
    print("📊 Testing Analytics System...")
    
    analytics = ContentAnalytics()
    
    # Test performance report
    report = analytics.generate_performance_report()
    print("📈 PERFORMANCE REPORT:")
    print(report)
    
    # Test content calendar
    print("\n📅 Testing Content Calendar...")
    calendar = analytics.create_content_calendar(3)  # Next 3 days
    
    if calendar:
        print("📋 CONTENT CALENDAR:")
        for i, event in enumerate(calendar[:3], 1):
            print(f"{i}. {event['scheduled_time'][:16]} - {event['content_type']} ({event['priority']})")
    else:
        print("📋 No calendar events (not enough data yet)")
    
    print("\n✅ Analytics test complete!")

if __name__ == "__main__":
    test_analytics()