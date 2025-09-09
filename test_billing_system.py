#!/usr/bin/env python3
"""Test the billing system components"""

try:
    from subscription_manager import subscription_manager
    plans = subscription_manager.get_plans()
    print(f"✅ Subscription Manager: {len(plans)} plans loaded")
    
    for plan in plans:
        print(f"   - {plan.name}: ${plan.price_monthly}/month, ${plan.price_yearly}/year")
    
    from payment_processor import payment_processor
    print("✅ Payment Processor: Initialized")
    
    from business_integration import business_integration
    print("✅ Business Integration: Initialized")
    
    print("\n🎉 All billing system components loaded successfully!")
    print("\n📊 Revenue Potential:")
    print("   - Basic Plan: $99/month x 100 users = $9,900 MRR")
    print("   - Professional: $500/month x 50 users = $25,000 MRR")
    print("   - Enterprise: $2,000/month x 10 users = $20,000 MRR")
    print("   - Total Potential MRR: $54,900 ($658,800 ARR)")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
