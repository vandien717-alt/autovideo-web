@echo off
cd /d "%~dp0"
cls

echo =====================================================
echo Autovideo Web - Start Script
echo =====================================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js va npm chua duoc cai dat.
    echo Vui long cai Node.js tai: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Kiem tra thu muc project...
if not exist package.json (
    echo ERROR: Khong tim thay file package.json.
    echo Hay chay script trong thu muc chua project.
    echo.
    pause
    exit /b 1
)

echo Kiem tra package...
if not exist node_modules (
    echo Chua co node_modules. Dang cai dat package...
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Khong the cai dat dependency.
        pause
        exit /b 1
    )
) else (
    echo Da tim thay node_modules.
)

echo.
echo Dang khoi dong ung dung...
call npm start
