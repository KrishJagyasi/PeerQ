@echo off
echo Checking Chatbot Status...
echo.

echo 1. Checking server status...
node test-server-health.js
if %errorlevel% equ 0 (
    echo ✓ Server is healthy and running
) else (
    echo ✗ Server health check failed
    echo   Start with: cd server && npm start
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