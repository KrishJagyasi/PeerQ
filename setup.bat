@echo off
echo ========================================
echo PeerQ - StackIt Setup Script
echo ========================================
echo.

echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo.
echo [2/5] Installing backend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed

echo.
echo [3/5] Installing frontend dependencies...
cd client
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Frontend dependencies installed

echo.
echo [4/5] Creating environment file...
if not exist .env (
    copy env.example .env
    echo ✓ Environment file created from template
    echo.
    echo IMPORTANT: Please edit .env file with your MongoDB credentials
) else (
    echo ✓ Environment file already exists
)

echo.
echo [5/5] Setup complete!
echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your MongoDB credentials
echo 2. Run 'npm run dev' to start the application
echo 3. Open http://localhost:3000 in your browser
echo.
echo For deployment:
echo 1. Run 'deploy.bat' to upload to GitHub
echo 2. Set up hosting platform (Vercel, Heroku, etc.)
echo.

pause 