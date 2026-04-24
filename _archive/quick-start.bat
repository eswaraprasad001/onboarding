@echo off
echo ========================================
echo  Employee Onboarding Platform Setup
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo Node.js found: 
node --version

echo.
echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Starting the development server...
echo The application will open in your browser automatically.
echo.
echo If it doesn't open automatically, visit:
echo http://localhost:3000 (or the port shown below)
echo.
echo Press Ctrl+C to stop the server when done testing.
echo.

call npm run dev
