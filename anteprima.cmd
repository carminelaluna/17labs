@echo off
REM ============================================================
REM  Apre il sito su un server locale invece che da file://
REM
REM  Serve perche' i moduli JavaScript (la scena 3D con three.js)
REM  sono bloccati dal CORS quando si apre l'HTML con un doppio
REM  click. Con un server vero funziona tutto.
REM
REM  Doppio click su questo file. Per chiudere: CTRL+C.
REM ============================================================
cd /d "%~dp0"
echo.
echo   17Labs - anteprima locale
echo   -------------------------
echo   IT    http://localhost:8177/
echo   EN    http://localhost:8177/en/
echo   LAB   http://localhost:8177/lab/
echo.
echo   Premi CTRL+C per fermare il server.
echo.
start "" http://localhost:8177/
python -m http.server 8177
