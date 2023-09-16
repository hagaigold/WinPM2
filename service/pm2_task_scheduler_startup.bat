@echo off

echo;
echo =====================================
echo ===  PM2_HOME: %PM2_HOME%  
echo =====================================
echo;


:: Ensure that pm2 command is part of your PATH variable
::  if you're not sure, add it here, as follow:
set dp0=%~dp0
set path=%path%;%dp0%\..\

:: Optionally, you can add 'pm2 kill' just before 
::  resurrect (adding a sleep between 2 commands):
::  	pm2 kill
::  	timeout /t 5 /nobreak > NUL
::  	pm2 resurrect
:: otherwise, you can simple call resurrect as follow:

pm2 resurrect

echo "Done"
