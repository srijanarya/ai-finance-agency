"""
Master Finance Content Prompt Library
Integrates with existing autonomous agents
"""

class FinanceContentPrompts:
    def __init__(self):
        self.prompts = {
            'market_analysis': self.market_analysis_prompt,
            'linkedin': self.linkedin_prompt,
            'email_campaign': self.email_campaign_prompt,
            'crypto': self.crypto_education_prompt,
            'whitepaper': self.whitepaper_prompt,
            'social_series': self.social_media_series,
            'breaking_news': self.breaking_news_response,
            'compliance_heavy': self.compliance_content,
            'educational': self.educational_series,
            'landing_page': self.landing_page_copy
        }
        
        self.trigger_keywords = {
            'blog': 'market_analysis',
            'article': 'market_analysis',
            'linkedin': 'linkedin',
            'social': 'linkedin',
            'email': 'email_campaign',
            'crypto': 'crypto',
            'bitcoin': 'crypto',
            'whitepaper': 'whitepaper',
            'report': 'whitepaper',
            'breaking': 'breaking_news',
            'compliance': 'compliance_heavy',
            'educational': 'educational',
            'landing': 'landing_page'
        }
    
    def detect_content_type(self, request):
        """Auto-detect content type from request"""
        request_lower = request.lower()
        for keyword, content_type in self.trigger_keywords.items():
            if keyword in request_lower:
                return content_type
        return 'market_analysis'  # default
    
    def market_analysis_prompt(self, topic=None):
        """Generate market analysis blog post"""
        if not topic:
            topic = "current Fed policy and fixed income opportunities"
        
        return f"""
        Generate a comprehensive market analysis blog post about {topic}.
        
        Requirements:
        - 1500 words targeting retail investors
        - Wall Street Journal professional tone
        - Include current market data and statistics
        - Add 3-5 actionable investment strategies
        - Include risk considerations section
        - FINRA compliant disclaimers at the end
        - SEO optimize for 5 relevant keywords
        
        Format:
        1. Compelling headline with number or statistic
        2. Executive summary (2-3 sentences)
        3. Current market analysis with data
        4. Strategic opportunities (3-5 specific strategies)
        5. Risk considerations
        6. Forward outlook
        7. Compliance disclaimer
        
        Tone: Professional yet accessible, data-driven but not overwhelming
        """
    
    def linkedin_prompt(self, topic=None):
        """Generate viral LinkedIn post"""
        if not topic:
            topic = "AI disruption in finance"
        
        return f"""
        Create a viral LinkedIn thought leadership post about {topic}.
        
        Structure:
        1. Hook: Counterintuitive statement or shocking statistic
        2. Personal observation or client story
        3. 3-5 bullet points with specific insights
        4. Contrarian take or unique perspective
        5. Call for engagement (question to audience)
        
        Requirements:
        - Use line breaks for readability
        - Include 1-2 relevant emojis per section
        - Add 5 relevant hashtags at the end
        - Keep under 1300 characters
        - Professional but conversational tone
        
        Goal: Generate discussion and shares among finance professionals
        """
    
    def email_campaign_prompt(self, product=None):
        """Generate 3-email nurture sequence"""
        if not product:
            product = "portfolio management services"
        
        return f"""
        Create a 3-email nurture campaign for {product}.
        
        Email 1 - Awareness:
        - Subject: Question or statistic that creates curiosity
        - Identify problem/pain point
        - Tease solution
        - Soft CTA (learn more)
        
        Email 2 - Consideration:
        - Subject: Specific benefit or number
        - Provide value (tips, strategies, insights)
        - Social proof or case study
        - Stronger CTA (schedule call, see demo)
        
        Email 3 - Decision:
        - Subject: Urgency or personalization
        - Recap value proposition
        - Address objections
        - Clear CTA with incentive
        - P.S. with additional hook
        
        Each email: 150-200 words, mobile-optimized, compliance disclaimer
        """
    
    def crypto_education_prompt(self, topic=None):
        """Generate crypto/DeFi educational content"""
        if not topic:
            topic = "Bitcoin as digital gold"
        
        return f"""
        Create educational content explaining {topic} for traditional finance professionals.
        
        Requirements:
        - Explain complex concepts simply
        - Compare to traditional finance equivalents
        - Include real-world use cases
        - Address common misconceptions
        - Risk warnings and regulatory considerations
        - No hype, purely educational
        
        Structure:
        1. What it is (simple definition)
        2. How it works (technical made simple)
        3. Traditional finance comparison
        4. Practical applications
        5. Risks and considerations
        6. Resources for learning more
        
        Tone: Educational, balanced, compliance-aware
        """
    
    def whitepaper_prompt(self, topic=None):
        """Generate executive whitepaper"""
        if not topic:
            topic = "Portfolio Optimization in the AI Era"
        
        return f"""
        Generate an executive whitepaper outline and introduction for {topic}.
        
        Whitepaper Structure:
        1. Executive Summary (300 words)
        2. Industry Challenge/Problem Statement
        3. Market Research & Data Points
        4. Proposed Solution/Methodology
        5. Case Studies (2-3 examples)
        6. Implementation Roadmap
        7. ROI Analysis
        8. Conclusion & Next Steps
        
        Requirements:
        - Data-driven with citations
        - Professional, authoritative tone
        - Visual recommendations (charts/graphs to include)
        - Actionable insights
        - Target C-suite and decision makers
        
        Generate the executive summary and first two sections
        """
    
    def social_media_series(self, theme=None):
        """Generate week-long social media series"""
        if not theme:
            theme = "5 Days of Smart Investing"
        
        return f"""
        Create a 5-day social media series on {theme}.
        
        Format for each day:
        - Twitter/X thread (3-5 tweets)
        - LinkedIn short post
        - Instagram caption
        - Email newsletter snippet
        
        Day 1: Hook/Problem awareness
        Day 2: Educational insight
        Day 3: Case study/Success story  
        Day 4: Common mistakes to avoid
        Day 5: CTA/Next steps
        
        Requirements:
        - Consistent visual theme suggestions
        - Platform-specific optimization
        - Engagement questions
        - Relevant hashtags
        - Track-able campaign hashtag
        
        Generate all 5 days of content
        """
    
    def breaking_news_response(self, news_event=None):
        """Generate rapid response to market events"""
        if not news_event:
            news_event = "Fed rate decision"
        
        return f"""
        Create rapid response content for {news_event}.
        
        Deliverables:
        1. Client email alert (200 words)
        2. LinkedIn post (immediate reaction)
        3. Twitter thread (market implications)
        4. Blog post outline (detailed analysis)
        
        Requirements:
        - Fact-based, no speculation
        - Clear implications for investors
        - Actionable next steps
        - Compliance-approved language
        - Multiple asset class perspectives
        
        Tone: Calm, authoritative, action-oriented
        """
    
    def compliance_content(self, regulation=None):
        """Generate compliance-focused content"""
        if not regulation:
            regulation = "new SEC cryptocurrency guidelines"
        
        return f"""
        Create compliance-focused content about {regulation}.
        
        Requirements:
        - Plain English explanation
        - Impact on different investor types
        - Required actions/deadlines
        - FAQ section (5-7 questions)
        - Compliance checklist
        - Resources and references
        
        Format:
        1. What changed (summary)
        2. Who is affected
        3. Timeline and deadlines
        4. Required actions
        5. Best practices
        6. Additional resources
        
        Tone: Clear, helpful, authoritative but not legal advice
        """
    
    def educational_series(self, topic=None):
        """Generate educational email course"""
        if not topic:
            topic = "Introduction to Options Trading"
        
        return f"""
        Create a 5-part educational email course on {topic}.
        
        Course Structure:
        
        Email 1: Fundamentals
        - Core concepts explained simply
        - Why it matters to investors
        - Common terminology
        
        Email 2: How It Works
        - Step-by-step process
        - Real examples
        - Visual explanations needed
        
        Email 3: Strategies
        - Beginner strategies
        - Risk management
        - When to use each
        
        Email 4: Common Mistakes
        - What to avoid
        - Real stories/examples
        - Best practices
        
        Email 5: Getting Started
        - Action steps
        - Resources
        - Next learning paths
        
        Each email: 500-700 words, includes homework/action item
        """
    
    def landing_page_copy(self, offer=None):
        """Generate high-converting landing page copy"""
        if not offer:
            offer = "Free Portfolio Analysis"
        
        return f"""
        Create landing page copy for {offer}.
        
        Sections needed:
        
        1. Headline & Subheadline
        - Benefit-focused
        - Specific and measurable
        - Creates urgency
        
        2. Problem Agitation
        - 3 pain points
        - Emotional connection
        - Cost of inaction
        
        3. Solution Presentation
        - How we solve it
        - Unique methodology
        - Why we're different
        
        4. Social Proof
        - 3 testimonials
        - Key statistics
        - Trust badges needed
        
        5. Benefits (not features)
        - 5-7 bullet points
        - Outcome-focused
        - Specific results
        
        6. FAQ Section
        - 5 common objections
        - Clear answers
        - Build trust
        
        7. CTA Sections
        - Primary CTA (top)
        - Secondary CTA (middle)
        - Final CTA (bottom)
        
        Include: Urgency elements, risk reversal, compliance disclaimer
        """