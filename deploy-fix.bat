@echo off
echo ========================================
echo PeerQ - StackIt Deployment Script (Fixed)
echo ========================================
echo.

echo [1/7] Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo ✓ Git is installed

echo.
echo [2/7] Initializing Git repository...
if not exist .git (
    git init
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)

echo.
echo [3/7] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/KrishJagyasi/PeerQ.git
echo ✓ Remote repository added

echo.
echo [4/7] Adding all files to Git...
git add .
echo ✓ Files added to staging

echo.
echo [5/7] Committing changes...
git commit -m "Initial commit: StackIt Q&A Platform - Complete implementation with all features"
echo ✓ Changes committed

echo.
echo [6/7] Setting up main branch...
git branch -M main
echo ✓ Main branch created/renamed

echo.
echo [7/7] Pushing to GitHub...
git push -u origin main
if %errorlevel% equ 0 (
    echo ✓ Successfully pushed to GitHub!
    echo.
    echo ========================================
    echo DEPLOYMENT COMPLETE!
    echo ========================================
    echo Repository: https://github.com/KrishJagyasi/PeerQ.git
    echo.
    echo Next steps:
    echo 1. Check the repository on GitHub
    echo 2. Set up environment variables
    echo 3. Deploy to hosting platform
    echo.
) else (
    echo ERROR: Failed to push to GitHub
    echo.
    echo Troubleshooting steps:
    echo 1. Check if you have access to the repository
    echo 2. Verify your GitHub credentials
    echo 3. Try: git config --global user.name "Your Name"
    echo 4. Try: git config --global user.email "your.email@example.com"
    echo.
    echo Manual push command:
    echo git push -u origin main
)

echo.
pause 