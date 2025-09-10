# PowerShell Setup Script for AI Finance Agency
# Compatible with Windows 10+ and PowerShell 5.1+

param(
    [string]$Environment = "base",
    [switch]$Help
)

# Configuration
$PYTHON_MIN_VERSION = [Version]"3.11"
$VENV_NAME = "venv"
$PROJECT_NAME = "AI Finance Agency"

# Color codes for Windows
$colors = @{
    Red = 'Red'
    Green = 'Green'
    Yellow = 'Yellow'
    Blue = 'Blue'
    Cyan = 'Cyan'
    White = 'White'
}

# Functions
function Write-Header {
    Write-Host "================================" -ForegroundColor Blue
    Write-Host "  $PROJECT_NAME Setup" -ForegroundColor Blue
    Write-Host "================================" -ForegroundColor Blue
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Show-Help {
    Write-Host "Usage: .\setup_env.ps1 [-Environment <type>] [-Help]"
    Write-Host ""
    Write-Host "Environment options:"
    Write-Host "  base (default) - Install base dependencies only"
    Write-Host "  dev           - Install development dependencies"
    Write-Host "  test          - Install testing dependencies"
    Write-Host "  prod          - Install production dependencies"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup_env.ps1              # Install base dependencies"
    Write-Host "  .\setup_env.ps1 -Environment dev   # Install development dependencies"
    Write-Host "  .\setup_env.ps1 -Environment test  # Install testing dependencies"
    Write-Host "  .\setup_env.ps1 -Environment prod  # Install production dependencies"
    exit 0
}

function Test-PythonVersion {
    Write-Step "Checking Python version..."
    
    try {
        $pythonCmd = Get-Command python -ErrorAction Stop
        $pythonVersion = python --version 2>&1
        
        if ($pythonVersion -match "Python (\d+\.\d+\.\d+)") {
            $version = [Version]$matches[1]
            
            if ($version -lt $PYTHON_MIN_VERSION) {
                Write-Error "Python $PYTHON_MIN_VERSION or higher is required. Found: $version"
                Write-Info "Download Python from: https://www.python.org/downloads/"
                exit 1
            }
            
            Write-Success "Python $version found"
        }
        else {
            Write-Error "Could not determine Python version"
            exit 1
        }
    }
    catch {
        Write-Error "Python is not installed or not in PATH"
        Write-Info "Download Python from: https://www.python.org/downloads/"
        Write-Info "Make sure to check 'Add Python to PATH' during installation"
        exit 1
    }
}

function Test-SystemDependencies {
    Write-Step "Checking system dependencies..."
    
    # Check for Git
    try {
        $gitCmd = Get-Command git -ErrorAction Stop
        Write-Success "Git found"
    }
    catch {
        Write-Error "Git is not installed"
        Write-Info "Download Git from: https://git-scm.com/download/windows"
        exit 1
    }
    
    # Check for Visual C++ Build Tools (required for some Python packages)
    $vcppPaths = @(
        "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\BuildTools\MSBuild\Microsoft\VC\v160",
        "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\BuildTools\MSBuild\Microsoft\VC\v170",
        "${env:ProgramFiles}\Microsoft Visual Studio\2019\Community\MSBuild\Microsoft\VC\v160",
        "${env:ProgramFiles}\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VC\v170"
    )
    
    $vcppFound = $false
    foreach ($path in $vcppPaths) {
        if (Test-Path $path) {
            $vcppFound = $true
            break
        }
    }
    
    if (-not $vcppFound) {
        Write-Warning "Visual C++ Build Tools not detected"
        Write-Info "Some Python packages may fail to install without build tools"
        Write-Info "Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/"
    }
    else {
        Write-Success "Visual C++ Build Tools found"
    }
    
    Write-Success "System dependencies checked"
}

function New-VirtualEnvironment {
    Write-Step "Creating virtual environment..."
    
    # Remove existing venv if it exists
    if (Test-Path $VENV_NAME) {
        Write-Info "Removing existing virtual environment..."
        Remove-Item -Path $VENV_NAME -Recurse -Force
    }
    
    # Create new virtual environment
    python -m venv $VENV_NAME
    
    if (-not (Test-Path "$VENV_NAME\Scripts\activate.ps1")) {
        Write-Error "Failed to create virtual environment"
        exit 1
    }
    
    Write-Success "Virtual environment created: $VENV_NAME"
}

function Enable-VirtualEnvironment {
    Write-Step "Activating virtual environment..."
    
    # Activate virtual environment
    & "$VENV_NAME\Scripts\Activate.ps1"
    
    # Verify activation
    $pythonPath = python -c "import sys; print(sys.executable)"
    if (-not ($pythonPath -like "*$VENV_NAME*")) {
        Write-Error "Failed to activate virtual environment"
        exit 1
    }
    
    Write-Success "Virtual environment activated"
    Write-Info "Python executable: $pythonPath"
}

function Update-Pip {
    Write-Step "Upgrading pip..."
    
    python -m pip install --upgrade pip setuptools wheel
    
    $pipVersion = python -m pip --version
    Write-Success "pip upgraded: $pipVersion"
}

function Install-Requirements {
    param([string]$InstallType)
    
    Write-Step "Installing Python dependencies..."
    
    # Determine which requirements file to use
    switch ($InstallType) {
        "dev" {
            $reqFile = "requirements\dev.txt"
            Write-Info "Installing development dependencies..."
        }
        "test" {
            $reqFile = "requirements\test.txt"
            Write-Info "Installing testing dependencies..."
        }
        "prod" {
            $reqFile = "requirements\prod.txt"
            Write-Info "Installing production dependencies..."
        }
        default {
            $reqFile = "requirements.txt"
            Write-Info "Installing base dependencies..."
        }
    }
    
    # Check if requirements file exists
    if (-not (Test-Path $reqFile)) {
        Write-Error "Requirements file not found: $reqFile"
        exit 1
    }
    
    # Install with timeout and retries
    python -m pip install --timeout 300 --retries 3 -r $reqFile
    
    Write-Success "Dependencies installed from $reqFile"
}

function Test-Installation {
    Write-Step "Verifying installation..."
    
    # Test critical imports
    $testScript = @"
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
"@
    
    python -c $testScript
    
    Write-Success "Installation verified"
}

function New-ActivationScript {
    Write-Step "Creating activation script..."
    
    $activationScript = @'
@echo off
REM Activation script for AI Finance Agency

if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    echo ✓ Virtual environment activated
    echo 📁 Project: AI Finance Agency
    python --version
    python -m pip --version
    echo.
    echo To deactivate: deactivate
    echo To reinstall: .\scripts\setup_env.ps1 [-Environment dev/test/prod]
) else (
    echo ❌ Virtual environment not found. Run: .\scripts\setup_env.ps1
)
'@
    
    $activationScript | Out-File -FilePath "activate.bat" -Encoding ASCII
    
    # Also create PowerShell version
    $psActivationScript = @'
# PowerShell activation script for AI Finance Agency

if (Test-Path "venv\Scripts\Activate.ps1") {
    & "venv\Scripts\Activate.ps1"
    Write-Host "✓ Virtual environment activated" -ForegroundColor Green
    Write-Host "📁 Project: AI Finance Agency" -ForegroundColor Blue
    python --version
    python -m pip --version
    Write-Host ""
    Write-Host "To deactivate: deactivate" -ForegroundColor Yellow
    Write-Host "To reinstall: .\scripts\setup_env.ps1 [-Environment dev/test/prod]" -ForegroundColor Yellow
} else {
    Write-Host "❌ Virtual environment not found. Run: .\scripts\setup_env.ps1" -ForegroundColor Red
}
'@
    
    $psActivationScript | Out-File -FilePath "activate.ps1" -Encoding UTF8
    
    Write-Success "Activation scripts created: activate.bat and activate.ps1"
}

function Write-CompletionInfo {
    param([string]$InstallType, [string]$ReqFile)
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  Setup Complete!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Activate the environment:"
    Write-Host "   .\activate.ps1 (PowerShell)"
    Write-Host "   # OR"
    Write-Host "   .\activate.bat (Command Prompt)"
    Write-Host ""
    Write-Host "2. Configure environment variables:"
    Write-Host "   Copy-Item .env.example .env"
    Write-Host "   # Edit .env with your API keys"
    Write-Host ""
    Write-Host "3. Validate configuration:"
    Write-Host "   python validate_environment.py"
    Write-Host ""
    Write-Host "4. Run tests:"
    Write-Host "   python -m pytest tests\"
    Write-Host ""
    Write-Host "Environment Details:" -ForegroundColor Blue
    Write-Host "• Virtual environment: $VENV_NAME"
    Write-Host "• Python version: $(python --version 2>&1)"
    Write-Host "• Requirements: $ReqFile"
    Write-Host ""
    Write-Host "Happy coding! 🚀" -ForegroundColor Green
}

# Main execution
function Invoke-Main {
    param([string]$InstallType)
    
    Write-Header
    
    # Check if we're in the right directory
    if (-not (Test-Path "requirements.txt")) {
        Write-Error "Please run this script from the project root directory"
        exit 1
    }
    
    # Run setup steps
    Test-PythonVersion
    Test-SystemDependencies
    New-VirtualEnvironment
    Enable-VirtualEnvironment
    Update-Pip
    Install-Requirements $InstallType
    Test-Installation
    New-ActivationScript
    
    # Determine requirements file for completion info
    switch ($InstallType) {
        "dev" { $reqFile = "requirements\dev.txt" }
        "test" { $reqFile = "requirements\test.txt" }
        "prod" { $reqFile = "requirements\prod.txt" }
        default { $reqFile = "requirements.txt" }
    }
    
    Write-CompletionInfo $InstallType $reqFile
}

# Handle command line arguments
if ($Help) {
    Show-Help
}

# Check PowerShell execution policy
if ((Get-ExecutionPolicy) -eq "Restricted") {
    Write-Error "PowerShell execution policy is restricted"
    Write-Info "Run as Administrator and execute:"
    Write-Info "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
    exit 1
}

# Run main function
try {
    Invoke-Main $Environment
}
catch {
    Write-Error "Setup failed: $($_.Exception.Message)"
    Write-Info "For troubleshooting, check the GitHub issues or documentation"
    exit 1
}