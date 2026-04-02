@echo off
:: ============================================
:: 纳灵虚拟办公室 - Windows 部署脚本
:: ============================================
::
:: 使用方法:
::   deploy.bat          # Docker 部署
::   deploy.bat local    # 本地开发
::   deploy.bat stop     # 停止服务
::   deploy.bat restart  # 重启服务
::   deploy.bat logs     # 查看日志
::
:: ============================================

setlocal enabledelayedexpansion

set "APP_NAME=naling-virtual-office"
set "APP_PORT=3000"
set "IMAGE_NAME=naling/virtual-office"

:check_deps
where docker >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker 未安装
    echo 请先安装 Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
    exit /b 1
)

where docker-compose >nul 2>&1
if %ERRORLEVEL% neq 0 (
    where docker >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [INFO] docker-compose 可能内置于 Docker Desktop
    )
)

:start_docker
echo [INFO] 正在启动服务...
docker build -t %IMAGE_NAME%:latest .
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker 镜像构建失败
    exit /b 1
)

docker stop %APP_NAME% >nul 2>&1
docker rm %APP_NAME% >nul 2>&1

docker run -d ^
    --name %APP_NAME% ^
    -p %APP_PORT%:80 ^
    -e NODE_ENV=production ^
    --restart unless-stopped ^
    %IMAGE_NAME%:latest

echo [SUCCESS] 服务启动成功!
echo.
echo ==========================================
echo   虚拟办公室已启动
echo   访问地址: http://localhost:%APP_PORT%
echo ==========================================
goto :eof

:local
echo [INFO] 启动本地开发服务器...
call npm install
call npm run dev
goto :eof

:stop
echo [INFO] 停止服务...
docker stop %APP_NAME% >nul 2>&1
docker rm %APP_NAME% >nul 2>&1
echo [SUCCESS] 服务已停止
goto :eof

:restart
call :stop
timeout /t 2 >nul
call :start_docker
goto :eof

:logs
docker logs -f --tail=100 %APP_NAME%
goto :eof

:build
echo [INFO] 构建生产版本...
call npm install
call npm run build
echo [SUCCESS] 构建完成，产物在 dist\ 目录
goto :eof

:main
if "%~1"=="" goto :start_docker
if "%~1"=="local" goto :local
if "%~1"=="stop" goto :stop
if "%~1"=="restart" goto :restart
if "%~1"=="logs" goto :logs
if "%~1"=="build" goto :build

echo [ERROR] 未知选项: %~1
echo.
echo 用法:
echo   deploy.bat          # Docker 部署
echo   deploy.bat local    # 本地开发
echo   deploy.bat stop     # 停止服务
echo   deploy.bat restart  # 重启服务
echo   deploy.bat logs     # 查看日志
echo   deploy.bat build    # 构建生产版本
exit /b 1

endlocal
