#!/bin/bash

# LinkedIn OAuth Complete Fix Script
# This gets a token with ALL the correct scopes including w_member_social

echo "🚀 LinkedIn OAuth Final Fix - Getting token with posting permissions"
echo "=================================================================="

# Configuration
CLIENT_ID="776dnomhse84tj"
CLIENT_SECRET="WPL_AP1.r3GQEtOyAZpKQkFJ.mafPeA=="
REDIRECT_URI="http://localhost:8080/callback"
COMPANY_ID="108595796"

# CORRECT scopes including w_member_social for posting
SCOPES="openid%20profile%20email%20w_member_social"

# Build the authorization URL with ALL scopes
AUTH_URL="https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=$CLIENT_ID&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2Fcallback&scope=$SCOPES"

echo "📋 This script will:"
echo "1. Open LinkedIn OAuth with CORRECT scopes (including w_member_social)"
echo "2. Start a server to catch the callback"
echo "3. Exchange code for access token"
echo "4. Test posting to Treum Algotech"
echo ""

# Start the callback server
echo "🔧 Starting callback server on port 8080..."
(
python3 -c "
import http.server
import socketserver
import urllib.parse
import sys

PORT = 8080

class OAuthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if '/callback' in self.path:
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            if 'code' in params:
                code = params['code'][0]
                print(f'AUTH_CODE:{code}')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                html = '''
                <html>
                <head><title>Success!</title></head>
                <body style='font-family: Arial; text-align: center; padding: 50px;'>
                    <h1 style='color: green;'>✅ Authorization Successful!</h1>
                    <p>You can close this window now.</p>
                    <p>Check your terminal for the access token.</p>
                    <script>setTimeout(() => window.close(), 3000);</script>
                </body>
                </html>
                '''
                self.wfile.write(html.encode())
                sys.exit(0)
    
    def log_message(self, format, *args):
        pass  # Suppress server logs

print(f'Server listening on http://localhost:{PORT}')
with socketserver.TCPServer(('', PORT), OAuthHandler) as httpd:
    httpd.serve_forever()
" 2>&1 | while read line; do
    if [[ $line == AUTH_CODE:* ]]; then
        CODE=${line#AUTH_CODE:}
        echo ""
        echo "✅ Got authorization code!"
        echo "🔄 Exchanging for access token..."
        
        # Exchange code for token
        RESPONSE=$(curl -s -X POST "https://api.linkedin.com/oauth/v2/accessToken" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "grant_type=authorization_code&code=$CODE&redirect_uri=$REDIRECT_URI&client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET")
        
        # Extract token and scope
        TOKEN=$(echo "$RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('access_token', ''))
if 'scope' in data:
    print(f'Scopes: {data[\"scope\"]}')
")
        
        if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "None" ]; then
            # Extract just the token (first line)
            ACCESS_TOKEN=$(echo "$TOKEN" | head -n1)
            
            echo "✅ Got access token!"
            echo "📝 Token scopes: $(echo "$TOKEN" | tail -n1)"
            
            # Save to .env
            echo "LINKEDIN_ACCESS_TOKEN=$ACCESS_TOKEN" > .env
            echo "LINKEDIN_COMPANY_ID=$COMPANY_ID" >> .env
            echo "✅ Saved to .env file"
            
            # Test post to verify w_member_social scope works
            echo "📤 Sending test post to Treum Algotech..."
            
            POST_RESPONSE=$(curl -s -X POST "https://api.linkedin.com/v2/ugcPosts" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                -H "Content-Type: application/json" \
                -H "X-Restli-Protocol-Version: 2.0.0" \
                -d "{
                    \"author\": \"urn:li:organization:$COMPANY_ID\",
                    \"lifecycleState\": \"PUBLISHED\",
                    \"specificContent\": {
                        \"com.linkedin.ugc.ShareContent\": {
                            \"shareCommentary\": {
                                \"text\": \"🎉 LinkedIn API Integration Successful! Treum Algotech automated posting with w_member_social scope is now operational! #APIIntegration #TechSuccess #Automation\"
                            },
                            \"shareMediaCategory\": \"NONE\"
                        }
                    },
                    \"visibility\": {
                        \"com.linkedin.ugc.MemberNetworkVisibility\": \"PUBLIC\"
                    }
                }")
            
            # Check if post was successful
            if [[ $POST_RESPONSE == *"\"id\""* ]]; then
                echo "✅ Test post sent successfully!"
                echo "🔗 Check: https://www.linkedin.com/company/treum-algotech/"
                echo ""
                echo "🎉 SUCCESS! LinkedIn OAuth is fully configured with posting permissions!"
                echo "Your token with w_member_social scope is saved in .env"
            else
                echo "⚠️ Post failed. Response: $POST_RESPONSE"
                echo "But your token is saved in .env - you may need to check permissions"
            fi
            
            # Kill the Python server
            pkill -f "python3 -c"
            exit 0
        else
            echo "❌ Failed to get access token"
            echo "Response: $RESPONSE"
            pkill -f "python3 -c"
            exit 1
        fi
    fi
done
) &

SERVER_PID=$!

# Give server time to start
sleep 2

# Open the authorization URL in browser
echo "🌐 Opening LinkedIn OAuth page..."
echo "⚠️ IMPORTANT: Select 'TREUM ALGOTECH' from the dropdown (not your personal profile)!"
echo ""

# Open browser with the correct authorization URL
open "$AUTH_URL"

echo "📌 After you authorize, the script will automatically:"
echo "   - Capture the authorization code"
echo "   - Exchange it for an access token"
echo "   - Save token to .env file"
echo "   - Send a test post to verify w_member_social scope"
echo ""
echo "⏳ Waiting for authorization (timeout: 2 minutes)..."

# Wait for the server process to complete or timeout after 2 minutes
if timeout 120 wait $SERVER_PID 2>/dev/null; then
    echo "✅ Process completed successfully!"
else
    echo "⏰ Timeout or process ended"
    pkill -f "python3 -c" 2>/dev/null
fi