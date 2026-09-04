@echo off
setlocal

REM Sync dados_faturas.json do servidor para repo local
REM Roda no clone local atual (pasta deste .bat)

set "BASE_DIR=%~dp0"
set "PYTHON=python"
if exist "%BASE_DIR%venv\Scripts\python.exe" set "PYTHON=%BASE_DIR%venv\Scripts\python.exe"
if exist "%BASE_DIR%venv_seinfra\Scripts\python.exe" set "PYTHON=%BASE_DIR%venv_seinfra\Scripts\python.exe"

if not exist "%BASE_DIR%sync_dados_faturas.py" (
    echo ERRO: sync_dados_faturas.py nao encontrado em %BASE_DIR%
    pause
    exit /b 1
)

%PYTHON% "%BASE_DIR%sync_dados_faturas.py" --repo "%BASE_DIR%"

pause