#!/usr/bin/env python3
"""
Load Testing Suite for Enterprise AI Finance Agency
Tests system performance under realistic traffic scenarios
"""

import asyncio
import aiohttp
import time
import json
import random
from datetime import datetime
import statistics
import concurrent.futures
from dataclasses import dataclass
from typing import List, Dict, Any

@dataclass
class TestResult:
    endpoint: str
    response_time: float
    status_code: int
    success: bool
    timestamp: datetime
    payload_size: int = 0
    response_size: int = 0

class LoadTester:
    """Comprehensive load testing for the enterprise system"""
    
    def __init__(self):
        self.base_url = "http://localhost:5001"
        self.chatwoot_url = "http://localhost:3000"
        self.killbill_url = "http://localhost:8080"
        self.results = []
        
    async def test_content_generation_load(self, concurrent_requests: int = 10, total_requests: int = 100):
        """Test content generation under load"""
        print(f"🔥 Testing content generation: {concurrent_requests} concurrent, {total_requests} total requests")
        
        semaphore = asyncio.Semaphore(concurrent_requests)
        
        async def single_request(session, request_id):
            async with semaphore:
                payload = {
                    "content_type": random.choice(["blog", "social", "newsletter", "analysis"]),
                    "topic": f"Market analysis test {request_id}",
                    "platforms": ["test"],
                    "priority": random.choice(["normal", "high"])
                }
                
                start_time = time.time()
                try:
                    async with session.post(f"{self.base_url}/webhook/n8n/trigger", 
                                          json=payload, timeout=30) as response:
                        response_text = await response.text()
                        end_time = time.time()
                        
                        result = TestResult(
                            endpoint="/webhook/n8n/trigger",
                            response_time=end_time - start_time,
                            status_code=response.status,
                            success=response.status == 200,
                            timestamp=datetime.now(),
                            payload_size=len(json.dumps(payload)),
                            response_size=len(response_text)
                        )
                        self.results.append(result)
                        return result
                        
                except Exception as e:
                    end_time = time.time()
                    result = TestResult(
                        endpoint="/webhook/n8n/trigger",
                        response_time=end_time - start_time,
                        status_code=0,
                        success=False,
                        timestamp=datetime.now()
                    )
                    self.results.append(result)
                    return result
        
        async with aiohttp.ClientSession() as session:
            tasks = [single_request(session, i) for i in range(total_requests)]
            results = await asyncio.gather(*tasks)
            
        successful = [r for r in results if r.success]
        print(f"✅ Content Generation Test Complete:")
        print(f"   Success Rate: {len(successful)}/{total_requests} ({len(successful)/total_requests*100:.1f}%)")
        print(f"   Avg Response Time: {statistics.mean([r.response_time for r in successful]):.2f}s")
        print(f"   Max Response Time: {max([r.response_time for r in results]):.2f}s")
        
        return results
    
    async def test_fingpt_analysis_load(self, concurrent_requests: int = 20, total_requests: int = 200):
        """Test FinGPT analysis endpoint under load"""
        print(f"🧠 Testing FinGPT analysis: {concurrent_requests} concurrent, {total_requests} total requests")
        
        semaphore = asyncio.Semaphore(concurrent_requests)
        
        async def single_analysis(session, request_id):
            async with semaphore:
                payload = {
                    "market_data": {
                        "stock": random.choice(["RELIANCE", "TCS", "HDFCBANK", "INFY"]),
                        "change_percent": random.uniform(-5, 5),
                        "volume_ratio": random.uniform(0.5, 2.0)
                    },
                    "news_text": f"Test market analysis {request_id} with financial indicators"
                }
                
                start_time = time.time()
                try:
                    async with session.post(f"{self.base_url}/enterprise/analytics/fingpt",
                                          json=payload, timeout=15) as response:
                        response_text = await response.text()
                        end_time = time.time()
                        
                        result = TestResult(
                            endpoint="/enterprise/analytics/fingpt",
                            response_time=end_time - start_time,
                            status_code=response.status,
                            success=response.status == 200,
                            timestamp=datetime.now(),
                            payload_size=len(json.dumps(payload)),
                            response_size=len(response_text)
                        )
                        self.results.append(result)
                        return result
                        
                except Exception as e:
                    end_time = time.time()
                    result = TestResult(
                        endpoint="/enterprise/analytics/fingpt",
                        response_time=end_time - start_time,
                        status_code=0,
                        success=False,
                        timestamp=datetime.now()
                    )
                    self.results.append(result)
                    return result
        
        async with aiohttp.ClientSession() as session:
            tasks = [single_analysis(session, i) for i in range(total_requests)]
            results = await asyncio.gather(*tasks)
        
        successful = [r for r in results if r.success]
        print(f"✅ FinGPT Analysis Test Complete:")
        print(f"   Success Rate: {len(successful)}/{total_requests} ({len(successful)/total_requests*100:.1f}%)")
        print(f"   Avg Response Time: {statistics.mean([r.response_time for r in successful]):.2f}s")
        
        return results
    
    async def test_dashboard_load(self, concurrent_requests: int = 50, total_requests: int = 500):
        """Test enterprise dashboard under load"""
        print(f"📊 Testing enterprise dashboard: {concurrent_requests} concurrent, {total_requests} total requests")
        
        semaphore = asyncio.Semaphore(concurrent_requests)
        
        async def single_dashboard_request(session, request_id):
            async with semaphore:
                start_time = time.time()
                try:
                    async with session.get(f"{self.base_url}/enterprise/dashboard", timeout=10) as response:
                        response_text = await response.text()
                        end_time = time.time()
                        
                        result = TestResult(
                            endpoint="/enterprise/dashboard",
                            response_time=end_time - start_time,
                            status_code=response.status,
                            success=response.status == 200,
                            timestamp=datetime.now(),
                            response_size=len(response_text)
                        )
                        self.results.append(result)
                        return result
                        
                except Exception as e:
                    end_time = time.time()
                    result = TestResult(
                        endpoint="/enterprise/dashboard",
                        response_time=end_time - start_time,
                        status_code=0,
                        success=False,
                        timestamp=datetime.now()
                    )
                    self.results.append(result)
                    return result
        
        async with aiohttp.ClientSession() as session:
            tasks = [single_dashboard_request(session, i) for i in range(total_requests)]
            results = await asyncio.gather(*tasks)
        
        successful = [r for r in results if r.success]
        print(f"✅ Dashboard Test Complete:")
        print(f"   Success Rate: {len(successful)}/{total_requests} ({len(successful)/total_requests*100:.1f}%)")
        print(f"   Avg Response Time: {statistics.mean([r.response_time for r in successful]):.2f}s")
        
        return results
    
    async def test_chatwoot_integration(self, total_conversations: int = 50):
        """Test Chatwoot integration under load"""
        print(f"💬 Testing Chatwoot integration: {total_conversations} conversations")
        
        async def create_conversation(session, conv_id):
            payload = {
                "initial_message": f"Test customer query {conv_id} about market analysis"
            }
            
            start_time = time.time()
            try:
                async with session.post(f"{self.base_url}/enterprise/chatwoot/conversations",
                                      json=payload, timeout=10) as response:
                    response_text = await response.text()
                    end_time = time.time()
                    
                    result = TestResult(
                        endpoint="/enterprise/chatwoot/conversations",
                        response_time=end_time - start_time,
                        status_code=response.status,
                        success=response.status == 201,
                        timestamp=datetime.now(),
                        payload_size=len(json.dumps(payload)),
                        response_size=len(response_text)
                    )
                    self.results.append(result)
                    return result
                    
            except Exception as e:
                end_time = time.time()
                result = TestResult(
                    endpoint="/enterprise/chatwoot/conversations",
                    response_time=end_time - start_time,
                    status_code=0,
                    success=False,
                    timestamp=datetime.now()
                )
                self.results.append(result)
                return result
        
        async with aiohttp.ClientSession() as session:
            tasks = [create_conversation(session, i) for i in range(total_conversations)]
            results = await asyncio.gather(*tasks)
        
        successful = [r for r in results if r.success]
        print(f"✅ Chatwoot Test Complete:")
        print(f"   Success Rate: {len(successful)}/{total_conversations} ({len(successful)/total_conversations*100:.1f}%)")
        print(f"   Avg Response Time: {statistics.mean([r.response_time for r in successful]):.2f}s")
        
        return results
    
    async def run_comprehensive_load_test(self):
        """Run comprehensive load test simulating real-world usage"""
        print("🚀 STARTING COMPREHENSIVE LOAD TEST")
        print("=" * 60)
        
        start_time = time.time()
        
        # Test scenarios based on expected ₹3 crore monthly traffic
        test_scenarios = [
            # Light load - normal operations
            self.test_dashboard_load(concurrent_requests=25, total_requests=100),
            
            # Medium load - FinGPT analysis
            self.test_fingpt_analysis_load(concurrent_requests=15, total_requests=75),
            
            # Heavy load - content generation (most resource intensive)
            self.test_content_generation_load(concurrent_requests=8, total_requests=40),
            
            # Customer interactions
            self.test_chatwoot_integration(total_conversations=30)
        ]
        
        # Run tests in parallel to simulate real load
        print("🔥 Running all tests in parallel...")
        await asyncio.gather(*test_scenarios)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Generate comprehensive report
        self.generate_load_test_report(total_time)
    
    def generate_load_test_report(self, total_test_time: float):
        """Generate comprehensive load test report"""
        
        # Group results by endpoint
        endpoint_stats = {}
        for result in self.results:
            if result.endpoint not in endpoint_stats:
                endpoint_stats[result.endpoint] = []
            endpoint_stats[result.endpoint].append(result)
        
        print("\n📊 COMPREHENSIVE LOAD TEST REPORT")
        print("=" * 60)
        print(f"⏱️  Total Test Duration: {total_test_time:.1f} seconds")
        print(f"📈 Total Requests: {len(self.results)}")
        print(f"✅ Overall Success Rate: {len([r for r in self.results if r.success])}/{len(self.results)} ({len([r for r in self.results if r.success])/len(self.results)*100:.1f}%)")
        
        print("\n📍 Performance by Endpoint:")
        print("-" * 60)
        
        for endpoint, results in endpoint_stats.items():
            successful = [r for r in results if r.success]
            if successful:
                avg_time = statistics.mean([r.response_time for r in successful])
                p95_time = sorted([r.response_time for r in successful])[int(len(successful) * 0.95)]
                max_time = max([r.response_time for r in successful])
                
                print(f"\n🎯 {endpoint}")
                print(f"   Requests: {len(results)}")
                print(f"   Success Rate: {len(successful)}/{len(results)} ({len(successful)/len(results)*100:.1f}%)")
                print(f"   Avg Response: {avg_time:.2f}s")
                print(f"   95th Percentile: {p95_time:.2f}s")
                print(f"   Max Response: {max_time:.2f}s")
                
                if successful:
                    throughput = len(successful) / total_test_time
                    print(f"   Throughput: {throughput:.1f} req/sec")
        
        # System health assessment
        print("\n🏥 SYSTEM HEALTH ASSESSMENT")
        print("-" * 60)
        
        overall_success_rate = len([r for r in self.results if r.success]) / len(self.results) * 100
        avg_response_time = statistics.mean([r.response_time for r in self.results if r.success])
        
        if overall_success_rate >= 95 and avg_response_time <= 5:
            health_status = "🟢 EXCELLENT - Ready for production scale"
        elif overall_success_rate >= 90 and avg_response_time <= 10:
            health_status = "🟡 GOOD - Minor optimizations needed"
        elif overall_success_rate >= 80:
            health_status = "🟠 FAIR - Performance tuning required"
        else:
            health_status = "🔴 CRITICAL - Major issues need resolution"
        
        print(f"Status: {health_status}")
        print(f"Overall Success Rate: {overall_success_rate:.1f}%")
        print(f"Average Response Time: {avg_response_time:.2f}s")
        
        # Scaling recommendations
        print("\n🎯 SCALING RECOMMENDATIONS")
        print("-" * 60)
        
        if avg_response_time > 10:
            print("⚡ High Response Times Detected:")
            print("   - Consider adding more CPU cores")
            print("   - Implement response caching")
            print("   - Add load balancer with multiple instances")
        
        if overall_success_rate < 95:
            print("🔧 Reliability Issues Detected:")
            print("   - Review error logs for failure patterns") 
            print("   - Implement circuit breakers")
            print("   - Add request queuing")
        
        current_throughput = len([r for r in self.results if r.success]) / total_test_time
        estimated_monthly_capacity = current_throughput * 86400 * 30  # req/month
        
        print(f"\n📈 CAPACITY ANALYSIS")
        print(f"   Current Throughput: {current_throughput:.1f} req/sec")
        print(f"   Estimated Monthly Capacity: {estimated_monthly_capacity:,.0f} requests")
        
        # ₹3 crore target analysis
        target_monthly_requests = 500000  # Estimated for ₹3 crore revenue
        capacity_ratio = estimated_monthly_capacity / target_monthly_requests
        
        print(f"   Target Monthly Requests: {target_monthly_requests:,.0f}")
        print(f"   Capacity Ratio: {capacity_ratio:.1f}x")
        
        if capacity_ratio >= 2:
            print("   ✅ System can easily handle ₹3 crore monthly target")
        elif capacity_ratio >= 1:
            print("   ⚠️  System can handle target but may need optimization")
        else:
            print("   ❌ System needs scaling before reaching ₹3 crore target")
        
        # Save detailed report
        with open('load_test_report.json', 'w') as f:
            report_data = {
                'timestamp': datetime.now().isoformat(),
                'total_test_time': total_test_time,
                'total_requests': len(self.results),
                'overall_success_rate': overall_success_rate,
                'average_response_time': avg_response_time,
                'estimated_monthly_capacity': estimated_monthly_capacity,
                'target_capacity_ratio': capacity_ratio,
                'endpoint_stats': {
                    endpoint: {
                        'total_requests': len(results),
                        'successful_requests': len([r for r in results if r.success]),
                        'average_response_time': statistics.mean([r.response_time for r in results if r.success]) if [r for r in results if r.success] else 0
                    }
                    for endpoint, results in endpoint_stats.items()
                }
            }
            json.dump(report_data, f, indent=2)
        
        print(f"\n📄 Detailed report saved to: load_test_report.json")

async def main():
    """Run the load testing suite"""
    tester = LoadTester()
    await tester.run_comprehensive_load_test()

if __name__ == "__main__":
    asyncio.run(main())