#!/usr/bin/env python3

import sqlite3
import json

class RevenueCalculator:
    def __init__(self):
        self.real_mrr = 0
        self.subscription_breakdown = {}
    
    def calculate_real_mrr(self):
        """Calculate actual MRR from subscription data"""
        try:
            conn = sqlite3.connect('killbill.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT plan_id, amount, COUNT(*) as count 
                FROM subscriptions 
                WHERE status = 'active'
                GROUP BY plan_id, amount
            ''')
            
            results = cursor.fetchall()
            total_mrr = 0
            
            print("📊 REAL SUBSCRIPTION BREAKDOWN:")
            print("=" * 50)
            
            for plan_id, amount, count in results:
                plan_revenue = amount * count
                total_mrr += plan_revenue
                self.subscription_breakdown[plan_id] = {
                    'customers': count,
                    'price': amount,
                    'revenue': plan_revenue
                }
                print(f"• {plan_id}: {count} customers × ₹{amount:,.0f} = ₹{plan_revenue:,.0f}")
            
            self.real_mrr = total_mrr
            conn.close()
            
            print("=" * 50)
            print(f"🎯 REAL MRR: ₹{total_mrr:,.0f}")
            print(f"💰 Annual Revenue: ₹{total_mrr * 12:,.0f}")
            
            return total_mrr
            
        except Exception as e:
            print(f"❌ Revenue calculation error: {e}")
            return 0
    
    def update_subscription_service(self):
        """Update the subscription service with real calculations"""
        try:
            # Read the current subscription flows file
            with open('automated_subscription_flows.py', 'r') as f:
                content = f.read()
            
            # Replace the hardcoded MRR value
            old_pattern = "current_mrr = 8652462.0"
            new_pattern = f"current_mrr = {self.real_mrr}"
            
            if old_pattern in content:
                content = content.replace(old_pattern, new_pattern)
                
                # Write back the updated content
                with open('automated_subscription_flows.py', 'w') as f:
                    f.write(content)
                
                print(f"✅ Updated subscription service with real MRR: ₹{self.real_mrr:,.0f}")
            else:
                print("⚠️  MRR pattern not found in subscription service")
                
        except Exception as e:
            print(f"❌ Service update error: {e}")
    
    def generate_real_revenue_report(self):
        """Generate comprehensive revenue report"""
        report = {
            "real_mrr": self.real_mrr,
            "annual_revenue": self.real_mrr * 12,
            "subscription_breakdown": self.subscription_breakdown,
            "target_achievement": (self.real_mrr / 300000) * 100,  # Against ₹3 lakh target
            "customers_total": sum([plan['customers'] for plan in self.subscription_breakdown.values()]),
            "average_revenue_per_user": self.real_mrr / max(1, sum([plan['customers'] for plan in self.subscription_breakdown.values()]))
        }
        
        print("\n📋 COMPREHENSIVE REVENUE REPORT:")
        print("=" * 60)
        print(f"Monthly Recurring Revenue: ₹{report['real_mrr']:,.0f}")
        print(f"Annual Revenue Projection: ₹{report['annual_revenue']:,.0f}")
        print(f"Total Active Customers: {report['customers_total']}")
        print(f"Average Revenue Per User: ₹{report['average_revenue_per_user']:,.0f}")
        print(f"Target Achievement: {report['target_achievement']:.1f}% of ₹3 lakh")
        
        # Save report
        with open('real_revenue_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print("✅ Report saved to real_revenue_report.json")
        return report

def main():
    calculator = RevenueCalculator()
    
    # Calculate real MRR
    real_mrr = calculator.calculate_real_mrr()
    
    if real_mrr > 0:
        # Update subscription service
        calculator.update_subscription_service()
        
        # Generate comprehensive report
        calculator.generate_real_revenue_report()
        
        print(f"\n🎯 SUMMARY:")
        print(f"Real MRR: ₹{real_mrr:,.0f} (was showing fake ₹86+ lakh)")
        print(f"Status: Revenue calculations now reflect actual subscription data")
        
    else:
        print("❌ Could not calculate real revenue")

if __name__ == "__main__":
    main()