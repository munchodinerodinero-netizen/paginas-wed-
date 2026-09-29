@echo off
cd /d "%~dp0"
echo Instalando Estudio de Video IA...
where python >nul 2>nul || (echo Falta Python. Instalalo desde https://www.python.org/downloads/ marcando "Add Python to PATH" y vuelve a correr este archivo. & pause & exit /b 1)
python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo.
echo Listo. Ahora abre iniciar.bat
pause
