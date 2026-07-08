@echo off
cd /d "%~dp0"

echo Starting Aurelia backend...
start "Aurelia Backend" cmd /c "cd app\backend && python -m venv venv 2>nul && call venv\Scripts\activate.bat && pip install -r requirements.txt 2>nul && uvicorn server:app --reload --host 0.0.0.0 --port 8000"

echo Starting Aurelia frontend...
start "Aurelia Frontend" cmd /c "set NODE_ENV=development&&set NODE_OPTIONS=--openssl-legacy-provider&& cd app\frontend && npm install 2>nul && npm run dev"

echo Aurelia is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
