#!/bin/bash

# Generate 10 high-value content pieces rapidly
echo "🚀 Generating 10 Revenue-Driving Content Pieces..."
echo "================================================"

topics=(
  "SIP vs Lumpsum: Which Makes You Richer in 2025"
  "Hidden Charges in Mutual Funds Eating Your Returns"
  "Best ELSS Funds for 80C Tax Saving This Year"
  "Why Your Parents FD Strategy Won't Work Anymore"
  "Index Funds vs Active Funds: Data-Driven Analysis"
  "How NRIs Can Invest in Indian Stock Market"
  "Dividend vs Growth Option: Mathematical Proof"
  "Emergency Fund: How Much Do Indians Really Need"
  "Gold vs Equity: 20-Year Returns Comparison"
  "Retirement Planning for 30-Year-Olds: Start Today"
)

for topic in "${topics[@]}"; do
  echo "📝 Generating: $topic"
  
  curl -X POST http://localhost:5001/webhook/n8n/trigger \
    -H "Content-Type: application/json" \
    -d "{
      \"content_type\": \"educational\",
      \"topic\": \"$topic\",
      \"platforms\": [\"telegram\", \"linkedin\"],
      \"language\": \"bilingual\"
    }" \
    --silent --output /dev/null
  
  echo "✅ Generated successfully"
  sleep 2
done

echo ""
echo "🎉 ALL 10 CONTENT PIECES GENERATED!"
echo "📊 Check metrics: curl http://localhost:5001/webhook/n8n/metrics"