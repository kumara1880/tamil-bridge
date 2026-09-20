@echo off
title Tamil Bridge
cd /d "%~dp0"

echo.
echo   ======================================
echo    Tamil Bridge  -  தமிழ் பாலம்
echo   ======================================
echo.

where python >nul 2>&1
if %errorlevel%==0 (
  echo   Starting local server on http://localhost:5177
  echo   Keep this window open while you use the app.
  echo   Close it when you are done.
  echo.
  start "" http://localhost:5177
  python -m http.server 5177
  goto :eof
)

where node >nul 2>&1
if %errorlevel%==0 (
  echo   Starting local server on http://localhost:5177
  start "" http://localhost:5177
  npx --yes serve -l 5177 .
  goto :eof
)

echo   No Python or Node found - opening the file directly instead.
echo   Everything works this way too.
echo.
start "" "%~dp0index.html"
timeout /t 3 >nul
