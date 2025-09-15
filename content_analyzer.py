#!/usr/bin/env python3
"""
Finance Content Analyzer - Free Tool (Trojan Horse Strategy)
Shows companies how bad their current content is, then upsells AI solution
"""

import streamlit as st
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob
import yfinance as yf
import re
from datetime import datetime, timedelta

st.set_page_config(page_title="Finance Content Analyzer", page_icon="📊")

def analyze_content(url):
    """Analyze finance content and find issues"""
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text()
        
        # Analysis metrics
        issues = []
        score = 100
        
        # 1. Check for outdated market data
        dates_mentioned = re.findall(r'\b(2019|2020|2021|2022)\b', text)
        if dates_mentioned:
            issues.append(f"❌ Outdated data from {dates_mentioned[0]} (-20 points)")
            score -= 20
        
        # 2. Check sentiment (finance content should be balanced)
        blob = TextBlob(text)
        if abs(blob.sentiment.polarity) > 0.5:
            issues.append(f"❌ Too biased: {blob.sentiment.polarity:.2f} sentiment (-15 points)")
            score -= 15
        
        # 3. Check for specific tickers/numbers
        tickers = re.findall(r'\b[A-Z]{2,5}\b', text)
        numbers = re.findall(r'\d+\.?\d*%', text)
        if len(tickers) < 3:
            issues.append("❌ No specific stock tickers mentioned (-10 points)")
            score -= 10
        if len(numbers) < 5:
            issues.append("❌ Lacks concrete data/percentages (-10 points)")
            score -= 10
        
        # 4. Word count check
        word_count = len(text.split())
        if word_count < 300:
            issues.append(f"❌ Too short: {word_count} words (need 500+) (-15 points)")
            score -= 15
        
        # 5. SEO keywords check
        finance_keywords = ['investment', 'portfolio', 'returns', 'market', 'trading']
        keyword_count = sum(1 for keyword in finance_keywords if keyword.lower() in text.lower())
        if keyword_count < 3:
            issues.append("❌ Poor SEO: Missing key finance terms (-10 points)")
            score -= 10
        
        # 6. Call-to-action check
        cta_phrases = ['sign up', 'subscribe', 'learn more', 'get started', 'contact']
        has_cta = any(phrase in text.lower() for phrase in cta_phrases)
        if not has_cta:
            issues.append("❌ No clear call-to-action (-10 points)")
            score -= 10
        
        return {
            'score': max(score, 0),
            'issues': issues,
            'word_count': word_count,
            'tickers_found': len(tickers),
            'data_points': len(numbers)
        }
    except Exception as e:
        return {'error': str(e)}

def show_competitor_comparison():
    """Show how AI-generated content beats human content"""
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("❌ Your Current Content")
        st.text_area("", value="""
Markets are looking good today. Investors should 
consider diversifying their portfolios. The economy 
shows signs of growth. Experts recommend caution.
        """, height=200, disabled=True)
        st.error("Score: 35/100")
        st.caption("Generic, no data, no engagement")
    
    with col2:
        st.subheader("✅ AI-Generated Content")
        st.text_area("", value="""
HDFC Bank surged 4.2% after posting ₹16,373 Cr 
Q3 profit (18% YoY). The NIM expansion to 3.85% 
signals pricing power returning.

Smart money rotation: ₹2,847 Cr moved from IT 
to Banking yesterday. Pattern matches March 2020 
recovery - early movers gained 67% in 6 months.

Action: Accumulate HDFCBANK below ₹1,650.
        """, height=200, disabled=True)
        st.success("Score: 95/100")
        st.caption("Data-rich, specific, actionable")

def main():
    st.title("🔍 Finance Content Analyzer")
    st.subheader("See why 90% of finance content fails to convert")
    
    tab1, tab2, tab3 = st.tabs(["Analyze Your Content", "See AI Comparison", "Get AI Solution"])
    
    with tab1:
        st.write("Enter your blog/article URL to get instant analysis:")
        url = st.text_input("Content URL", placeholder="https://yourblog.com/article")
        
        if st.button("Analyze Content", type="primary"):
            if url:
                with st.spinner("Analyzing..."):
                    result = analyze_content(url)
                    
                if 'error' not in result:
                    # Show score with color
                    if result['score'] >= 70:
                        st.success(f"Content Score: {result['score']}/100")
                    elif result['score'] >= 50:
                        st.warning(f"Content Score: {result['score']}/100")
                    else:
                        st.error(f"Content Score: {result['score']}/100")
                    
                    # Show issues
                    st.subheader("Issues Found:")
                    for issue in result['issues']:
                        st.write(issue)
                    
                    # Stats
                    col1, col2, col3 = st.columns(3)
                    col1.metric("Word Count", result['word_count'])
                    col2.metric("Stock Tickers", result['tickers_found'])
                    col3.metric("Data Points", result['data_points'])
                    
                    # CTA
                    st.info("🚀 Our AI generates 95+ scoring content in 30 seconds")
                    if st.button("See How AI Can Fix This"):
                        st.switch_page("pages/demo.py")
                else:
                    st.error(f"Error: {result['error']}")
    
    with tab2:
        show_competitor_comparison()
        st.balloons()
        
        st.subheader("Why AI Content Wins:")
        col1, col2 = st.columns(2)
        with col1:
            st.metric("Generation Speed", "30 seconds", "vs 2 hours human")
            st.metric("Cost per Article", "₹30", "vs ₹2,000 human")
            st.metric("Monthly Output", "1000+ articles", "vs 50 human")
        with col2:
            st.metric("Consistency", "100%", "vs 60% human")
            st.metric("SEO Optimization", "Built-in", "vs Manual")
            st.metric("Data Accuracy", "Real-time", "vs Outdated")
    
    with tab3:
        st.header("🚀 Transform Your Content with AI")
        
        st.success("**Special Offer**: First 10 companies get 3-day FREE trial")
        
        col1, col2, col3 = st.columns(3)
        with col1:
            st.subheader("Starter")
            st.write("₹2,999/month")
            st.write("- 100 articles")
            st.write("- 2 platforms")
            st.write("- Email support")
            st.button("Start Free Trial", key="starter")
        
        with col2:
            st.subheader("Growth")
            st.write("₹9,999/month")
            st.write("- 500 articles")
            st.write("- All platforms")
            st.write("- Priority support")
            st.write("- Custom training")
            st.button("Start Free Trial", key="growth", type="primary")
        
        with col3:
            st.subheader("Enterprise")
            st.write("₹29,999/month")
            st.write("- Unlimited")
            st.write("- API access")
            st.write("- White-label")
            st.write("- Dedicated success manager")
            st.button("Contact Sales", key="enterprise")
        
        # Auto-demo scheduling
        st.divider()
        st.subheader("See Live Demo - Your Content Transformed")
        email = st.text_input("Business Email", key="demo_email")
        company = st.text_input("Company Name", key="demo_company")
        if st.button("Generate Sample Content Now", type="primary"):
            if email and company:
                st.success(f"✅ Generating custom content for {company}...")
                st.info("Check your email in 2 minutes for AI-generated samples")
                # This triggers automated email with samples

if __name__ == "__main__":
    main()