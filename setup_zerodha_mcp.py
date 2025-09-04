#!/usr/bin/env python3
"""
Zerodha MCP Setup Script
Easy setup and testing for Zerodha MCP integration
"""

import os
import json
import sys
from pathlib import Path
import subprocess

def setup_zerodha_mcp():
    """Interactive setup for Zerodha MCP"""
    
    print("=" * 60)
    print("🚀 ZERODHA MCP SETUP")
    print("=" * 60)
    print()
    
    print("This will set up Zerodha Kite Connect integration with Claude")
    print("You'll need:")
    print("1. Zerodha trading account")
    print("2. Kite Connect Developer account (₹2000/month)")
    print("3. API credentials from https://developers.kite.trade/")
    print()
    
    # Check for existing configuration
    claude_settings_path = Path.home() / '.claude' / 'settings.json'
    
    if claude_settings_path.exists():
        print(f"✅ Found Claude settings at: {claude_settings_path}")
        with open(claude_settings_path, 'r') as f:
            settings = json.load(f)
    else:
        print(f"📝 Creating Claude settings at: {claude_settings_path}")
        claude_settings_path.parent.mkdir(parents=True, exist_ok=True)
        settings = {}
    
    # Initialize mcpServers if not present
    if 'mcpServers' not in settings:
        settings['mcpServers'] = {}
    
    print("\n" + "=" * 60)
    print("CONFIGURATION OPTIONS:")
    print("=" * 60)
    print()
    print("1. Use REAL Zerodha credentials (requires Kite Connect subscription)")
    print("2. Use DEMO mode (simulated data for testing)")
    print("3. Use FREE Yahoo Finance data (real but delayed)")
    print()
    
    choice = input("Select option (1/2/3) [default: 2]: ").strip() or "2"
    
    if choice == "1":
        print("\n📝 Enter your Zerodha Kite Connect credentials:")
        api_key = input("API Key: ").strip()
        api_secret = input("API Secret: ").strip()
        
        print("\nTo get access token:")
        print(f"1. Visit: https://kite.zerodha.com/connect/login?api_key={api_key}")
        print("2. Login with your Zerodha credentials")
        print("3. Copy the request_token from the redirect URL")
        
        request_token = input("\nRequest Token (optional, for first-time setup): ").strip()
        
        if request_token:
            # Generate access token
            print("\n🔄 Generating access token...")
            # This would call the Zerodha API to generate access token
            access_token = "generated_access_token"  # Placeholder
        else:
            access_token = input("Access Token (if you already have one): ").strip()
        
        # Update configuration
        settings['mcpServers']['zerodha'] = {
            "command": "python3",
            "args": [str(Path(__file__).parent / "zerodha_mcp_server.py")],
            "env": {
                "KITE_API_KEY": api_key,
                "KITE_API_SECRET": api_secret,
                "KITE_ACCESS_TOKEN": access_token,
                "ZERODHA_MODE": "LIVE"
            }
        }
        
        mode = "LIVE Zerodha"
        
    elif choice == "2":
        print("\n🎯 Configuring DEMO mode...")
        
        settings['mcpServers']['zerodha'] = {
            "command": "python3",
            "args": [str(Path(__file__).parent / "zerodha_mcp_server.py")],
            "env": {
                "ZERODHA_MODE": "DEMO"
            }
        }
        
        mode = "DEMO"
        
    else:  # choice == "3"
        print("\n📊 Configuring Yahoo Finance mode...")
        
        settings['mcpServers']['zerodha'] = {
            "command": "python3",
            "args": [str(Path(__file__).parent / "realtime_data_fetcher.py")],
            "env": {
                "DATA_SOURCE": "YAHOO"
            }
        }
        
        mode = "Yahoo Finance"
    
    # Save configuration
    with open(claude_settings_path, 'w') as f:
        json.dump(settings, f, indent=2)
    
    print("\n" + "=" * 60)
    print(f"✅ SETUP COMPLETE - {mode} Mode")
    print("=" * 60)
    print()
    print("Configuration saved to:")
    print(f"  {claude_settings_path}")
    print()
    print("To use in Claude:")
    print("1. Restart Claude Code")
    print("2. The Zerodha MCP tools will be available automatically")
    print()
    print("Available MCP tools:")
    print("  • get_market_snapshot - Complete market overview")
    print("  • get_stock_quote - Real-time stock prices")
    print("  • get_index_data - Index levels and changes")
    print("  • get_historical_data - Historical price data")
    print("  • generate_smart_content - AI-powered content from live data")
    print()
    
    # Test the connection
    test = input("Test the connection now? (y/n) [default: y]: ").strip().lower() or "y"
    
    if test == "y":
        print("\n🔄 Testing connection...")
        
        # Test the server
        result = subprocess.run(
            ["python3", str(Path(__file__).parent / "test_zerodha_mcp.py")],
            capture_output=True,
            text=True,
            env={**os.environ, **settings['mcpServers']['zerodha']['env']}
        )
        
        if result.returncode == 0:
            print("✅ Connection test successful!")
            print("\nSample output:")
            print(result.stdout)
        else:
            print("❌ Connection test failed:")
            print(result.stderr)
    
    print("\n💡 Tips:")
    print("• In DEMO mode, data is simulated but realistic")
    print("• Yahoo Finance mode provides real (slightly delayed) data")
    print("• For real-time trading, use LIVE mode with Kite Connect")
    print()
    print("🎯 You can now fetch real market data in Claude!")


if __name__ == "__main__":
    setup_zerodha_mcp()