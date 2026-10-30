@echo off
echo ========================================================
echo   Launching LearnLoop Platform (Backend + Frontend)
echo ========================================================

start "LearnLoop Backend (Port 3000)" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul
start "LearnLoop Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are starting in separate windows:
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:5173
echo.
pause
