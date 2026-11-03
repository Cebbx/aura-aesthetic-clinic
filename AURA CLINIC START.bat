@echo off
title Aura Aesthetic Clinic - Live Server & Phone Sync
color 0b
cd /d "%~dp0"
node "server\launcher.mjs"
if %errorlevel% neq 0 (
  echo Error starting Aura Clinic Launcher.
  pause
)
