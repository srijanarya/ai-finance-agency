#!/bin/bash

# BMAD Method Installation Script
echo "Installing BMAD Method..."

# Set the installation directory (parent directory)
INSTALL_DIR="/Users/srijan/ai-finance-agency"

# Navigate to bmad-method directory
cd /Users/srijan/ai-finance-agency/bmad-method

# Create .bmad directory structure in the parent project
mkdir -p "$INSTALL_DIR/.bmad"
mkdir -p "$INSTALL_DIR/.bmad/agents"
mkdir -p "$INSTALL_DIR/.bmad/context"
mkdir -p "$INSTALL_DIR/.bmad/knowledge"
mkdir -p "$INSTALL_DIR/.bmad/templates"

# Copy core files
echo "Copying core BMAD files..."

# Copy agent files if they exist
if [ -d "agents" ]; then
    cp -r agents/* "$INSTALL_DIR/.bmad/agents/" 2>/dev/null || true
fi

# Copy templates if they exist  
if [ -d "templates" ]; then
    cp -r templates/* "$INSTALL_DIR/.bmad/templates/" 2>/dev/null || true
fi

# Copy orchestrator and core components
if [ -f "orchestrator.md" ]; then
    cp orchestrator.md "$INSTALL_DIR/.bmad/"
fi

# Create configuration file
cat > "$INSTALL_DIR/.bmad/config.json" << 'EOF'
{
  "version": "4.43.0",
  "projectPath": "/Users/srijan/ai-finance-agency",
  "installedPacks": ["core"],
  "settings": {
    "autoStart": false,
    "defaultAgent": "orchestrator"
  }
}
EOF

# Create the main BMAD launcher script
cat > "$INSTALL_DIR/bmad" << 'EOF'
#!/bin/bash
# BMAD Method Launcher
echo "🚀 BMAD Method - AI Agent Framework"
echo "Type *help for available commands"
echo "Starting BMAD Orchestrator..."
EOF

chmod +x "$INSTALL_DIR/bmad"

echo "✅ BMAD Method installed successfully!"
echo ""
echo "📁 Installation location: $INSTALL_DIR/.bmad"
echo ""
echo "🎯 Quick Start:"
echo "   1. Run './bmad' to start the orchestrator"
echo "   2. Type '*help' to see available commands"
echo "   3. Use '*analyst' to start with project analysis"
echo ""
echo "📚 Your AI Team includes:"
echo "   - Orchestrator (Main coordinator)"
echo "   - Analyst (Project analysis)"
echo "   - Architect (System design)"
echo "   - Developer (Implementation)"
echo "   - Tester (Quality assurance)"
echo "   And many more specialized agents!"