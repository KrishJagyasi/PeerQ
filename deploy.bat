@echo off
echo ========================================
echo StackIt - PeerQ Deployment Script
echo ========================================
echo.

echo [1/6] Checking if Git is installed...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)
echo ✓ Git is installed

echo.
echo [2/6] Initializing Git repository...
if not exist .git (
    git init
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)

echo.
echo [3/6] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/KrishJagyasi/PeerQ.git
echo ✓ Remote repository added

echo.
echo [4/6] Adding all files to Git...
git add .
echo ✓ Files added to staging

echo.
echo [5/6] Committing changes...
git commit -m "Initial commit: StackIt Q&A Platform - Complete implementation with all features"
echo ✓ Changes committed

echo.
echo [6/6] Pushing to GitHub...
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
    echo Please check your GitHub credentials and permissions
)

echo.
pause 