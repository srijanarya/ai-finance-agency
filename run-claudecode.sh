#!/bin/bash
# AI Finance Agency - Claude Code Auto-Yes Launcher

# Force non-interactive mode with auto-approval
export CLAUDE_CODE_AUTO_APPROVE=true
export CLAUDE_CODE_INTERACTIVE=false
export CLAUDE_CODE_ASSUME_YES=true
export CI=true  # Many tools check this for non-interactive mode

# Function to run Claude Code with maximum automation
run_claude() {
    echo "🚀 Running Claude Code with full auto-approval..."
    echo "📋 Task: $@"
    echo ""
    
    # Run with yes piped in for any unexpected prompts
    yes | claudecode "$@" --non-interactive --auto-approve --assume-yes 2>&1
    
    echo ""
    echo "✅ Task completed with auto-approval"
}

# If arguments provided, run them
if [ $# -gt 0 ]; then
    run_claude "$@"
else
    echo "Usage: ./run-claudecode.sh 'your task description'"
    echo ""
    echo "Examples:"
    echo "  ./run-claudecode.sh 'implement user authentication system'"
    echo "  ./run-claudecode.sh 'add stripe payment integration'"
    echo "  ./run-claudecode.sh 'create financial dashboard with charts'"
fi
