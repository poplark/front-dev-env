'use strict';

const path = require('path');
const fs = require('fs');
const preview = require('./preview');
const production = require('./production');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  common: {
    appDir: appDirectory,
    appHtml: resolveApp('public/index.html'),
  },
  preview,
  production
}