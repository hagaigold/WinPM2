/*
    base on the work of https://github.com/jessety/pm2-installer
*/

/*
  MIT License

  Copyright (c) 2008-2020 Kohsuke Kawaguchi, Sun Microsystems, Inc., CloudBees,
  Inc., Oleg Nenashev and other contributors

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
*/

'use strict';

const output = require('./output.js');
const os = require('os');
const process = require('process');
const { promisify } = require('util');
const path = require('path'); 


output.log(`\n\n\nStarting: ${new Date().toLocaleString()}`);

const PM2_BASE = path.join(__dirname, '..', '..')
process.env.PM2_BASE = PM2_BASE;

const {
  PM2_HOME,
  PM2_INSTALL_DIRECTORY,
  PM2_SERVICE_DIRECTORY,
} = require('./env.js');

output.log(`PM2_BASE:              ${PM2_BASE}`);
output.log(`PM2_HOME:              ${PM2_HOME}`);
output.log(`PM2_SERVICE_DIRECTORY: ${PM2_SERVICE_DIRECTORY}`);
output.log(`PM2_INSTALL_DIRECTORY: ${PM2_INSTALL_DIRECTORY}`);

output.log(`Working directory:     ${process.cwd()}`);
output.log(`Script directory:      ${__dirname}`);
output.log(`Running as user:       ${os.userInfo().username}`);

// Make sure to set the PM2_HOME in the process env, becasue pm2 pulls from process.env
process.env.PM2_HOME = PM2_HOME;

// Make pm2 more verbose
process.env.PM2_DEBUG = true;

// Require `pm2` from its global install location
//const pm2 = require(PM2_INSTALL_DIRECTORY);

// local pm2
const pm2 = require('pm2');

// Define a couple settings
pm2.daemon_mode = false;
pm2.Client.daemon_mode = false;

// Listen for events
pm2.launchBus((error, bus) => {
  if (error) {
    output.error('Caught error launching message bus:', error);
    return;
  }

  output.log('Successfully launched message bus.');

  // bus.on('*', (type, message) => output.log('pm2 bus', type, message));
  // bus.on('log:out', (message) => output.log('pm2bus:out', message));
  // bus.on('log:err', (message) => output.error('pm2bus:err', message));
  // bus.on('log:PM2', message => console.log(message.data.trim()));

  bus.on('process:event', (message) => {
    const { event, process, manually } = message;
    const { name, namespace, version } = process;

    output.log(
      `${namespace ? `${namespace}/` : ''}${name}@${version} - ${event} - ${
        manually ? 'MANUAL' : 'AUTOMATED'
      }`,
    );
  });
});

output.log('Starting pm2..');

pm2.connect(false, (error) => {
  if (error) {
    output.error('Caught error starting pm2:', error);
    process.exit(1);
  }

  output.log('Successfully started pm2.');

  // If a pm2 dump exists, resurrect all the processes set there
  // If not, the callback will never be executed, and we're done.

  pm2.resurrect((error) => {
    if (error) {
      output.error('Caught error resurrecting pm2 processes:', error);
      return;
    }

    output.log('Resurrection successful. Listing processes..');

    pm2.list((error, list) => {
      if (error) {
        output.warn(`Caught error listing processes:`, error);
        return;
      }

      if (list.length === 0) {
        output.log(`Running 0 processes.`);
        return;
      }

      output.log(
        `Running ${list.length} process${list.length !== 1 ? 'es' : ''}: ${list
          .map((process) => process.name)
          .join(', ')}`,
      );
    });
  });
});

// Handle process exits

process.once('beforeExit', async (code) => {
  output.log(`beforeExit code ${code}`);

  if (pm2) {
    output.log(`Killing pm2 daemon..`);
    await promisify(pm2.killDaemon);

    output.log(`Disconnecting from pm2..`);
    await promisify(pm2.disconnect);
  }
});

const handle = async (type) => {
  output.log(`Caught ${type}`);

  if (pm2) {
    output.log(`Disconnecting from pm2..`);
    await promisify(pm2.disconnect);
    process.exit(1);
  }
}

for (const key of ['SIGINT', 'SIGHUP', 'SIGTERM']) {
  process.once(key, () => handle(key));
}

process.once('exit', (code) => {
  output.log(`exit code ${code}`);
});

process.on('uncaughtException', async (error) => {
  output.log(
    `${new Date().toLocaleString()} service\\index.js Uncaught Exception`,
    error.message,
    error.stack !== undefined ? error.stack : undefined,
  );
  process.exit(1);
});

process.on('unhandledRejection', async (error) => {
  output.log(
    `${new Date().toLocaleString()} service\\index.js Unhandled Rejection`,
    error.message,
    error.stack !== undefined ? error.stack : undefined,
  );
});
