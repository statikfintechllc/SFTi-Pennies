@echo off
REM SFTi Stock Scanner - Windows Installation Script

setlocal EnableDelayedExpansion

REM Configuration
set "APP_NAME=SFTi Stock Scanner"
set "APP_DIR=%USERPROFILE%\.sfti-scanner"
set "ROUTER_PORT=8080"
set "SERVER_PORT=3000"
set "WS_PORT=3001"

echo ================================
echo %APP_NAME% Installation
echo ================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo WARNING: Running as administrator. This is not recommended.
    echo Press any key to continue or Ctrl+C to exit...
    pause >nul
)

REM Check for Node.js
echo Checking for Node.js...
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Found Node.js %NODE_VERSION%

REM Check for Python
echo Checking for Python...
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: Python is not installed.
    echo Some features may not work without Python.
    echo You can install Python from https://python.org/
)

REM Create directory structure
echo Creating application directories...
if not exist "%APP_DIR%" mkdir "%APP_DIR%"
mkdir "%APP_DIR%\router" 2>nul
mkdir "%APP_DIR%\server" 2>nul
mkdir "%APP_DIR%\logs" 2>nul
mkdir "%APP_DIR%\config" 2>nul
mkdir "%APP_DIR%\config\router" 2>nul
mkdir "%APP_DIR%\config\server" 2>nul
mkdir "%APP_DIR%\data" 2>nul

echo Directory structure created at %APP_DIR%

REM Download application files
echo Setting up application files...

REM Create package.json for router
(
echo {
echo   "name": "sfti-router",
echo   "version": "1.0.0",
echo   "description": "IBKR data router for SFTi Stock Scanner",
echo   "main": "router.js",
echo   "scripts": {
echo     "start": "node router.js",
echo     "dev": "nodemon router.js"
echo   },
echo   "dependencies": {
echo     "ws": "^8.14.2",
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.3.1",
echo     "axios": "^1.6.0",
echo     "node-ib": "^0.2.0"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.0.1"
echo   }
echo }
) > "%APP_DIR%\router\package.json"

REM Create package.json for server
(
echo {
echo   "name": "sfti-server",
echo   "version": "1.0.0",
echo   "description": "Public server for SFTi Stock Scanner",
echo   "main": "server.js",
echo   "scripts": {
echo     "start": "node server.js",
echo     "dev": "nodemon server.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "ws": "^8.14.2",
echo     "cors": "^2.8.5",
echo     "helmet": "^7.1.0",
echo     "compression": "^1.7.4",
echo     "redis": "^4.6.8",
echo     "dotenv": "^16.3.1",
echo     "axios": "^1.6.0",
echo     "rate-limiter-flexible": "^3.0.8"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.0.1"
echo   }
echo }
) > "%APP_DIR%\server\package.json"

REM Install dependencies
echo Installing router dependencies...
cd /d "%APP_DIR%\router"
call npm install
if %errorLevel% neq 0 (
    echo ERROR: Failed to install router dependencies
    pause
    exit /b 1
)

echo Installing server dependencies...
cd /d "%APP_DIR%\server"
call npm install
if %errorLevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    pause
    exit /b 1
)

cd /d "%APP_DIR%"

REM Create configuration files
echo Creating configuration files...

REM Router configuration
(
echo # IBKR Connection Settings
echo IBKR_HOST=127.0.0.1
echo IBKR_PORT=7497
echo IBKR_CLIENT_ID=1
echo.
echo # Router Settings
echo ROUTER_PORT=%ROUTER_PORT%
echo ROUTER_HOST=0.0.0.0
echo.
echo # Server Connection
echo SERVER_HOST=localhost
echo SERVER_PORT=%SERVER_PORT%
echo.
echo # Logging
echo LOG_LEVEL=info
echo LOG_FILE=%APP_DIR%\logs\router.log
echo.
echo # Data Settings
echo UPDATE_INTERVAL=3000
echo MARKET_DATA_CACHE_TTL=5000
) > "%APP_DIR%\config\router\.env"

REM Server configuration
(
echo # Server Settings
echo SERVER_PORT=%SERVER_PORT%
echo WS_PORT=%WS_PORT%
echo SERVER_HOST=0.0.0.0
echo.
echo # Router Connection
echo ROUTER_HOST=localhost
echo ROUTER_PORT=%ROUTER_PORT%
echo.
echo # Redis Settings ^(optional^)
echo REDIS_URL=redis://localhost:6379
echo REDIS_ENABLED=false
echo.
echo # Security
echo JWT_SECRET=your-jwt-secret-change-this
echo CORS_ORIGIN=*
echo.
echo # Rate Limiting
echo RATE_LIMIT_WINDOW=60000
echo RATE_LIMIT_MAX=1000
echo.
echo # Logging
echo LOG_LEVEL=info
echo LOG_FILE=%APP_DIR%\logs\server.log
) > "%APP_DIR%\config\server\.env"

REM Create startup scripts
echo Creating startup scripts...

REM Start script
(
echo @echo off
echo set "APP_DIR=%APP_DIR%"
echo.
echo echo Starting SFTi Stock Scanner services...
echo.
echo echo Starting Router...
echo cd /d "%%APP_DIR%%\router"
echo start "SFTi Router" cmd /k "node router.js"
echo.
echo timeout /t 3 /nobreak ^> nul
echo.
echo echo Starting Server...
echo cd /d "%%APP_DIR%%\server"
echo start "SFTi Server" cmd /k "node server.js"
echo.
echo echo Services started. Check task manager for running processes.
echo echo Web interface will be available at http://localhost:%SERVER_PORT%
echo.
echo pause
) > "%APP_DIR%\start.bat"

REM Stop script
(
echo @echo off
echo echo Stopping SFTi Stock Scanner services...
echo.
echo taskkill /f /im node.exe /fi "WINDOWTITLE eq SFTi Router*" 2^>nul
echo taskkill /f /im node.exe /fi "WINDOWTITLE eq SFTi Server*" 2^>nul
echo.
echo echo Services stopped.
echo pause
) > "%APP_DIR%\stop.bat"

REM Create desktop shortcut
echo Creating desktop shortcut...
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\SFTi Stock Scanner.lnk"

REM Use PowerShell to create shortcut
powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%SHORTCUT_PATH%'); $SC.TargetPath = '%APP_DIR%\start.bat'; $SC.WorkingDirectory = '%APP_DIR%'; $SC.Description = 'SFTi Stock Scanner'; $SC.Save()"

REM Create Windows service batch files
echo Creating service management scripts...

REM Install service script
(
echo @echo off
echo echo Installing SFTi Stock Scanner as Windows Service...
echo.
echo REM This requires nssm ^(Non-Sucking Service Manager^)
echo REM Download from https://nssm.cc/
echo.
echo if not exist nssm.exe ^(
echo     echo ERROR: nssm.exe not found in current directory
echo     echo Please download NSSM from https://nssm.cc/
echo     echo Extract nssm.exe to this directory and run again
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo Installing Router service...
echo nssm install "SFTi Router" node "%APP_DIR%\router\router.js"
echo nssm set "SFTi Router" AppDirectory "%APP_DIR%\router"
echo nssm set "SFTi Router" DisplayName "SFTi Stock Scanner Router"
echo nssm set "SFTi Router" Description "IBKR data router for SFTi Stock Scanner"
echo nssm set "SFTi Router" Start SERVICE_AUTO_START
echo.
echo echo Installing Server service...
echo nssm install "SFTi Server" node "%APP_DIR%\server\server.js"
echo nssm set "SFTi Server" AppDirectory "%APP_DIR%\server"
echo nssm set "SFTi Server" DisplayName "SFTi Stock Scanner Server"
echo nssm set "SFTi Server" Description "Public server for SFTi Stock Scanner"
echo nssm set "SFTi Server" Start SERVICE_AUTO_START
echo nssm set "SFTi Server" DependOnService "SFTi Router"
echo.
echo echo Services installed. Use services.msc to manage them.
echo pause
) > "%APP_DIR%\install-service.bat"

REM Uninstall service script
(
echo @echo off
echo echo Uninstalling SFTi Stock Scanner Windows Services...
echo.
echo if not exist nssm.exe ^(
echo     echo ERROR: nssm.exe not found in current directory
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo Stopping and removing services...
echo nssm stop "SFTi Server"
echo nssm stop "SFTi Router"
echo nssm remove "SFTi Server" confirm
echo nssm remove "SFTi Router" confirm
echo.
echo echo Services removed.
echo pause
) > "%APP_DIR%\uninstall-service.bat"

REM Configure Windows Firewall
echo Configuring Windows Firewall...
netsh advfirewall firewall add rule name="SFTi Router" dir=in action=allow protocol=TCP localport=%ROUTER_PORT% >nul 2>&1
netsh advfirewall firewall add rule name="SFTi Server" dir=in action=allow protocol=TCP localport=%SERVER_PORT% >nul 2>&1
netsh advfirewall firewall add rule name="SFTi WebSocket" dir=in action=allow protocol=TCP localport=%WS_PORT% >nul 2>&1

echo Firewall rules added.

REM Installation complete
echo.
echo ================================
echo Installation Complete!
echo ================================
echo.
echo Application installed to: %APP_DIR%
echo Configuration files: %APP_DIR%\config\
echo Log files: %APP_DIR%\logs\
echo.
echo To start the services:
echo   Double-click: %APP_DIR%\start.bat
echo   Or use the desktop shortcut
echo.
echo To stop the services:
echo   Double-click: %APP_DIR%\stop.bat
echo.
echo Web interface will be available at:
echo   http://localhost:%SERVER_PORT%
echo.
echo Next steps:
echo 1. Configure IBKR TWS/Gateway connection in %APP_DIR%\config\router\.env
echo 2. Start TWS or IB Gateway
echo 3. Run start.bat
echo 4. Open http://localhost:%SERVER_PORT% in your browser
echo.
echo For Windows Service installation:
echo 1. Download NSSM from https://nssm.cc/
echo 2. Extract nssm.exe to %APP_DIR%
echo 3. Run %APP_DIR%\install-service.bat as Administrator
echo.
pause