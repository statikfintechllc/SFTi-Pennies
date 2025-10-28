#!/bin/bash

# SFTi Stock Scanner - Universal Installation Script
# Supports: Windows, macOS, Linux (Debian, RPM, Ubuntu, Arch)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Detect operating system
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
        elif [ -f /etc/arch-release ]; then
            OS="arch"
        else
            OS="linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        error "Unsupported operating system: $OSTYPE"
    fi
    
    log "Detected OS: $OS"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Node.js based on OS
install_nodejs() {
    log "Installing Node.js..."
    
    case "$OS" in
        "debian")
            if ! command_exists curl; then
                sudo apt-get update
                sudo apt-get install -y curl
            fi
            
            # Install Node.js 18+
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        "redhat")
            if ! command_exists curl; then
                sudo yum install -y curl || sudo dnf install -y curl
            fi
            
            # Install Node.js 18+
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs || sudo dnf install -y nodejs
            ;;
        "arch")
            sudo pacman -S --noconfirm nodejs npm
            ;;
        "macos")
            if command_exists brew; then
                brew install node
            else
                error "Homebrew not found. Please install Homebrew first: https://brew.sh"
            fi
            ;;
        "windows")
            warn "Please download and install Node.js from: https://nodejs.org"
            warn "Then run this script again."
            exit 1
            ;;
        *)
            error "Automatic Node.js installation not supported for $OS"
            ;;
    esac
}

# Install Git if not present
install_git() {
    if ! command_exists git; then
        log "Installing Git..."
        
        case "$OS" in
            "debian")
                sudo apt-get update
                sudo apt-get install -y git
                ;;
            "redhat")
                sudo yum install -y git || sudo dnf install -y git
                ;;
            "arch")
                sudo pacman -S --noconfirm git
                ;;
            "macos")
                if command_exists brew; then
                    brew install git
                else
                    warn "Please install Xcode Command Line Tools: xcode-select --install"
                fi
                ;;
            "windows")
                warn "Please download and install Git from: https://git-scm.com"
                ;;
        esac
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        warn "Node.js not found. Installing..."
        install_nodejs
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            warn "Node.js version 18+ required. Current: $(node --version)"
            install_nodejs
        else
            log "Node.js version: $(node --version) ✓"
        fi
    fi
    
    # Check npm
    if ! command_exists npm; then
        error "npm not found. Please install Node.js with npm."
    else
        log "npm version: $(npm --version) ✓"
    fi
    
    # Check Git
    install_git
    if command_exists git; then
        log "Git version: $(git --version) ✓"
    fi
}

# Clone or update repository
setup_repository() {
    log "Setting up SFTi Stock Scanner..."
    
    if [ -d "IB-G.Scanner" ]; then
        warn "Directory 'IB-G.Scanner' already exists. Updating..."
        cd IB-G.Scanner
        git pull origin main || warn "Failed to update repository"
    else
        log "Cloning repository..."
        git clone https://github.com/statikfintechllc/IB-G.Scanner.git
        cd IB-G.Scanner
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clear npm cache if needed
    npm cache clean --force 2>/dev/null || true
    
        # Install main dependencies
        npm install
        # Ensure critical dependencies are present
        npm install typescript --save-dev
        npm install @stoqey/ib helmet
        npm install axios
    
    if [ $? -eq 0 ]; then
        log "Dependencies installed successfully ✓"
    else
        error "Failed to install dependencies"
    fi
}

# Create desktop shortcuts
create_shortcuts() {
    log "Creating desktop shortcuts..."
    # Check for graphical environment and Desktop folder
    if [ -n "$DISPLAY" ] && [ -d "$HOME/Desktop" ]; then
        DESKTOP_PATH="$HOME/Desktop"
    else
        warn "No graphical environment or Desktop folder detected. Shortcut will be placed in $HOME."
        DESKTOP_PATH="$HOME"
    fi
    case "$OS" in
        "linux"|"debian"|"redhat"|"arch")
            DESKTOP_FILE="$DESKTOP_PATH/SFTi-Stock-Scanner.desktop"
            cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Name=SFTi Stock Scanner
Comment=Professional Penny Stock Scanner
Exec=bash -c "cd $(pwd) && npm run dev"
Icon=$(pwd)/src/assets/images/icon.png
Terminal=true
Type=Application
Categories=Office;Finance;
EOF
            chmod +x "$DESKTOP_FILE"
            log "Desktop shortcut created at $DESKTOP_FILE ✓"
            ;;
        "macos")
            APP_NAME="SFTi Stock Scanner"
            ALIAS_PATH="$DESKTOP_PATH/$APP_NAME"
            ln -sf "$(pwd)" "$ALIAS_PATH" 2>/dev/null || true
            log "Desktop alias created at $ALIAS_PATH ✓"
            ;;
    esac
}

# Create startup scripts
create_scripts() {
    log "Creating startup scripts..."
    PROJECT_ROOT="$(pwd)"
    # Development script
    cat > "$PROJECT_ROOT/start-dev.sh" << EOF
#!/bin/bash
echo "Starting SFTi Stock Scanner in development mode..."
cd "$PROJECT_ROOT"
npm run dev
EOF
    chmod +x "$PROJECT_ROOT/start-dev.sh"
    # Production build script
    cat > "$PROJECT_ROOT/build-prod.sh" << EOF
#!/bin/bash
echo "Building SFTi Stock Scanner for production..."
cd "$PROJECT_ROOT"
npm run build
echo "Production build complete. Run 'npm run preview' to test."
EOF
    chmod +x "$PROJECT_ROOT/build-prod.sh"
    log "Startup scripts created in $PROJECT_ROOT ✓"
}

setup_firewall() {
    if command_exists ufw; then
        log "Configuring firewall for development server..."
        sudo ufw allow 5173/tcp comment "SFTi Stock Scanner Dev Server" 2>/dev/null || true
    else
        warn "ufw not found. Skipping firewall configuration."
    fi
}

# Final instructions
show_instructions() {
    log "Installation complete! 🎉"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Set up Interactive Brokers TWS/Gateway:"
    echo "   - Download from: https://www.interactivebrokers.com/en/trading/tws.php"
    echo "   - Enable API access in Configure → API → Settings"
    echo "   - Set Socket Port: 7497 (TWS) or 4001 (Gateway)"
    echo "   - Add 127.0.0.1 to trusted IPs"
    echo
    echo "2. Start the application:"
    echo "   - Development: ./start-dev.sh"
    echo "   - Production build: ./build-prod.sh"
    echo "   - Direct: npm run dev"
    echo
    echo "3. Open browser: http://localhost:5173"
    echo
    echo -e "${GREEN}Happy trading! 📈${NC}"
}

# Main installation flow
main() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════╗"
    echo "║        SFTi Stock Scanner            ║"
    echo "║        Installation Script           ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
    
    detect_os
    check_prerequisites
    setup_repository
    install_dependencies
    create_shortcuts
    create_scripts
    setup_firewall
    show_instructions
}

# Run main function
main "$@"