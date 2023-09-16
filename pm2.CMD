@ECHO off
SET dp0=%~dp0
node  "%dp0%\node_modules\pm2\bin\pm2" %*
