@echo off
title Frontera Inteligente - Detener Backend
color 0E

echo.
echo  ============================================================
echo    DETENIENDO EL BACKEND
echo  ============================================================
echo.
echo  Se cerraran SOLO las ventanas de los microservicios lanzados
echo  por ejecutar-backend.bat (y su proceso Java hijo).
echo  No afecta otros programas Java como tu IDE.
echo.

:: Cerrar cada ventana por su titulo. El /t mata el arbol de
:: procesos, incluido el java.exe hijo de ese servicio.
for %%S in (eureka-server api-gateway ms-autenticacion ms-fila-virtual ms-notificaciones ms-preregistro ms-validacion ms-reportes ms-operaciones) do (
    taskkill /fi "WINDOWTITLE eq %%S*" /t /f >nul 2>&1
)

echo.
echo  Backend detenido.
echo.
pause
