@echo off
setlocal

if "%~1"=="" (
  echo Usage: scripts\publish-pr.cmd "Commit message" [-VerifyOnly]
  exit /b 2
)

set "COMMIT_MESSAGE=%~1"
set "SCRIPT_DIR=%~dp0"
shift

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%publish-pr.ps1" -Message "%COMMIT_MESSAGE%" %1 %2 %3 %4 %5 %6 %7 %8 %9
exit /b %ERRORLEVEL%
