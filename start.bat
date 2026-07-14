@echo off
title Aurelia Restaurant
cd /d "%~dp0"

echo.
echo  =========================================
echo    AURELIA  ^|  Fine Dining Restaurant App
echo  =========================================
echo.

REM Kill anything on 8000 and 3000
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 "') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":3000 "') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

echo [1/2] Backend  ^> http://localhost:8000
start "Aurelia Backend" cmd /k "cd /d "%~dp0app\backend" && call venv\Scripts\activate.bat && python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000"

timeout /t 4 /nobreak >nul

echo [2/2] Frontend ^> http://localhost:3000
start "Aurelia Frontend" cmd /k "cd /d "%~dp0app\frontend" && set NODE_OPTIONS=--openssl-legacy-provider && npm start"

echo.
echo  =========================================
echo   Frontend  : http://localhost:3000
echo   Backend   : http://localhost:8000
echo   API Docs  : http://localhost:8000/docs
echo.
echo   Admin : admin@aurelia.com / Admin@123
echo  =========================================
echo.
echo  Wait ~60s for frontend to compile.
pause >nul
