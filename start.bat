@echo off
echo 🔄 Checking port 3000...

REM Kill any process using port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo 🔪 Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ Port 3000 is now free

echo 🚀 Starting Silambam Training API...
cd /d "%~dp0"

REM Start server
node server.js

pause
