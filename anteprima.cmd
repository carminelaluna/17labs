@echo off
REM ============================================================
REM  Apre V3 su un server locale invece che da file://
REM
REM  Serve perche' i moduli JavaScript (la scena 3D con three.js)
REM  sono bloccati dal CORS quando si apre l'HTML con un doppio
REM  click. Con un server vero funziona tutto.
REM
REM  Doppio click su questo file. Per chiudere: CTRL+C.
REM ============================================================
cd /d "%~dp0"
echo.
echo   17Labs V3 - anteprima locale
echo   ----------------------------
echo   IT    http://localhost:8179/
echo   EN    http://localhost:8179/en/
echo.
echo   Premi CTRL+C per fermare il server.
echo.
start "" http://localhost:8179/
python -m http.server 8179
