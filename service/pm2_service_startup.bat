@echo off

echo;
echo =====================================
echo ===  PM2_HOME: %PM2_HOME%  
echo =====================================
echo;

node .\pm2_wrapper\pm2.js

echo "Oops.. We shouldn't be here, but still, here we are!"

:: hopefuuly exit with code gteater the 0, will make the windows service manager try a restart [on-failure)
exit /b 42
