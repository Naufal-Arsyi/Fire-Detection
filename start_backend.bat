@echo off
title Fire Detection Backend
echo =====================================
echo  FIRE DETECTION BACKEND STARTING
echo =====================================

REM pindah ke folder project
cd /d C:\laragon\www\firedetec

REM aktifkan virtual environment
call .venv\Scripts\activate.bat

REM masuk ke backend
cd backend

REM jalankan FastAPI
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload

pause
