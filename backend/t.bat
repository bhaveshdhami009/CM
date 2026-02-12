@echo off
setlocal

:: Get the full file path from the first argument
set "fullpath=%~1"

:: Extract the directory path
for %%F in ("%fullpath%") do set "folder=%%~dpF"

:: Create the directory structure
mkdir "%folder%" 2>nul

:: Create the file if it doesn't exist
if not exist "%fullpath%" (
    echo ^<?php> "%fullpath%"
    echo.>> "%fullpath%"
)

:: Open with Notepad++
start "" "C:\Program Files\Notepad++\notepad++.exe" "%fullpath%"

endlocal
