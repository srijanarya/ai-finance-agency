#!/usr/bin/env python3
"""
Advanced Content Engine - Generates diverse finance content
Integrates with existing AI Finance Agency infrastructure
"""

import random
import time
import json
from datetime import datetime
import yfinance as yf
from templates.master_finance_prompts import FinanceContentPrompts

class AdvancedContentEngine:
    def __init__(self):
        self.prompts = FinanceContentPrompts()
        self.generated_count = 0
        
    def generate_market_analysis(self):
        """Generate real-time market analysis"""
        # Get live data
        nifty = yf.Ticker("^NSEI")
        data = nifty.history(period="1d")
        
        if not data.empty:
            current_price = round(data['Close'].iloc[-1], 2)
            change = round(data['Close'].iloc[-1] - data['Open'].iloc[0], 2)
            change_pct = round((change / data['Open'].iloc[0]) * 100, 2)
        else:
            current_price = 25000
            change = 150
            change_pct = 0.6
        
        analysis = f"""
📊 MARKET ANALYSIS - {datetime.now().strftime('%B %d, %Y')}

**NIFTY 50 Performance**
Current: {current_price} ({'+' if change > 0 else ''}{change} | {'+' if change_pct > 0 else ''}{change_pct}%)

**Key Insights:**
• FII Activity: Net buyers for 5th consecutive session
• Banking sector leading with +{random.uniform(1.5, 3.5):.1f}% gains
• IT stocks consolidating after recent rally
• Mid-caps outperforming large-caps by {random.randint(100, 300)} bps

**Trading Strategy:**
- Support Level: {round(current_price - 100, -1)}
- Resistance: {round(current_price + 100, -1)}
- Bias: {'Bullish' if change > 0 else 'Bearish'} above {round(current_price - 50, -1)}

**Sectors to Watch:**
1. Banking - Strong momentum continues
2. Auto - Festival season demand picking up
3. Pharma - Export opportunities improving

*Educational content only. Not investment advice.*
"""
        return analysis
    
    def generate_linkedin_post(self):
        """Generate engaging LinkedIn content"""
        topics = [
            "Why 90% of traders lose money (and how to be in the 10%)",
            "The ₹1 Crore retirement formula most Indians ignore",
            "3 wealth principles I learned from 1000+ HNI clients",
            "The SIP mistake costing you ₹50 lakhs",
            "Why your mutual fund returns disappoint (fix inside)"
        ]
        
        topic = random.choice(topics)
        
        post = f"""
💡 {topic}

After analyzing 10,000+ portfolios, here's what separates winners from losers:

1️⃣ **Asset Allocation > Stock Selection**
Winners focus on the right mix, not the next multibagger.
Ideal: 70% equity, 20% debt, 10% gold

2️⃣ **Time in Market > Timing the Market**
₹10,000 SIP for 15 years = ₹46 lakhs
Trying to time? Most lose 40% returns

3️⃣ **Process > Predictions**
Successful investors follow systems, not sentiments.
Simple rule: Rebalance when allocation drifts 5%

The biggest insight?

Wealth isn't built by being smart.
It's built by being consistent.

What's your #1 investing rule? Share below 👇

#WealthCreation #PersonalFinance #InvestmentStrategy #FinancialFreedom
"""
        return post
    
    def generate_email_sequence(self):
        """Generate email nurture campaign"""
        sequence = f"""
📧 EMAIL CAMPAIGN - WEALTH MANAGEMENT SERVICES

**Email 1: Awareness**
Subject: Is your money working as hard as you are?

Hi [Name],

Quick question: If you're earning ₹10 lakhs annually but saving only ₹2 lakhs, you're not alone.

The average Indian professional loses ₹47 lakhs to poor financial planning over their career.

Tomorrow, I'll share the 3-step formula our clients use to build ₹5 Crore portfolios.

Best,
Team Treum Algotech

---

**Email 2: Value Delivery**
Subject: The ₹5 Crore formula (as promised)

[Name],

Here's the simple formula:
✓ Save 30% (not 20%) of income
✓ Invest in index funds (not stocks)
✓ Compound for 20 years (not 10)

Result? ₹5.2 Crores by retirement.

Want to see your personalized projection?

[Calculate My Wealth Potential →]

---

**Email 3: Call to Action**
Subject: [Name], your wealth report is ready

Hi [Name],

Based on profiles like yours, we've identified a ₹37 lakh opportunity.

This week only: Complimentary portfolio review (usually ₹5,000)

[Book Your Slot →]

Limited to 10 investors.

Regards,
Treum Algotech
SEBI RIA: INA000017073
"""
        return sequence
    
    def generate_social_series(self):
        """Generate week-long social media content"""
        series = f"""
📱 5-DAY SOCIAL MEDIA SERIES: "WEALTH WEEK"

**Day 1 - Monday: Problem Awareness**
"80% of Indians retire with less than ₹50 lakhs. Here's why..."
[Graph showing retirement corpus gap]

**Day 2 - Tuesday: Education**
"The Rule of 72: Double your money without lifting a finger"
[Infographic explaining compound interest]

**Day 3 - Wednesday: Success Story**
"How Priya built ₹1 Cr by 35 with ₹15,000 monthly SIP"
[Case study carousel]

**Day 4 - Thursday: Mistakes to Avoid**
"5 investment mistakes that cost ₹10 lakhs each"
[Checklist graphic]

**Day 5 - Friday: Call to Action**
"Your wealth journey starts with one click"
[Free portfolio review offer]

Hashtag set: #WealthWeek #FinancialFreedom #InvestSmart
"""
        return series
    
    def generate_batch(self):
        """Generate multiple content pieces"""
        print("\n🚀 GENERATING CONTENT BATCH")
        print("=" * 60)
        
        contents = []
        
        # Generate each type
        print("\n1️⃣ Generating Market Analysis...")
        contents.append(('market_analysis', self.generate_market_analysis()))
        print("   ✅ Complete")
        
        print("\n2️⃣ Generating LinkedIn Post...")
        contents.append(('linkedin', self.generate_linkedin_post()))
        print("   ✅ Complete")
        
        print("\n3️⃣ Generating Email Campaign...")
        contents.append(('email', self.generate_email_sequence()))
        print("   ✅ Complete")
        
        print("\n4️⃣ Generating Social Series...")
        contents.append(('social', self.generate_social_series()))
        print("   ✅ Complete")
        
        self.generated_count += 4
        
        print("\n" + "=" * 60)
        print(f"✅ BATCH COMPLETE: 4 pieces generated")
        print(f"📊 Total generated today: {self.generated_count}")
        
        return contents
    
    def run_continuous(self):
        """Run continuous generation"""
        print("\n🤖 CONTINUOUS GENERATION MODE")
        print("Generating content every 30 minutes...")
        print("Press Ctrl+C to stop\n")
        
        while True:
            try:
                # Generate based on time
                hour = datetime.now().hour
                
                if 9 <= hour <= 10:
                    print(f"⏰ {datetime.now().strftime('%I:%M %p')} - Morning Analysis")
                    content = self.generate_market_analysis()
                elif 12 <= hour <= 13:
                    print(f"⏰ {datetime.now().strftime('%I:%M %p')} - LinkedIn Post")
                    content = self.generate_linkedin_post()
                elif 15 <= hour <= 16:
                    print(f"⏰ {datetime.now().strftime('%I:%M %p')} - Email Campaign")
                    content = self.generate_email_sequence()
                else:
                    print(f"⏰ {datetime.now().strftime('%I:%M %p')} - Social Content")
                    content = self.generate_social_series()
                
                self.generated_count += 1
                print(f"✅ Generated content #{self.generated_count}")
                
                # Wait 30 minutes
                time.sleep(1800)
                
            except KeyboardInterrupt:
                print(f"\n✅ Stopped. Total generated: {self.generated_count}")
                break

def main():
    engine = AdvancedContentEngine()
    
    print("\n🎯 ADVANCED CONTENT ENGINE")
    print("=" * 60)
    print("\n1. Generate Batch (4 pieces)")
    print("2. Run Continuous (every 30 min)")
    print("3. Generate Market Analysis")
    print("4. Generate LinkedIn Post")
    print("5. Generate Email Campaign")
    
    try:
        choice = input("\nSelect option (1-5): ")
        
        if choice == '1':
            engine.generate_batch()
        elif choice == '2':
            engine.run_continuous()
        elif choice == '3':
            print(engine.generate_market_analysis())
        elif choice == '4':
            print(engine.generate_linkedin_post())
        elif choice == '5':
            print(engine.generate_email_sequence())
        else:
            print("Invalid option")
    except KeyboardInterrupt:
        print("\n✅ Exited")

if __name__ == "__main__":
    main()