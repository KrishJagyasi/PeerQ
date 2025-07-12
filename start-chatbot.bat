@echo off
echo ========================================
echo   PEERQ CHATBOT STARTUP
echo ========================================
echo.

echo Checking prerequisites...

echo 1. Checking if server is running...
node test-server-health.js > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Server is not running
    echo.
    echo Starting server...
    start "PeerQ Server" cmd /k "cd server && npm start"
    echo.
    echo Waiting for server to start...
    timeout /t 5 /nobreak > nul
) else (
    echo ✅ Server is already running
)

echo.
echo 2. Checking if client is running...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Client is not running
    echo.
    echo Starting client...
    start "PeerQ Client" cmd /k "cd client && npm start"
    echo.
    echo Waiting for client to start...
    timeout /t 10 /nobreak > nul
) else (
    echo ✅ Client is already running
)

echo.
echo 3. Testing chatbot functionality...
node test-chatbot.js
if %errorlevel% equ 0 (
    echo ✅ Chatbot is working correctly!
) else (
    echo ⚠️  Chatbot test failed - check your API keys
)

echo.
echo ========================================
echo   READY TO USE!
echo ========================================
echo.
echo 🌐 Open your browser to: http://localhost:3000
echo 🤖 Look for the floating chat button (bottom-right)
echo 📝 Register/login to start chatting with AI
echo.
echo If you see any issues:
echo - Run: check-status.bat
echo - Check: CHATBOT_SOLUTION.md
echo.
pause 