@echo off
echo ========================================
echo   PEERQ CHATBOT SETUP
echo ========================================
echo.

echo Checking if .env file exists...
if not exist "server\.env" (
    echo Creating .env file from template...
    copy "env.example" "server\.env"
    echo.
    echo ⚠️  IMPORTANT: Please edit server\.env and add your:
    echo    - MONGODB_URI (MongoDB connection string)
    echo    - JWT_SECRET (any random secret string)
    echo    - GEMINI_API_KEY (from Google AI Studio)
    echo.
    echo Get your Gemini API key from: https://makersuite.google.com/app/apikey
    echo.
    pause
) else (
    echo .env file already exists.
)

echo.
echo Checking if MongoDB is running...
echo (Make sure MongoDB is installed and running)

echo.
echo Checking if Node.js dependencies are installed...
if not exist "server\node_modules" (
    echo Installing server dependencies...
    cd server
    npm install
    cd ..
) else (
    echo Server dependencies already installed.
)

if not exist "client\node_modules" (
    echo Installing client dependencies...
    cd client
    npm install
    cd ..
) else (
    echo Client dependencies already installed.
)

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo To start the application:
echo 1. Start the server: npm run server
echo 2. Start the client: npm run client
echo 3. Open http://localhost:3000 in your browser
echo 4. Register/login to access the chatbot
echo 5. Look for the floating chat button (bottom-right)
echo.
echo To test the chatbot API:
echo node test-chatbot.js
echo.
pause 