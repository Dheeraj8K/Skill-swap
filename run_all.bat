@echo off
echo ========================================================
echo   Launching SkillSwap Platform (Backend + Frontend)
echo ========================================================

start "SkillSwap Backend (Port 3000)" cmd /k "cd backend && npm start"
timeout /t 2 /nobreak >nul
start "SkillSwap Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both services are starting in separate windows:
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:5173
echo.
pause
