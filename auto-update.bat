@echo off
setlocal

cd /d "%~dp0"

echo Adding files...
git add .
if errorlevel 1 goto :fail

echo Committing changes...
git commit -m "auto update"
if errorlevel 1 goto :fail

echo Pushing to remote...
git push
if errorlevel 1 goto :fail

echo.
echo Done.
pause
exit /b 0

:fail
echo.
echo Failed.
pause
exit /b 1
