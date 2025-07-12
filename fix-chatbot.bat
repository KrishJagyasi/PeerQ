@echo off
echo Fixing Chatbot Issues...
echo.

echo 1. Installing missing client dependencies...
cd client
call npm install react-scripts@^5.0.1
if %errorlevel% neq 0 (
    echo Failed to install react-scripts
    pause
    exit /b 1
)

echo.
echo 2. Installing missing server dependencies...
cd ..
call npm install @google/generative-ai
if %errorlevel% neq 0 (
    echo Failed to install Gemini AI package
    pause
    exit /b 1
)

echo.
echo 3. Testing server imports...
node test-server.js
if %errorlevel% neq 0 (
    echo Server test failed
    pause
    exit /b 1
)

echo.
echo 4. Starting the application...
echo Starting server and client...
call npm run dev

echo.
echo Chatbot should now be working!
echo Look for the floating chat button in the bottom-right corner
pause 