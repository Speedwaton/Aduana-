@echo off
setlocal enabledelayedexpansion
title Frontera Inteligente - Backend Launcher
color 0B

cd /d "%~dp0"

echo.
echo  ============================================================
echo    FRONTERA INTELIGENTE LOS LIBERTADORES - BACKEND
echo    Levantando microservicios Spring Boot...
echo  ============================================================
echo.

:: ---------------------------------------------------------------
:: 1) Verificar requisitos (Java y Maven)
:: ---------------------------------------------------------------
where java >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Java no esta instalado o no esta en el PATH.
    echo          Se necesita Java 17 o superior.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do echo  Java: %%v

where mvn >nul 2>&1
if errorlevel 1 (
    color 0C
    echo  [ERROR] Maven ^(mvn^) no esta en el PATH.
    echo          Los wrappers mvnw.cmd de este proyecto estan incompletos,
    echo          asi que se necesita Maven global. Descargalo de:
    echo          https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo  Maven global: OK
echo.

:: ---------------------------------------------------------------
:: 2) Orden de arranque (Eureka primero, Gateway al final)
:: ---------------------------------------------------------------
echo  [1/9] Iniciando eureka-server (:8761)...
call :launch "eureka-server" "eureka-server"

echo        Esperando 30s a que Eureka este disponible...
timeout /t 30 /nobreak >nul

echo  [2/9] ms-autenticacion  (:8081)
call :launch "ms-autenticacion" "ms-autenticacion"
echo  [3/9] ms-fila-virtual    (:8082)
call :launch "ms-fila-virtual" "MS-Fila-Virtual"
echo  [4/9] ms-notificaciones  (:8083)
call :launch "ms-notificaciones" "ms-notificaciones"
echo  [5/9] ms-preregistro     (:8084)
call :launch "ms-preregistro" "ms-preregistro"
echo  [6/9] ms-validacion      (:8085)
call :launch "ms-validacion" "ms-validacion"
echo  [7/9] ms-reportes        (:8086)
call :launch "ms-reportes" "ms-reportes"
echo  [8/9] ms-operaciones     (:8087)
call :launch "ms-operaciones" "ms-operaciones"

echo        Esperando 20s antes de levantar el Gateway...
timeout /t 20 /nobreak >nul

echo  [9/9] api-gateway        (:8080)
call :launch "api-gateway" "api-gateway"

echo.
echo  ============================================================
echo    Todos los servicios fueron lanzados en ventanas aparte.
echo    Cada ventana muestra sus propios logs.
echo.
echo    API Gateway .......... http://localhost:8080
echo    Eureka Dashboard ..... http://localhost:8761
echo.
echo    Para detener todo, ejecuta: detener-backend.bat
echo  ============================================================
echo.
pause
exit /b 0

:: ===============================================================
:: Subrutina :launch  NOMBRE  CARPETA
:: Abre cada servicio en su propia ventana usando Maven global.
:: 'start /D' fija el directorio de trabajo (evita comillas anidadas).
:: ===============================================================
:launch
set "SVC_NAME=%~1"
set "SVC_DIR=%~dp0%~2"
if not exist "%SVC_DIR%" (
    echo  [AVISO] No existe la carpeta "%SVC_DIR%". Se omite %SVC_NAME%.
    goto :eof
)
start "%SVC_NAME%" /D "%SVC_DIR%" cmd /k mvn spring-boot:run
goto :eof
