@echo off
echo Starting Chatbot Application...
echo.

echo 1. Starting server on port 5000...
start "Server" cmd /k "npm run server"

echo 2. Waiting for server to start...
timeout /t 3 /nobreak > nul

echo 3. Starting client on port 3000...
start "Client" cmd /k "cd client && npm start"

echo.
echo Both server and client are starting...
echo.
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo Look for the floating chat button in the bottom-right corner!
echo.
pause 