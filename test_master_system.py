#!/usr/bin/env python3
"""Quick test of master control system"""

import asyncio
from master_control_system import AIFinanceAgencyMaster

async def test_master_system():
    print("🧪 Testing Master Control System...")
    
    master = AIFinanceAgencyMaster()
    
    # Test health check
    print("🏥 Running health check...")
    health = await master.run_health_check()
    
    print(f"Overall Health: {'✅ HEALTHY' if health['overall_health'] else '❌ ISSUES'}")
    for system, status in health['individual_systems'].items():
        print(f"  {system}: {status}")
    
    # Generate dashboard
    print("\n📊 Generating dashboard...")
    dashboard = master.generate_master_dashboard_report()
    print(dashboard[:500] + "... (truncated)")
    
    print("\n✅ Master system test complete!")

if __name__ == "__main__":
    asyncio.run(test_master_system())