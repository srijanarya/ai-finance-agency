#!/usr/bin/env python3
"""
SAFE Content Generator - NEVER posts inaccurate data
Protects your professional credibility
"""

import os
import json
from datetime import datetime
from typing import Dict, Optional, List
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class SafeContentGenerator:
    """
    Generate content WITHOUT specific numbers
    Focus on trends, strategies, and insights
    """
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.approval_required = True  # ALWAYS require approval
        
    def generate_safe_content(self, platform: str, content_type: str) -> Dict:
        """Generate content WITHOUT specific market numbers"""
        
        current_date = datetime.now().strftime("%B %Y")
        
        # SAFE content themes that don't require specific numbers
        safe_themes = {
            'market_insight': self._market_insight_prompt,
            'investment_strategy': self._investment_strategy_prompt,
            'financial_wisdom': self._financial_wisdom_prompt,
            'risk_management': self._risk_management_prompt,
            'sector_analysis': self._sector_analysis_prompt,
            'trading_psychology': self._trading_psychology_prompt,
            'portfolio_tips': self._portfolio_tips_prompt,
            'tax_planning': self._tax_planning_prompt,
        }
        
        # Pick a safe theme
        import random
        theme_key = random.choice(list(safe_themes.keys()))
        prompt_func = safe_themes[theme_key]
        
        prompt = prompt_func(platform, current_date)
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        
        # VALIDATION: Check for any specific numbers
        validation = self._validate_content(content)
        
        return {
            'content': content,
            'theme': theme_key,
            'platform': platform,
            'safe': validation['safe'],
            'issues': validation['issues'],
            'requires_approval': True  # ALWAYS TRUE
        }
    
    def _market_insight_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post about market insights for {date}.

STRICT RULES:
- NO specific index values (don't mention exact Nifty/Sensex numbers)
- NO specific percentages or rates
- Use phrases like "current levels", "recent highs", "support zone"
- Focus on TRENDS and PATTERNS, not numbers
- Talk about sectors, not specific stocks
- Discuss strategies, not predictions

Example good phrases:
- "Markets testing key resistance levels"
- "Banking sector showing strength"
- "IT stocks consolidating after recent rally"
- "Volatility creating opportunities"

Write a professional, insightful post without ANY specific numbers."""

    def _investment_strategy_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post about investment strategy for {date}.

Focus on:
- Asset allocation principles
- Diversification strategies
- Long-term vs short-term approaches
- Risk-reward balance
- Market cycles understanding

NO specific numbers, rates, or index values.
Keep it strategic and educational."""

    def _financial_wisdom_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post sharing financial wisdom for {date}.

Topics:
- Timeless investing principles
- Behavioral finance insights
- Common investor mistakes to avoid
- Building wealth systematically
- Power of compounding

NO market data or specific numbers.
Focus on evergreen wisdom."""

    def _risk_management_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post about risk management for {date}.

Cover:
- Position sizing strategies
- Stop-loss importance
- Portfolio hedging concepts
- Risk-reward ratios
- Capital preservation

NO specific market levels or percentages.
Keep it educational and practical."""

    def _sector_analysis_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post analyzing market sectors for {date}.

Discuss:
- Sector rotation patterns
- Defensive vs growth sectors
- Emerging opportunities
- Structural trends (digitalization, green energy, etc.)

Use relative terms like "outperforming", "lagging", "consolidating"
NO specific numbers or percentages."""

    def _trading_psychology_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post about trading psychology for {date}.

Topics:
- Emotional discipline
- FOMO and fear management
- Patience in trading
- Decision-making frameworks
- Learning from mistakes

NO market data. Focus on mindset and behavior."""

    def _portfolio_tips_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post with portfolio management tips for {date}.

Include:
- Rebalancing strategies
- Portfolio review checklist
- Diversification across asset classes
- Goal-based investing
- Regular monitoring importance

NO specific allocations or percentages.
Keep it principle-based."""

    def _tax_planning_prompt(self, platform: str, date: str) -> str:
        return f"""Write a {platform} post about tax-efficient investing for {date}.

Discuss:
- Tax-saving investment options (general)
- Importance of tax planning
- Long-term vs short-term tax implications
- Record keeping for taxes
- Year-end tax planning tips

NO specific tax rates or amounts.
Keep it educational about concepts."""
    
    def _validate_content(self, content: str) -> Dict:
        """Validate content for safety"""
        issues = []
        
        # Check for specific numbers that could be wrong
        danger_patterns = [
            r'\d+,\d{3}',  # Numbers with commas like 26,000
            r'\d+\.\d+%',  # Specific percentages like 6.5%
            r'₹\d+',  # Specific rupee amounts
            r'Nifty.*\d{4,}',  # Nifty with specific numbers
            r'Sensex.*\d{4,}',  # Sensex with specific numbers
            r'[^0-9]\d{5,}[^0-9]',  # Large numbers (not years)
            r'\b\d+%',  # Specific percentage numbers
        ]
        
        import re
        for pattern in danger_patterns:
            if re.search(pattern, content):
                issues.append(f"Contains specific numbers (pattern: {pattern})")
        
        # Check for outdated references
        if '2023' in content or '2024' in content:
            issues.append("Contains potentially outdated year references")
        
        # Check for visual placeholders
        if 'Visual:' in content or '[' in content:
            issues.append("Contains placeholder text")
        
        return {
            'safe': len(issues) == 0,
            'issues': issues
        }


class ManualApprovalGate:
    """Require manual approval before posting"""
    
    def __init__(self):
        self.pending_file = 'pending_approval.json'
    
    def add_for_approval(self, content: Dict) -> str:
        """Add content for manual approval"""
        
        # Load existing pending
        if os.path.exists(self.pending_file):
            with open(self.pending_file, 'r') as f:
                pending = json.load(f)
        else:
            pending = []
        
        # Add new content
        approval_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        content['approval_id'] = approval_id
        content['timestamp'] = datetime.now().isoformat()
        content['status'] = 'pending'
        
        pending.append(content)
        
        # Save
        with open(self.pending_file, 'w') as f:
            json.dump(pending, f, indent=2)
        
        return approval_id
    
    def show_pending(self) -> List[Dict]:
        """Show all pending content"""
        if not os.path.exists(self.pending_file):
            return []
        
        with open(self.pending_file, 'r') as f:
            pending = json.load(f)
        
        return [p for p in pending if p['status'] == 'pending']
    
    def approve_content(self, approval_id: str) -> bool:
        """Approve specific content"""
        if not os.path.exists(self.pending_file):
            return False
        
        with open(self.pending_file, 'r') as f:
            pending = json.load(f)
        
        for item in pending:
            if item['approval_id'] == approval_id:
                item['status'] = 'approved'
                item['approved_at'] = datetime.now().isoformat()
                
                with open(self.pending_file, 'w') as f:
                    json.dump(pending, f, indent=2)
                return True
        
        return False


def main():
    """Test safe content generation"""
    
    print("=" * 60)
    print("🛡️ SAFE CONTENT GENERATOR")
    print("Protecting your professional credibility")
    print("=" * 60)
    
    generator = SafeContentGenerator()
    approval = ManualApprovalGate()
    
    # Generate safe content
    platforms = ['linkedin', 'twitter', 'telegram']
    
    for platform in platforms:
        print(f"\n📝 Generating for {platform}...")
        result = generator.generate_safe_content(platform, 'market_insight')
        
        if result['safe']:
            print("✅ Content is SAFE (no specific numbers)")
            print(f"Theme: {result['theme']}")
            print(f"\nContent preview:")
            print(result['content'][:300] + "...")
            
            # Add for approval
            approval_id = approval.add_for_approval(result)
            print(f"\n⏳ Added for manual approval (ID: {approval_id})")
        else:
            print("❌ Content has issues:")
            for issue in result['issues']:
                print(f"  - {issue}")
    
    # Show pending
    print("\n" + "=" * 60)
    print("📋 PENDING APPROVALS")
    print("=" * 60)
    
    pending = approval.show_pending()
    if pending:
        for item in pending:
            print(f"\nID: {item['approval_id']}")
            print(f"Platform: {item['platform']}")
            print(f"Theme: {item['theme']}")
            print(f"Preview: {item['content'][:100]}...")
            print("\n👉 To approve, run: python approve_content.py " + item['approval_id'])
    else:
        print("No pending content")


if __name__ == "__main__":
    main()