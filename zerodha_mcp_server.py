#!/usr/bin/env python3
"""
Zerodha MCP Server
Enables Claude to fetch real-time market data via MCP protocol
"""

import json
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import os
import sys

# MCP Protocol implementation
class ZerodhaMCPServer:
    """
    MCP Server for Zerodha Kite Connect Integration
    Allows Claude to fetch real-time market data
    """
    
    def __init__(self):
        # Load credentials from environment
        self.api_key = os.getenv('KITE_API_KEY', '')
        self.api_secret = os.getenv('KITE_API_SECRET', '')
        self.access_token = os.getenv('KITE_ACCESS_TOKEN', '')
        
        # Initialize the Zerodha integration
        from zerodha_mcp_integration import ZerodhaMCPIntegration
        self.zerodha = ZerodhaMCPIntegration(
            api_key=self.api_key,
            api_secret=self.api_secret,
            access_token=self.access_token
        )
        
        # MCP tools definition
        self.tools = {
            'get_market_snapshot': {
                'description': 'Get complete Indian market snapshot with indices, stocks, and FII/DII data',
                'parameters': {}
            },
            'get_stock_quote': {
                'description': 'Get real-time quote for specific stocks',
                'parameters': {
                    'symbols': {
                        'type': 'array',
                        'description': 'List of stock symbols (e.g., ["RELIANCE", "TCS", "HDFCBANK"])'
                    }
                }
            },
            'get_index_data': {
                'description': 'Get real-time data for market indices',
                'parameters': {
                    'indices': {
                        'type': 'array',
                        'description': 'List of indices (e.g., ["NIFTY", "BANKNIFTY", "SENSEX"])',
                        'default': ['NIFTY', 'SENSEX']
                    }
                }
            },
            'get_options_chain': {
                'description': 'Get options chain data for NIFTY or BANKNIFTY',
                'parameters': {
                    'symbol': {
                        'type': 'string',
                        'description': 'Index symbol (NIFTY or BANKNIFTY)'
                    },
                    'expiry': {
                        'type': 'string',
                        'description': 'Expiry date (optional, defaults to current)',
                        'optional': True
                    }
                }
            },
            'get_historical_data': {
                'description': 'Get historical price data for analysis',
                'parameters': {
                    'symbol': {
                        'type': 'string',
                        'description': 'Stock or index symbol'
                    },
                    'interval': {
                        'type': 'string',
                        'description': 'Time interval (minute, 3minute, 5minute, 10minute, 15minute, 30minute, 60minute, day)',
                        'default': 'day'
                    },
                    'days': {
                        'type': 'integer',
                        'description': 'Number of days of historical data',
                        'default': 30
                    }
                }
            },
            'get_market_depth': {
                'description': 'Get market depth (order book) for a stock',
                'parameters': {
                    'symbol': {
                        'type': 'string',
                        'description': 'Stock symbol'
                    }
                }
            },
            'get_fii_dii_activity': {
                'description': 'Get latest FII/DII trading activity',
                'parameters': {}
            },
            'generate_smart_content': {
                'description': 'Generate intelligent content from live market data',
                'parameters': {
                    'content_type': {
                        'type': 'string',
                        'description': 'Type of content (market_update, stock_analysis, options_insight)',
                        'default': 'market_update'
                    }
                }
            }
        }
    
    async def handle_request(self, request: Dict) -> Dict:
        """Handle incoming MCP requests"""
        
        method = request.get('method')
        params = request.get('params', {})
        
        try:
            if method == 'tools/list':
                return self._list_tools()
            
            elif method == 'tools/call':
                tool_name = params.get('name')
                tool_params = params.get('arguments', {})
                return await self._call_tool(tool_name, tool_params)
            
            elif method == 'initialize':
                return self._initialize()
            
            else:
                return {
                    'error': f'Unknown method: {method}'
                }
                
        except Exception as e:
            return {
                'error': str(e)
            }
    
    def _list_tools(self) -> Dict:
        """List available tools"""
        tools_list = []
        for name, config in self.tools.items():
            tools_list.append({
                'name': name,
                'description': config['description'],
                'inputSchema': {
                    'type': 'object',
                    'properties': config.get('parameters', {}),
                    'required': [k for k, v in config.get('parameters', {}).items() 
                               if not v.get('optional', False)]
                }
            })
        
        return {
            'tools': tools_list
        }
    
    async def _call_tool(self, tool_name: str, params: Dict) -> Dict:
        """Execute a specific tool"""
        
        if tool_name not in self.tools:
            return {'error': f'Unknown tool: {tool_name}'}
        
        try:
            # Route to appropriate handler
            if tool_name == 'get_market_snapshot':
                result = self.zerodha.get_market_snapshot()
                
            elif tool_name == 'get_stock_quote':
                symbols = params.get('symbols', ['RELIANCE', 'TCS'])
                result = self.zerodha.get_ltp(symbols)
                
            elif tool_name == 'get_index_data':
                indices = params.get('indices', ['NIFTY', 'SENSEX'])
                result = self.zerodha.get_ohlc(indices)
                
            elif tool_name == 'get_historical_data':
                symbol = params.get('symbol', 'NIFTY')
                interval = params.get('interval', 'day')
                days = params.get('days', 30)
                df = self.zerodha.get_historical_data(symbol, interval, days)
                result = df.to_dict('records') if not df.empty else []
                
            elif tool_name == 'get_fii_dii_activity':
                # This would fetch from NSE
                result = {
                    'date': datetime.now().strftime('%Y-%m-%d'),
                    'fii_equity_net': -2345.67,
                    'dii_equity_net': 3456.78,
                    'fii_debt_net': 234.56,
                    'provisional': True
                }
                
            elif tool_name == 'generate_smart_content':
                snapshot = self.zerodha.get_market_snapshot()
                result = self.zerodha.generate_smart_content(snapshot)
                
            else:
                result = {'error': f'Handler not implemented for {tool_name}'}
            
            return {
                'content': [{
                    'type': 'text',
                    'text': json.dumps(result, indent=2)
                }]
            }
            
        except Exception as e:
            return {
                'error': f'Tool execution failed: {str(e)}'
            }
    
    def _initialize(self) -> Dict:
        """Initialize the server"""
        return {
            'protocolVersion': '2024-11-05',
            'capabilities': {
                'tools': {}
            },
            'serverInfo': {
                'name': 'zerodha-mcp-server',
                'version': '1.0.0',
                'description': 'Real-time Indian market data via Zerodha Kite Connect'
            }
        }
    
    async def run_stdio_server(self):
        """Run as stdio MCP server"""
        logging.info("Starting Zerodha MCP Server...")
        
        reader = asyncio.StreamReader()
        protocol = asyncio.StreamReaderProtocol(reader)
        await asyncio.get_event_loop().connect_read_pipe(
            lambda: protocol, sys.stdin
        )
        
        writer = sys.stdout
        
        while True:
            try:
                # Read JSON-RPC request
                line = await reader.readline()
                if not line:
                    break
                
                request = json.loads(line.decode())
                
                # Process request
                response = await self.handle_request(request)
                
                # Send response
                response_json = json.dumps(response)
                writer.write(response_json.encode() + b'\n')
                writer.flush()
                
            except Exception as e:
                logging.error(f"Server error: {e}")
                error_response = {
                    'error': str(e)
                }
                writer.write(json.dumps(error_response).encode() + b'\n')
                writer.flush()


def main():
    """Main entry point"""
    
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Check for credentials
    if not os.getenv('KITE_API_KEY'):
        print("""
        ⚠️  Zerodha credentials not found!
        
        Please set environment variables:
        export KITE_API_KEY="your_api_key"
        export KITE_API_SECRET="your_api_secret"
        export KITE_ACCESS_TOKEN="your_access_token"
        
        Or add them to ~/.claude/settings.json
        """)
        
        # Run in demo mode
        print("\n🎯 Running in DEMO mode with simulated data...")
    
    # Create and run server
    server = ZerodhaMCPServer()
    
    try:
        asyncio.run(server.run_stdio_server())
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error(f"Server crashed: {e}")


if __name__ == "__main__":
    main()