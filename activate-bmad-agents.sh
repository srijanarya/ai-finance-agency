#!/bin/bash

# Activate BMAD Agents for AI Finance Agency
# This script ensures all BMAD agents are accessible

echo "🚀 Activating ALL BMAD Agents..."
echo ""

# Source locations
PROJECT_BMAD=".bmad/agents"
CLAUDE_BMAD="$HOME/.claude/agents/bmad-agents"

# List of all BMAD agents
echo "📦 Available BMAD Agents:"
echo "========================"

# Core BMAD Orchestration
echo ""
echo "🎯 Core Orchestration:"
echo "  - bmad-master: Master coordinator for all BMAD operations"
echo "  - bmad-orchestrator: Multi-agent workflow orchestration"
echo ""

# Development Team
echo "🛠️ Development Team:"
echo "  - dev: Full-stack development specialist"
echo "  - architect: System architecture and design patterns"
echo "  - qa: Quality assurance and testing"
echo "  - pm: Project management and coordination"
echo "  - po: Product ownership and requirements"
echo "  - sm: Scrum master and agile processes"
echo "  - analyst: Business and technical analysis"
echo "  - ux-expert: User experience and interface design"
echo ""

# Infrastructure & DevOps
echo "🔧 Infrastructure & DevOps:"
echo "  - infra-devops-platform: Infrastructure, CI/CD, and platform engineering"
echo ""

# Creative Writing Team (if using creative expansion pack)
echo "✍️ Creative Writing Team:"
echo "  - narrative-designer: Story structure and narrative flow"
echo "  - character-psychologist: Character development and psychology"
echo "  - world-builder: World-building and setting design"
echo "  - dialog-specialist: Dialog writing and character voice"
echo "  - plot-architect: Plot structure and story arcs"
echo "  - genre-specialist: Genre conventions and tropes"
echo "  - editor: Content editing and refinement"
echo "  - beta-reader: First-pass review and feedback"
echo "  - book-critic: Critical analysis and review"
echo "  - cover-designer: Visual design and book covers"
echo ""

# Game Development Team (if available)
if [ -f "$CLAUDE_BMAD/game-developer.md" ]; then
    echo "🎮 Game Development Team:"
    echo "  - game-developer: Game programming and implementation"
    echo "  - game-designer: Game mechanics and systems"
    echo "  - game-architect: Game architecture and technical design"
    echo "  - game-qa: Game testing and quality assurance"
    echo "  - game-pm: Game project management"
    echo "  - game-po: Game product ownership"
    echo "  - game-sm: Game development scrum master"
    echo "  - game-ux-expert: Game UX and interface design"
    echo "  - game-analyst: Game analytics and metrics"
    echo ""
fi

echo "========================"
echo ""

# Quick usage commands
echo "📝 Quick Usage Commands:"
echo ""
echo "For AI Finance Agency tasks:"
echo "  @bmad-master coordinate trading platform deployment"
echo "  @bmad-orchestrator orchestrate microservices setup"
echo "  @dev implement payment integration"
echo "  @architect design system scalability"
echo "  @qa test all API endpoints"
echo "  @infra-devops-platform setup kubernetes cluster"
echo ""

echo "For complex multi-agent tasks:"
echo "  @party bmad-deployment    # Full BMAD team deployment"
echo "  @party infrastructure     # Infrastructure team assembly"
echo "  @party development       # Development team assembly"
echo ""

# Check agent availability
echo "✅ Agent Status Check:"
if [ -d "$PROJECT_BMAD" ]; then
    AGENT_COUNT=$(ls -1 "$PROJECT_BMAD"/*.md 2>/dev/null | wc -l)
    echo "  Project BMAD agents: $AGENT_COUNT agents found in .bmad/agents/"
fi

if [ -d "$CLAUDE_BMAD" ]; then
    CLAUDE_COUNT=$(ls -1 "$CLAUDE_BMAD"/*.md 2>/dev/null | wc -l)
    echo "  Claude BMAD agents: $CLAUDE_COUNT agents found in ~/.claude/agents/bmad-agents/"
fi

echo ""
echo "🎉 BMAD Agents are ready to use!"
echo ""
echo "💡 Pro tip: Use '@bmad-master' to coordinate complex tasks across multiple agents"
echo "           Use '@bmad-orchestrator' for workflow orchestration"
echo "           Use '@party bmad-deployment' to activate the full BMAD team"
echo ""