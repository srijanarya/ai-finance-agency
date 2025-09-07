#!/usr/bin/env python3
"""
ELITE CONTENT PRODUCTION SYSTEM
Generates high-quality finance content that converts
"""

import os
import sys
import json
import random
import sqlite3
import requests
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("❌ ERROR: No OpenAI API key found in .env")
    sys.exit(1)

# Master Finance Prompt - The Secret Sauce
MASTER_FINANCE_PROMPT = """You are the lovechild of Michael Burry's analytical mind and Dave Portnoy's viral energy.

VOICE RULES:
- Write like you're texting a smart friend who just asked for the inside scoop
- Use numbers that make people screenshot your content
- Drop knowledge bombs casually, like you're at a bar
- Be the person traders quote in their group chats

CONTENT FORMULA:
1. HOOK (10 words max): Start with "Holy shit" moment
   Example: "JPMorgan just did something they haven't done since 2008"

2. CONTEXT (2 sentences): Why this matters RIGHT NOW
   Example: "While everyone's watching the Fed, smart money is quietly rotating into [SECTOR]"

3. THE JUICE (3-4 points): Insider-level insights
   - Data point nobody's talking about
   - Connection to something unexpected
   - What happens next (specific prediction)
   - Action item for tomorrow morning

4. MONEY SHOT: One calculation/stat that breaks brains
   Example: "If you'd bought X instead of Y, you'd have Z% more"

5. CLOSER: Challenge or question that sparks engagement
   Example: "Who else is seeing this pattern?"

MANDATORY INGREDIENTS:
✓ Reference something that happened in last 48 hours
✓ Include actual ticker symbols or specific names
✓ Add one contrarian take that pisses off CNBC
✓ Use trader slang naturally (prints, tape, smart/dumb money)
✓ Include emoji strategically (max 3-4)

TOPIC: {topic}
PLATFORM: {platform}
TONE: {tone}

Remember: Every sentence should make someone want to either:
1. Share it immediately
2. Argue with you
3. Ask "how did you know that?"

Now write content that gets featured on r/wallstreetbets AND taken seriously by hedge funds."""

# Platform-specific configurations
PLATFORM_CONFIGS = {
    "linkedin": {
        "max_length": 3000,
        "tone": "Professional edge - like a Goldman analyst who quit to start a fund",
        "structure": "Hook → 3 insights → CTA",
        "emojis": "📊 💡 🎯 🔥"
    },
    "twitter": {
        "max_length": 280,
        "tone": "Punchy and controversial - make Elon retweet this",
        "structure": "Hot take + proof + mic drop",
        "emojis": "🚨 📈 💰"
    },
    "medium": {
        "max_length": 2000,
        "tone": "Deep dive with swagger - Vice meets Bloomberg",
        "structure": "Story → Data → Insight → Action",
        "emojis": "minimal"
    }
}

# Content enhancers for extra spice
SPICE_INJECTORS = [
    "\n\nP.S. - {contrarian_take}",
    "\n\nBTW: Smart money is already {action}. Just saying.",
    "\n\nUnpopular opinion: {hot_take}",
    "\n\nReminder: The same people telling you {common_advice} sold the bottom in March 2020.",
    "\n\nFun fact: {shocking_stat}"
]

def generate_topic():
    """Generate trending finance topics"""
    base_topics = [
        "Why {company} insiders are dumping shares (and what they know)",
        "The {amount} billion trade everyone's missing in {sector}",
        "How to spot the next {percentage}% move before algo traders",
        "{indicator} just flashed for the first time since {year}",
        "The Fed isn't telling you about {hidden_data}",
        "Why {smart_investor} is loading up on {asset}",
        "{country}'s secret move that changes everything for {market}"
    ]
    
    variables = {
        "company": ["Tesla", "Apple", "Goldman", "Nvidia", "Meta"],
        "amount": ["50", "100", "200", "500"],
        "sector": ["semiconductors", "biotech", "EVs", "AI stocks", "energy"],
        "percentage": ["50", "100", "200", "1000"],
        "indicator": ["VIX", "Dollar Index", "Bond yields", "Gold/Silver ratio"],
        "year": ["2008", "2020", "2000", "1987"],
        "hidden_data": ["repo markets", "reverse repo", "option flows", "dark pools"],
        "smart_investor": ["Buffett", "Dalio", "Ackman", "Burry", "Wood"],
        "asset": ["uranium", "copper", "volatility", "small caps", "emerging markets"],
        "country": ["China", "Saudi", "Russia", "Japan", "Switzerland"],
        "market": ["oil", "treasuries", "crypto", "forex", "commodities"]
    }
    
    topic_template = random.choice(base_topics)
    
    # Fill in variables
    for var, options in variables.items():
        if "{" + var + "}" in topic_template:
            topic_template = topic_template.replace("{" + var + "}", random.choice(options))
    
    return topic_template

def generate_elite_content(topic=None, platform="linkedin"):
    """Generate content that makes Jim Cramer jealous"""
    
    if not topic:
        topic = generate_topic()
    
    config = PLATFORM_CONFIGS.get(platform, PLATFORM_CONFIGS["linkedin"])
    
    # Build the prompt
    prompt = MASTER_FINANCE_PROMPT.format(
        topic=topic,
        platform=platform,
        tone=config["tone"]
    )
    
    # Add platform-specific requirements
    prompt += f"\n\nPLATFORM REQUIREMENTS:\n"
    prompt += f"- Maximum {config['max_length']} characters\n"
    prompt += f"- Structure: {config['structure']}\n"
    prompt += f"- Emoji style: {config['emojis']}\n"
    
    # Add spice
    spice = random.choice(SPICE_INJECTORS)
    spice_vars = {
        "contrarian_take": "The rally everyone's expecting? It's the trap.",
        "action": "moving to cash. Draw your own conclusions",
        "hot_take": "This bubble makes 2021 look conservative",
        "common_advice": "'buy the dip'",
        "shocking_stat": "90% of retail is on the wrong side of this trade"
    }
    
    for var, value in spice_vars.items():
        spice = spice.replace("{" + var + "}", value)
    
    prompt += f"\nAdd this spice at the end: {spice}"
    
    try:
        # Call OpenAI API
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "gpt-4",
            "messages": [
                {"role": "system", "content": "You are an elite finance content creator."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1000,
            "temperature": 0.8
        }
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            
            # Save to database
            save_content(topic, content, platform)
            
            return {
                "status": "success",
                "topic": topic,
                "content": content,
                "platform": platform,
                "timestamp": datetime.now().isoformat()
            }
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
            # Fallback to simpler model if GPT-4 fails
            data["model"] = "gpt-3.5-turbo"
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                save_content(topic, content, platform)
                return {
                    "status": "success",
                    "topic": topic,
                    "content": content,
                    "platform": platform,
                    "model": "gpt-3.5-turbo",
                    "timestamp": datetime.now().isoformat()
                }
                
    except Exception as e:
        print(f"❌ Generation failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "topic": topic,
            "platform": platform
        }

def save_content(topic, content, platform):
    """Save content to database"""
    try:
        conn = sqlite3.connect('content.db', timeout=30.0)
        conn.execute("PRAGMA journal_mode=WAL")
        
        # Create table if not exists
        conn.execute("""
            CREATE TABLE IF NOT EXISTS content_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                content_type TEXT,
                title TEXT,
                content TEXT,
                platform TEXT,
                post_id TEXT,
                engagement_score REAL DEFAULT 0,
                metadata TEXT
            )
        """)
        
        # Insert content
        metadata = json.dumps({
            "quality": "elite",
            "generated_at": datetime.now().isoformat(),
            "word_count": len(content.split())
        })
        
        conn.execute("""
            INSERT INTO content_history 
            (content_type, title, content, platform, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, ("finance_article", topic, content, platform, metadata))
        
        conn.commit()
        conn.close()
        print(f"✅ Saved to database")
        
    except Exception as e:
        print(f"⚠️ Database error: {e}")

def generate_batch(count=5):
    """Generate multiple pieces of content"""
    results = []
    platforms = ["linkedin", "twitter", "linkedin", "medium", "linkedin"]  # More LinkedIn
    
    for i in range(count):
        platform = platforms[i % len(platforms)]
        print(f"\n📝 Generating {platform} content {i+1}/{count}...")
        
        result = generate_elite_content(platform=platform)
        results.append(result)
        
        if result["status"] == "success":
            print(f"✅ Generated: {len(result['content'])} chars")
            print(f"📌 Topic: {result['topic'][:50]}...")
        
    return results

def main():
    """Main execution"""
    print("=" * 60)
    print("🚀 ELITE CONTENT PRODUCTION SYSTEM")
    print("=" * 60)
    
    # Test single generation
    print("\n📊 Generating test content for LinkedIn...")
    result = generate_elite_content(platform="linkedin")
    
    if result["status"] == "success":
        print("\n✅ SUCCESS! Content generated:")
        print("-" * 40)
        print(result["content"][:500] + "...")
        print("-" * 40)
        
        # Save to file for immediate use
        output_file = Path("elite_content_ready.json")
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"\n📁 Full content saved to: {output_file}")
        print("\n🎯 NEXT STEPS:")
        print("1. Review content in elite_content_ready.json")
        print("2. Post immediately: python3 linkedin_simple_post.py")
        print("3. Start scheduler: python3 bulletproof_scheduler.py")
        
    else:
        print(f"\n❌ Generation failed: {result.get('error', 'Unknown error')}")
        print("\nTroubleshooting:")
        print("1. Check your OpenAI API key in .env")
        print("2. Ensure you have API credits")
        print("3. Try again in 60 seconds")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()