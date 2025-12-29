@echo off
echo =====================================
echo  FIRE DETECTION BACKEND STARTING
echo =====================================

REM pindah ke folder project
cd /d D:\CompVis\firedetec

REM aktifkan virtual environment
call .venv\Scripts\activate

REM masuk ke backend
cd backend

REM jalankan FastAPI
python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload

pause
