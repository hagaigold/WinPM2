@echo off

::
:: set the PM2_HOME system variable
:: run this with elevated terminal 
::
SET dp0=%~dp0
set PM2_HOME=%dp0%home
setx PM2_HOME %PM2_HOME% /m

echo %PM2_HOME%

