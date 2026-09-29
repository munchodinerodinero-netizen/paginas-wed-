@echo off
cd /d "%~dp0"
if not exist .venv (echo Primero corre instalar.bat & pause & exit /b 1)
call .venv\Scripts\activate.bat
python app.py
pause
