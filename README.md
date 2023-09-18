# Node on Windows using PM2

For a reason beyond nature you **need** to run node server/app on window.  
Here is some of the options that I found useful:
- Use docker
- PM2 + Windows Task Scheduler
- PM2 + Windows Service

> **Note**  
> You probably can use the below methods with other P(rocess) M(anager)s, use your own wrapper or run node directly.


### Goals
* Simple
* Tools are localy installed  
`NPM install -g` is not always what you think it is on windows :)
* Don't mess up with system paths (there is one exception that I will mention below)


## What are we going to use?
* [PM2](https://github.com/Unitech/pm2) - a production process manager for Node.js applications with a built-in load balancer.
* [WinSW](https://github.com/winsw/winsw) - Windows Service Wrapper


## Preparations
Clone or download `WinPM2`.  
Place it in a "central" directory/location, e.g. `C:\NodeApps\WinPM2`, and then run:
```
npm install
``` 

## Setup PM2 
Inside the project root do the following:
1. Open an elevated cmd terminal and run `configure.bat`
1. `pm2 start examples\server.js`  
** it is for testing and demo
1. `pm2 install @jessety/pm2-logrotate`
1. `pm2 save`
1. `pm2 kill`

> **Note**  
> Always use `PM2` from elevated cmd terminal.  

> **Note**  
> Add `WinPM2` directory to system paths if you wish that `PM2` will be accessible from everywhere.  
I believe this is not essential on a production server.

> **Note**  
>the `logrotate` MP2 module is optional but you might like it  
> the command is `pm2 install @jessety/pm2-logrotate` NOT `npm install..`  

&nbsp;
### PM2 + Task Scheduler Option
#### Test it
1. `cd service`
1. run `pm2_task_scheduler_startup.bat`
1. open http://localhost:3000/

#### Go Live
1. Set up a task scheduler with "at system startup" trigger.  
1. Reboot (& test)
1. open http://localhost:3000/
 


### PM2 + Windows Service
#### Test it
1. `cd service`
1. `pm2_service_startup.bat`
1. open http://localhost:3000/

#### Go Live
1. `cd service`
1. open `WinSW_pm2.xml` and check that the settings is for your like
1. `WinSW_pm2.exe install`
1. `WinSW_pm2.exe start`
1. open http://localhost:3000/
1. Reboot (& test)


&nbsp;
### Notes for myself:

```
sc query pm2_service
sc qfailure pm2_service
```


## Bibliography
I read it so you don't have to, but at the end, it is up to you.

https://github.com/jessety/pm2-installer  
https://github.com/coreybutler/node-windows  
https://gist.github.com/zubair1024/8f6126db7ffbafd706f0e328ef8d4662  
more at https://stackoverflow.com/
