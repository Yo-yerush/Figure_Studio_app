@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "PORT=4173"
set "URL=http://127.0.0.1:%PORT%/"

echo Starting Figure Studio web app...
echo.

where py >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "%URL%"
    py -3 -m http.server %PORT% --bind 127.0.0.1
    goto :done
)

where python >nul 2>nul
if %ERRORLEVEL%==0 (
    start "" "%URL%"
    python -m http.server %PORT% --bind 127.0.0.1
    goto :done
)

echo Python was not found, so opening the app directly.
echo Some browsers restrict file downloads from local files; install Python for the local server path.
start "" "%~dp0index.html"

:done
echo.
echo App closed.
pause
