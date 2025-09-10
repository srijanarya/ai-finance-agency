#!/bin/bash
# Migration script to update all dashboard connections

echo "Starting dashboard connection migration..."

# Backup current files
echo "Creating backups..."
for file in treum_ai_platform.py unified_platform.py queue_monitor_dashboard.py; do
    if [ -f "$file" ]; then
        cp "$file" "${file}.backup"
        echo "  Backed up $file"
    fi
done

# Update Python files to use new connections
echo "Updating connections..."
python3 update_dashboard_connections.py

# Restart services
echo "Restarting services..."
pkill -f "python3.*platform.py" 2>/dev/null
pkill -f "python3.*dashboard.py" 2>/dev/null

echo "Migration complete!"
echo ""
echo "To start the updated dashboards:"
echo "  python3 treum_ai_platform.py"
echo "  python3 unified_platform.py"
echo "  python3 queue_monitor_dashboard.py"
