@echo off
setlocal

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node runtime is not installed.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set "NODE_VERSION=%%i"

set "NODE_VERSION=%NODE_VERSION:v=%"

for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set "MAJOR_VERSION=%%i"

if %MAJOR_VERSION% LSS 18 (
    echo Node runtime version is %NODE_VERSION% which is lower than 18.
    exit /b 1
)

call mkcert -install

call mkcert -cert-file discord-back/localhost.pem -key-file discord-back/localhost-key.pem localhost

call mkcert -cert-file discord-front/localhost.pem -key-file discord-front/localhost-key.pem localhost

start /d discord-back cmd /c "npm i && npm start"

start /d discord-front cmd /c "npm i && npm start"

endlocal