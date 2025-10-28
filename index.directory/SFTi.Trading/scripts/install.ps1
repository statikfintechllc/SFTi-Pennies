# SFTi Stock Scanner - PowerShell Installation Script
# Supports Windows 10/11 with PowerShell 5.1+

param(
    [switch]$Force,
    [switch]$SkipFirewall,
    [string]$InstallPath = "$env:USERPROFILE\.sfti-scanner"
)

# Configuration
$APP_NAME = "SFTi Stock Scanner"
$ROUTER_PORT = 8080
$SERVER_PORT = 3000
$WS_PORT = 3001

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

function Write-Status {
    param([string]$Message, [string]$Color = "Green")
    Write-Host "[INFO] $Message" -ForegroundColor $Colors[$Color]
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $Colors["Yellow"]
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors["Red"]
}

function Write-Header {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor $Colors["Blue"]
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-NodeJS {
    try {
        $version = & node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Found Node.js $version"
            return $true
        }
    }
    catch {
        # Node.js not found
    }
    return $false
}

function Test-Python {
    try {
        $version = & python --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Found Python $version"
            return $true
        }
    }
    catch {
        # Python not found
    }
    return $false
}

function Install-NodeJS {
    Write-Header "Installing Node.js"
    
    if (Get-Command "winget" -ErrorAction SilentlyContinue) {
        Write-Status "Installing Node.js via winget..."
        & winget install OpenJS.NodeJS
    }
    elseif (Get-Command "choco" -ErrorAction SilentlyContinue) {
        Write-Status "Installing Node.js via Chocolatey..."
        & choco install nodejs -y
    }
    else {
        Write-Error "Cannot install Node.js automatically."
        Write-Warning "Please install Node.js manually from https://nodejs.org/"
        Write-Warning "Then run this script again."
        exit 1
    }
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (-not (Test-NodeJS)) {
        Write-Error "Node.js installation failed or not found in PATH"
        Write-Warning "Please restart PowerShell and try again"
        exit 1
    }
}

function New-DirectoryStructure {
    Write-Header "Creating Application Directories"
    
    $directories = @(
        $InstallPath,
        "$InstallPath\router",
        "$InstallPath\server", 
        "$InstallPath\logs",
        "$InstallPath\config",
        "$InstallPath\config\router",
        "$InstallPath\config\server",
        "$InstallPath\data"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Status "Created directory structure at $InstallPath"
}

function New-PackageFiles {
    Write-Header "Creating Package Files"
    
    # Router package.json
    $routerPackage = @{
        name = "sfti-router"
        version = "1.0.0"
        description = "IBKR data router for SFTi Stock Scanner"
        main = "router.js"
        scripts = @{
            start = "node router.js"
            dev = "nodemon router.js"
        }
        dependencies = @{
            "ws" = "^8.14.2"
            "express" = "^4.18.2"
            "cors" = "^2.8.5"
            "dotenv" = "^16.3.1"
            "axios" = "^1.6.0"
            "node-ib" = "^0.2.0"
        }
        devDependencies = @{
            "nodemon" = "^3.0.1"
        }
    } | ConvertTo-Json -Depth 3
    
    Set-Content -Path "$InstallPath\router\package.json" -Value $routerPackage
    
    # Server package.json
    $serverPackage = @{
        name = "sfti-server"
        version = "1.0.0"
        description = "Public server for SFTi Stock Scanner"
        main = "server.js"
        scripts = @{
            start = "node server.js"
            dev = "nodemon server.js"
        }
        dependencies = @{
            "express" = "^4.18.2"
            "ws" = "^8.14.2"
            "cors" = "^2.8.5"
            "helmet" = "^7.1.0"
            "compression" = "^1.7.4"
            "redis" = "^4.6.8"
            "dotenv" = "^16.3.1"
            "axios" = "^1.6.0"
            "rate-limiter-flexible" = "^3.0.8"
        }
        devDependencies = @{
            "nodemon" = "^3.0.1"
        }
    } | ConvertTo-Json -Depth 3
    
    Set-Content -Path "$InstallPath\server\package.json" -Value $serverPackage
}

function Install-Dependencies {
    Write-Header "Installing Dependencies"
    
    Write-Status "Installing router dependencies..."
    Push-Location "$InstallPath\router"
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install router dependencies"
        Pop-Location
        exit 1
    }
    Pop-Location
    
    Write-Status "Installing server dependencies..."
    Push-Location "$InstallPath\server"
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install server dependencies"
        Pop-Location
        exit 1
    }
    Pop-Location
}

function New-ConfigurationFiles {
    Write-Header "Creating Configuration Files"
    
    # Router configuration
    $routerConfig = @"
# IBKR Connection Settings
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
IBKR_CLIENT_ID=1

# Router Settings
ROUTER_PORT=$ROUTER_PORT
ROUTER_HOST=0.0.0.0

# Server Connection
SERVER_HOST=localhost
SERVER_PORT=$SERVER_PORT

# Logging
LOG_LEVEL=info
LOG_FILE=$InstallPath\logs\router.log

# Data Settings
UPDATE_INTERVAL=3000
MARKET_DATA_CACHE_TTL=5000
"@
    
    Set-Content -Path "$InstallPath\config\router\.env" -Value $routerConfig
    
    # Server configuration
    $serverConfig = @"
# Server Settings
SERVER_PORT=$SERVER_PORT
WS_PORT=$WS_PORT
SERVER_HOST=0.0.0.0

# Router Connection
ROUTER_HOST=localhost
ROUTER_PORT=$ROUTER_PORT

# Redis Settings (optional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=false

# Security
JWT_SECRET=your-jwt-secret-change-this
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=info
LOG_FILE=$InstallPath\logs\server.log
"@
    
    Set-Content -Path "$InstallPath\config\server\.env" -Value $serverConfig
    
    Write-Status "Configuration files created"
}

function New-StartupScripts {
    Write-Header "Creating Startup Scripts"
    
    # PowerShell start script
    $startScript = @"
# SFTi Stock Scanner - Start Script
param([switch]`$Wait)

`$APP_DIR = "$InstallPath"

Write-Host "Starting SFTi Stock Scanner services..." -ForegroundColor Green

# Start Router
Write-Host "Starting Router..." -ForegroundColor Cyan
Set-Location "`$APP_DIR\router"
`$routerJob = Start-Job -ScriptBlock { Set-Location "$InstallPath\router"; & node router.js }
Start-Sleep -Seconds 3

# Start Server  
Write-Host "Starting Server..." -ForegroundColor Cyan
Set-Location "`$APP_DIR\server"
`$serverJob = Start-Job -ScriptBlock { Set-Location "$InstallPath\server"; & node server.js }

Write-Host "Services started!" -ForegroundColor Green
Write-Host "Router Job ID: `$(`$routerJob.Id)" -ForegroundColor Yellow
Write-Host "Server Job ID: `$(`$serverJob.Id)" -ForegroundColor Yellow
Write-Host "Web interface: http://localhost:$SERVER_PORT" -ForegroundColor Blue

if (`$Wait) {
    Write-Host "Press Ctrl+C to stop services..." -ForegroundColor Yellow
    try {
        while (`$true) {
            Start-Sleep -Seconds 1
            if (`$routerJob.State -ne "Running" -or `$serverJob.State -ne "Running") {
                break
            }
        }
    }
    finally {
        Write-Host "Stopping services..." -ForegroundColor Red
        Stop-Job `$routerJob, `$serverJob -ErrorAction SilentlyContinue
        Remove-Job `$routerJob, `$serverJob -ErrorAction SilentlyContinue
    }
}
"@
    
    Set-Content -Path "$InstallPath\start.ps1" -Value $startScript
    
    # PowerShell stop script
    $stopScript = @"
# SFTi Stock Scanner - Stop Script

Write-Host "Stopping SFTi Stock Scanner services..." -ForegroundColor Red

# Stop Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    `$_.ProcessName -eq "node" -and 
    (`$_.MainWindowTitle -like "*router*" -or `$_.MainWindowTitle -like "*server*")
} | Stop-Process -Force

# Stop any background jobs
Get-Job | Where-Object { `$_.Command -like "*router.js*" -or `$_.Command -like "*server.js*" } | Stop-Job
Get-Job | Where-Object { `$_.Command -like "*router.js*" -or `$_.Command -like "*server.js*" } | Remove-Job

Write-Host "Services stopped." -ForegroundColor Green
"@
    
    Set-Content -Path "$InstallPath\stop.ps1" -Value $stopScript
    
    # Batch file wrappers for compatibility
    $startBat = @"
@echo off
powershell -ExecutionPolicy Bypass -File "$InstallPath\start.ps1"
pause
"@
    
    Set-Content -Path "$InstallPath\start.bat" -Value $startBat
    
    $stopBat = @"
@echo off
powershell -ExecutionPolicy Bypass -File "$InstallPath\stop.ps1"
pause
"@
    
    Set-Content -Path "$InstallPath\stop.bat" -Value $stopBat
    
    Write-Status "Startup scripts created"
}

function New-DesktopShortcut {
    Write-Header "Creating Desktop Shortcut"
    
    $shortcutPath = "$env:USERPROFILE\Desktop\SFTi Stock Scanner.lnk"
    
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "$InstallPath\start.bat"
    $shortcut.WorkingDirectory = $InstallPath
    $shortcut.Description = "SFTi Stock Scanner"
    $shortcut.IconLocation = "shell32.dll,21"
    $shortcut.Save()
    
    Write-Status "Desktop shortcut created"
}

function Set-FirewallRules {
    if ($SkipFirewall) {
        Write-Warning "Skipping firewall configuration"
        return
    }
    
    Write-Header "Configuring Windows Firewall"
    
    try {
        # Check if running as administrator for firewall rules
        if (-not (Test-Administrator)) {
            Write-Warning "Not running as administrator. Skipping firewall configuration."
            Write-Warning "Please run the following commands as administrator:"
            Write-Warning "netsh advfirewall firewall add rule name=`"SFTi Router`" dir=in action=allow protocol=TCP localport=$ROUTER_PORT"
            Write-Warning "netsh advfirewall firewall add rule name=`"SFTi Server`" dir=in action=allow protocol=TCP localport=$SERVER_PORT"
            Write-Warning "netsh advfirewall firewall add rule name=`"SFTi WebSocket`" dir=in action=allow protocol=TCP localport=$WS_PORT"
            return
        }
        
        & netsh advfirewall firewall add rule name="SFTi Router" dir=in action=allow protocol=TCP localport=$ROUTER_PORT 2>$null
        & netsh advfirewall firewall add rule name="SFTi Server" dir=in action=allow protocol=TCP localport=$SERVER_PORT 2>$null  
        & netsh advfirewall firewall add rule name="SFTi WebSocket" dir=in action=allow protocol=TCP localport=$WS_PORT 2>$null
        
        Write-Status "Firewall rules configured"
    }
    catch {
        Write-Warning "Failed to configure firewall rules: $($_.Exception.Message)"
    }
}

function New-ServiceScripts {
    Write-Header "Creating Windows Service Scripts"
    
    # Install service script (requires NSSM)
    $installServiceScript = @"
# Install SFTi Stock Scanner as Windows Service
# Requires NSSM (Non-Sucking Service Manager) - https://nssm.cc/

if (-not (Test-Path "nssm.exe")) {
    Write-Error "nssm.exe not found in current directory"
    Write-Warning "Please download NSSM from https://nssm.cc/"
    Write-Warning "Extract nssm.exe to this directory and run again"
    exit 1
}

Write-Host "Installing Router service..." -ForegroundColor Cyan
& .\nssm install "SFTi Router" node "$InstallPath\router\router.js"
& .\nssm set "SFTi Router" AppDirectory "$InstallPath\router"
& .\nssm set "SFTi Router" DisplayName "SFTi Stock Scanner Router"
& .\nssm set "SFTi Router" Description "IBKR data router for SFTi Stock Scanner"
& .\nssm set "SFTi Router" Start SERVICE_AUTO_START

Write-Host "Installing Server service..." -ForegroundColor Cyan
& .\nssm install "SFTi Server" node "$InstallPath\server\server.js"
& .\nssm set "SFTi Server" AppDirectory "$InstallPath\server"
& .\nssm set "SFTi Server" DisplayName "SFTi Stock Scanner Server"
& .\nssm set "SFTi Server" Description "Public server for SFTi Stock Scanner"
& .\nssm set "SFTi Server" Start SERVICE_AUTO_START
& .\nssm set "SFTi Server" DependOnService "SFTi Router"

Write-Host "Services installed. Use services.msc to manage them." -ForegroundColor Green
"@
    
    Set-Content -Path "$InstallPath\install-service.ps1" -Value $installServiceScript
    
    # Uninstall service script
    $uninstallServiceScript = @"
# Uninstall SFTi Stock Scanner Windows Services

if (-not (Test-Path "nssm.exe")) {
    Write-Error "nssm.exe not found in current directory"
    exit 1
}

Write-Host "Stopping and removing services..." -ForegroundColor Red
& .\nssm stop "SFTi Server"
& .\nssm stop "SFTi Router" 
& .\nssm remove "SFTi Server" confirm
& .\nssm remove "SFTi Router" confirm

Write-Host "Services removed." -ForegroundColor Green
"@
    
    Set-Content -Path "$InstallPath\uninstall-service.ps1" -Value $uninstallServiceScript
}

# Main installation function
function Install-SFTiScanner {
    Write-Header "$APP_NAME Installation"
    
    # Check if running as administrator
    if (Test-Administrator) {
        Write-Warning "Running as administrator. This is not recommended."
        if (-not $Force) {
            $continue = Read-Host "Continue anyway? (y/N)"
            if ($continue -notlike "y*") {
                exit 1
            }
        }
    }
    
    # Check for Node.js
    if (-not (Test-NodeJS)) {
        Write-Warning "Node.js not found"
        $install = Read-Host "Install Node.js automatically? (Y/n)"
        if ($install -notlike "n*") {
            Install-NodeJS
        } else {
            Write-Error "Node.js is required. Please install manually and run again."
            exit 1
        }
    }
    
    # Check for Python (optional)
    if (-not (Test-Python)) {
        Write-Warning "Python not found. Some features may not work."
    }
    
    # Create application structure
    New-DirectoryStructure
    New-PackageFiles
    Install-Dependencies
    New-ConfigurationFiles
    New-StartupScripts
    New-DesktopShortcut
    New-ServiceScripts
    Set-FirewallRules
    
    # Installation complete
    Write-Header "Installation Complete!"
    Write-Status "Application installed to: $InstallPath"
    Write-Status "Configuration files: $InstallPath\config\"
    Write-Status "Log files: $InstallPath\logs\"
    Write-Host ""
    Write-Status "To start the services:"
    Write-Host "  PowerShell: $InstallPath\start.ps1"
    Write-Host "  Batch file: $InstallPath\start.bat"
    Write-Host "  Desktop shortcut: Double-click the desktop icon"
    Write-Host ""
    Write-Status "To stop the services:"
    Write-Host "  PowerShell: $InstallPath\stop.ps1"
    Write-Host "  Batch file: $InstallPath\stop.bat"
    Write-Host ""
    Write-Status "Web interface will be available at:"
    Write-Host "  http://localhost:$SERVER_PORT" -ForegroundColor Blue
    Write-Host ""
    Write-Warning "Next steps:"
    Write-Host "1. Configure IBKR TWS/Gateway connection in $InstallPath\config\router\.env"
    Write-Host "2. Start TWS or IB Gateway"
    Write-Host "3. Run: $InstallPath\start.ps1"
    Write-Host "4. Open http://localhost:$SERVER_PORT in your browser"
    Write-Host ""
    Write-Status "For Windows Service installation:"
    Write-Host "1. Download NSSM from https://nssm.cc/"
    Write-Host "2. Extract nssm.exe to $InstallPath"
    Write-Host "3. Run as Administrator: $InstallPath\install-service.ps1"
}

# Run installation
try {
    Install-SFTiScanner
}
catch {
    Write-Error "Installation failed: $($_.Exception.Message)"
    Write-Host "Stack trace:" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}