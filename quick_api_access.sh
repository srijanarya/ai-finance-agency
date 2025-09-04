#!/bin/bash
# Quick API Access for Enterprise Services

echo "🏢 ENTERPRISE SERVICES - QUICK ACCESS"
echo "======================================"

case "$1" in
    "conversations")
        echo "📞 Customer Conversations:"
        sqlite3 chatwoot.db "SELECT id, customer_name, status, created_at FROM conversations"
        ;;
    "plans")
        echo "💳 Billing Plans:"
        sqlite3 killbill.db "SELECT name, amount, currency FROM billing_plans"
        ;;
    "revenue")
        echo "💰 Revenue Report:"
        sqlite3 killbill.db "SELECT date, mrr, total_customers FROM revenue_tracking ORDER BY date DESC LIMIT 7"
        ;;
    "status")
        echo "📊 System Status:"
        echo "Chatwoot DB: $(sqlite3 chatwoot.db 'SELECT COUNT(*) FROM conversations') conversations"
        echo "Active Subscriptions: $(sqlite3 killbill.db 'SELECT COUNT(*) FROM subscriptions WHERE status="active"')"
        echo "Current MRR: ₹$(sqlite3 killbill.db 'SELECT mrr FROM revenue_tracking ORDER BY date DESC LIMIT 1')"
        ;;
    *)
        echo "Usage: $0 {conversations|plans|revenue|status}"
        echo ""
        echo "Available commands:"
        echo "  conversations  - List customer conversations"
        echo "  plans         - Show billing plans"
        echo "  revenue       - Show revenue data"
        echo "  status        - System overview"
        ;;
esac
