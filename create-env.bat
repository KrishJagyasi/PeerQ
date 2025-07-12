@echo off
echo 🔧 Creating .env file for PeerQ...
echo.

if exist .env (
    echo ✅ .env file already exists
    echo.
) else (
    echo 📝 Creating .env file...
    echo.
    (
        echo # Database Configuration
        echo MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/stackit
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secret-jwt-key-here
        echo.
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # Client Configuration ^(for React app^)
        echo REACT_APP_API_URL=http://localhost:5000
        echo REACT_APP_SOCKET_URL=http://localhost:5000
        echo.
        echo # AI Configuration
        echo GEMINI_API_KEY=your-gemini-api-key-here
    ) > .env
    echo ✅ .env file created successfully
    echo.
)

echo 📋 Next Steps:
echo 1. Edit the .env file with your actual values
echo 2. Get a Gemini API key from: https://makersuite.google.com/app/apikey
echo 3. Set up your MongoDB database
echo 4. Generate a secure JWT secret
echo.
echo 💡 For Gemini API:
echo    - Visit https://makersuite.google.com/app/apikey
echo    - Create a new API key
echo    - Replace "your-gemini-api-key-here" in .env
echo.
echo 🚀 The chatbot will work with fallback responses even without the API key!
echo.
pause 