@echo off
echo ========================================
echo           PeerQ - Git Pull
echo ========================================
echo.

echo [1/3] Checking if we're in a Git repository...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not in a Git repository!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [2/3] Fetching latest changes from remote...
git fetch origin
if %errorlevel% neq 0 (
    echo ERROR: Failed to fetch from remote repository!
    pause
    exit /b 1
)

echo [3/3] Pulling latest changes...
git pull origin main
if %errorlevel% neq 0 (
    echo ERROR: Failed to pull changes!
    echo You may have local changes that conflict with remote changes.
    echo Please commit or stash your local changes first.
    pause
    exit /b 1
)

echo.
echo ========================================
echo           Pull Successful!
echo ========================================
echo.
echo Your local repository is now up to date.
echo.
echo Recent commits:
git log --oneline -5
echo.
echo ========================================
pause 