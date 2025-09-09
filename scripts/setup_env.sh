#!/bin/bash
# Virtual Environment Setup Script for AI Finance Agency
# Compatible with macOS and Linux

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PYTHON_MIN_VERSION="3.11"
VENV_NAME="venv"
PROJECT_NAME="AI Finance Agency"

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  $PROJECT_NAME Setup${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${YELLOW}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

check_python_version() {
    print_step "Checking Python version..."
    
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.11 or higher."
        exit 1
    fi
    
    python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
    
    if [[ $(echo "$python_version >= $PYTHON_MIN_VERSION" | bc -l) -eq 0 ]]; then
        print_error "Python $PYTHON_MIN_VERSION or higher is required. Found: $python_version"
        exit 1
    fi
    
    print_success "Python $python_version found"
}

check_system_dependencies() {
    print_step "Checking system dependencies..."
    
    # Check for required system packages
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        print_info "macOS detected"
        
        # Check for Homebrew
        if ! command -v brew &> /dev/null; then
            print_error "Homebrew is required for installing system dependencies on macOS"
            print_info "Install Homebrew: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        
        # Install required packages
        print_info "Installing system dependencies..."
        brew install redis postgresql ta-lib
        
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        print_info "Linux detected"
        
        # Check for package manager
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            print_info "Installing system dependencies (apt)..."
            sudo apt-get update
            sudo apt-get install -y python3-dev python3-pip python3-venv build-essential \
                libpq-dev redis-server postgresql-client libta-lib-dev pkg-config \
                libffi-dev libssl-dev
        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            print_info "Installing system dependencies (yum)..."
            sudo yum install -y python3-devel python3-pip gcc postgresql-devel redis \
                ta-lib-devel openssl-devel libffi-devel
        else
            print_error "Unsupported Linux distribution. Please install dependencies manually."
            exit 1
        fi
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    print_success "System dependencies installed"
}

create_virtual_environment() {
    print_step "Creating virtual environment..."
    
    # Remove existing venv if it exists
    if [ -d "$VENV_NAME" ]; then
        print_info "Removing existing virtual environment..."
        rm -rf "$VENV_NAME"
    fi
    
    # Create new virtual environment
    python3 -m venv "$VENV_NAME"
    print_success "Virtual environment created: $VENV_NAME"
}

activate_virtual_environment() {
    print_step "Activating virtual environment..."
    
    # Activate virtual environment
    source "$VENV_NAME/bin/activate"
    
    # Verify activation
    if [[ "$VIRTUAL_ENV" == "" ]]; then
        print_error "Failed to activate virtual environment"
        exit 1
    fi
    
    print_success "Virtual environment activated"
    print_info "Virtual environment: $VIRTUAL_ENV"
}

upgrade_pip() {
    print_step "Upgrading pip..."
    
    python -m pip install --upgrade pip setuptools wheel
    
    pip_version=$(pip --version | cut -d' ' -f2)
    print_success "pip upgraded to version $pip_version"
}

install_requirements() {
    print_step "Installing Python dependencies..."
    
    # Determine which requirements file to use
    if [[ "$1" == "dev" ]]; then
        req_file="requirements/dev.txt"
        print_info "Installing development dependencies..."
    elif [[ "$1" == "test" ]]; then
        req_file="requirements/test.txt"
        print_info "Installing testing dependencies..."
    elif [[ "$1" == "prod" ]]; then
        req_file="requirements/prod.txt"
        print_info "Installing production dependencies..."
    else
        req_file="requirements.txt"
        print_info "Installing base dependencies..."
    fi
    
    # Check if requirements file exists
    if [ ! -f "$req_file" ]; then
        print_error "Requirements file not found: $req_file"
        exit 1
    fi
    
    # Install with progress and timeout
    pip install --timeout 300 --retries 3 -r "$req_file"
    
    print_success "Dependencies installed from $req_file"
}

verify_installation() {
    print_step "Verifying installation..."
    
    # Test critical imports
    python -c "
import sys
import os

# Test core imports
try:
    import flask
    import pandas
    import numpy
    import requests
    print('✓ Core packages imported successfully')
except ImportError as e:
    print(f'✗ Core import failed: {e}')
    sys.exit(1)

# Test AI packages
try:
    import openai
    print('✓ OpenAI package imported successfully')
except ImportError:
    print('⚠ OpenAI package not available (may need API key)')

try:
    import anthropic
    print('✓ Anthropic package imported successfully')
except ImportError:
    print('⚠ Anthropic package not available')

# Test database packages
try:
    import sqlalchemy
    import redis
    print('✓ Database packages imported successfully')
except ImportError as e:
    print(f'⚠ Database import issue: {e}')

print('✓ Installation verification completed')
"
    
    print_success "Installation verified"
}

create_activation_script() {
    print_step "Creating activation script..."
    
    cat > activate.sh << 'EOF'
#!/bin/bash
# Activation script for AI Finance Agency

if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Virtual environment activated"
    echo "📁 Project: AI Finance Agency"
    echo "🐍 Python: $(python --version)"
    echo "📦 Pip: $(pip --version | cut -d' ' -f2)"
    echo ""
    echo "To deactivate: deactivate"
    echo "To reinstall: ./scripts/setup_env.sh [dev|test|prod]"
else
    echo "❌ Virtual environment not found. Run: ./scripts/setup_env.sh"
fi
EOF
    
    chmod +x activate.sh
    print_success "Activation script created: activate.sh"
}

print_completion_info() {
    echo ""
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}  Setup Complete!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Activate the environment:"
    echo "   source venv/bin/activate"
    echo "   # OR"
    echo "   ./activate.sh"
    echo ""
    echo "2. Configure environment variables:"
    echo "   cp .env.example .env"
    echo "   # Edit .env with your API keys"
    echo ""
    echo "3. Validate configuration:"
    echo "   python validate_environment.py"
    echo ""
    echo "4. Run tests:"
    echo "   pytest tests/"
    echo ""
    echo -e "${BLUE}Environment Details:${NC}"
    echo "• Virtual environment: $VENV_NAME"
    echo "• Python version: $(python3 --version)"
    echo "• Requirements: $req_file"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
}

# Main execution
main() {
    print_header
    
    # Parse command line arguments
    INSTALL_TYPE="${1:-base}"
    
    # Check if we're in the right directory
    if [ ! -f "requirements.txt" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Run setup steps
    check_python_version
    check_system_dependencies
    create_virtual_environment
    activate_virtual_environment
    upgrade_pip
    install_requirements "$INSTALL_TYPE"
    verify_installation
    create_activation_script
    
    print_completion_info
}

# Help function
show_help() {
    echo "Usage: $0 [ENVIRONMENT]"
    echo ""
    echo "ENVIRONMENT options:"
    echo "  base (default) - Install base dependencies only"
    echo "  dev           - Install development dependencies"
    echo "  test          - Install testing dependencies"
    echo "  prod          - Install production dependencies"
    echo ""
    echo "Examples:"
    echo "  $0              # Install base dependencies"
    echo "  $0 dev          # Install development dependencies"
    echo "  $0 test         # Install testing dependencies"
    echo "  $0 prod         # Install production dependencies"
}

# Handle command line arguments
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"