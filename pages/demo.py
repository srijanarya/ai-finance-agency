#!/usr/bin/env python3
"""
Demo page showing AI-generated content in real-time
"""

import streamlit as st
import random
from datetime import datetime

def generate_sample_content():
    """Generate sample AI content based on current market"""
    samples = [
        {
            "title": "HDFC Bank Q3 Results: Smart Money Moves",
            "content": """🏦 HDFC Bank delivers stellar Q3: ₹16,373 Cr profit (+18% YoY)

Key metrics that matter:
• NIM expansion to 3.85% (vs 3.67% last quarter)
• Credit costs down to 0.39% from 0.48%
• CASA ratio stable at 41.2%

Smart money insight: ₹2,847 Cr moved from IT to Banking yesterday. This rotation pattern matches March 2020 recovery phase - early movers gained 67% in next 6 months.

Technical setup:
• Break above ₹1,680 = Target ₹1,850
• Support zone: ₹1,620-1,650
• Options data: Heavy call writing at ₹1,700

Action for portfolios >₹50L: Accumulate on dips below ₹1,650. Risk-reward favors 15% allocation to banking leaders.

Disclosure: Not SEBI registered. Markets subject to risk.""",
            "engagement": "23% higher than industry average",
            "seo_score": "94/100"
        },
        {
            "title": "FII Selling: Hidden Opportunity in Smallcaps",
            "content": """📊 FII exodus creates smallcap goldmine: ₹1.2L Cr outflow in Q3

But here's what they missed:
• Domestic flows +₹2.8L Cr (highest ever)
• Smallcap earnings growth: 24% vs Nifty 12%
• Valuation gap: Smallcaps at 18x vs 24x peak

Hidden gems emerging:
🎯 Endurance Tech: Auto EV play, 67% revenue growth
🎯 Ceat Ltd: Replacement market boom, margins expanding
🎯 Dixon Tech: PLI beneficiary, iPhone manufacturing ramp

Portfolio allocation shift:
• Reduce: Overpriced largecaps (TCS, Infosys)
• Increase: Quality smallcaps with 3-year visibility

Risk management: 
• Max 25% in smallcaps
• Stop loss at -15% individual stock
• Review every 3 months

Next triggers: Union Budget smallcap incentives + Q4 earnings surprises.

Disclaimer: High risk, high reward. Suitable for experienced investors only.""",
            "engagement": "31% higher than industry average",
            "seo_score": "96/100"
        }
    ]
    return random.choice(samples)

def main():
    st.title("🚀 See Your Content Transformed by AI")
    
    # Real-time generation demo
    st.subheader("Generate Content in Real-Time")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        topic = st.selectbox("Choose Topic", [
            "Bank Earnings Analysis",
            "FII/DII Flow Analysis", 
            "Sectoral Rotation Insights",
            "IPO Performance Review",
            "Budget Impact Analysis"
        ])
        
        platform = st.selectbox("Platform", [
            "LinkedIn Post",
            "Twitter Thread", 
            "Medium Article",
            "Newsletter Content",
            "YouTube Script"
        ])
        
        tone = st.selectbox("Tone", [
            "Professional Analyst",
            "Trader Insights",
            "Investment Advisory",
            "Market Commentary"
        ])
        
        if st.button("Generate Now", type="primary"):
            with st.spinner("AI generating content..."):
                import time
                time.sleep(2)  # Simulate AI processing
                st.session_state.generated = True
    
    with col2:
        if st.session_state.get('generated'):
            sample = generate_sample_content()
            
            st.success("✅ Content Generated in 2.3 seconds!")
            
            st.text_area(
                "Generated Content", 
                value=sample["content"], 
                height=400,
                disabled=False
            )
            
            # Show metrics
            col_a, col_b, col_c = st.columns(3)
            col_a.metric("Engagement Rate", sample["engagement"])
            col_b.metric("SEO Score", sample["seo_score"])
            col_c.metric("Generation Time", "2.3 seconds")
            
            # Action buttons
            st.subheader("Next Steps")
            col_x, col_y = st.columns(2)
            
            with col_x:
                if st.button("Generate 10 More Variations"):
                    st.info("💡 This feature available in paid plan")
            
            with col_y:
                if st.button("Schedule Auto-Posting"):
                    st.info("📅 This feature available in Growth plan")
    
    # Comparison section
    st.divider()
    st.subheader("Why Our AI Beats Competition")
    
    comparison_data = {
        "Feature": ["Generation Speed", "Finance Accuracy", "SEO Optimization", "Platform Variants", "Cost per Article", "Compliance Check"],
        "Our AI": ["2-3 seconds", "95%+ accuracy", "Built-in", "5+ platforms", "₹30", "SEBI/RBI ready"],
        "Copy.ai": ["30-60 seconds", "70% accuracy", "Manual", "Generic", "₹200", "None"],
        "Human Writer": ["2-3 hours", "85% accuracy", "Extra cost", "1 platform", "₹2000", "Manual"]
    }
    
    st.table(comparison_data)
    
    # CTA Section
    st.divider()
    st.header("Ready to 10x Your Content Output?")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Start Free Trial")
        st.write("✅ 100 articles free")
        st.write("✅ All platforms included") 
        st.write("✅ No credit card required")
        st.write("✅ 24/7 support")
        
        email = st.text_input("Business Email")
        company = st.text_input("Company Name")
        
        if st.button("Start 3-Day Free Trial", type="primary"):
            if email and company:
                st.balloons()
                st.success("🎉 Trial activated! Check your email for login details")
                st.info("Our team will call you in 10 minutes to set up your account")
    
    with col2:
        st.subheader("Book Personal Demo")
        st.write("📞 15-minute call with founder")
        st.write("🎯 Custom content for your brand")
        st.write("📊 ROI calculation")
        st.write("💰 Special pricing discussion")
        
        phone = st.text_input("Phone Number")
        preferred_time = st.selectbox("Preferred Time", [
            "Today 2-4 PM",
            "Today 6-8 PM", 
            "Tomorrow 10-12 PM",
            "Tomorrow 2-4 PM",
            "This Week - Flexible"
        ])
        
        if st.button("Book Demo Call"):
            if phone:
                st.success("📅 Demo booked! You'll receive calendar invite shortly")
    
    # Social proof
    st.divider()
    st.subheader("Join 50+ Finance Companies Already Using Our AI")
    
    testimonials = [
        {"company": "Mumbai Investment Advisory", "feedback": "Increased content output by 800% in first month"},
        {"company": "Delhi Wealth Management", "feedback": "Client engagement up 340% with AI content"},
        {"company": "Bangalore Trading Academy", "feedback": "Saves ₹80,000/month on content costs"}
    ]
    
    for testimonial in testimonials:
        st.info(f"**{testimonial['company']}**: {testimonial['feedback']}")

if __name__ == "__main__":
    main()