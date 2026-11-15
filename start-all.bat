@echo off
echo ========================================================
echo  EduTrack - College Attendance Management System
echo  MERN Stack + Socket.IO + MongoDB + Vite + Tailwind CSS
echo ========================================================
echo.
echo 1. Starting MongoDB in separate window...
start "MongoDB Service" cmd /k "start-mongodb.bat"
timeout /t 3 /nobreak >nul

echo 2. Starting Backend API on http://localhost:5000...
start "Backend API (Port 5000)" cmd /k "start-backend.bat"
timeout /t 3 /nobreak >nul

echo 3. Starting Frontend on http://localhost:5173...
start "Frontend UI (Port 5173)" cmd /k "start-frontend.bat"

echo.
echo ========================================================
echo All services launched!
echo Open your browser at: http://localhost:5173
echo.
echo Demo Login Credentials:
echo  - Admin:   admin@college.com   / Admin123
echo  - Teacher: teacher@college.com / Teacher123
echo  - Student: student@college.com / Student123
echo ========================================================
pause
