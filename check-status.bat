@echo off
echo Checking Chatbot Status...
echo.

echo 1. Checking server status...
curl -s http://localhost:5000/api/health > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Server is running on http://localhost:5000
) else (
    echo ✗ Server is not running
    echo   Start with: npm run server
)

echo.
echo 2. Checking client status...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Client is running on http://localhost:3000
) else (
    echo ✗ Client is not running
    echo   Start with: cd client && npm start
)

echo.
echo 3. Testing chatbot API...
node test-chatbot.js

echo.
echo Status check complete!
pause 