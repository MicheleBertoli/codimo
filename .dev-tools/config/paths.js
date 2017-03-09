'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());

function resolveApp(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

module.exports = {
  appDist: resolveApp('dist'),
  appHtml: resolveApp('public/index.html'),
  appMainJs: resolveApp('src/main'),
  appPackageJson: resolveApp('package.json'),
  appPublic: resolveApp('public'),
  appSrc: resolveApp('src'),
  appNodeModules: resolveApp('node_modules'),
  devElements: resolveApp('dev-elements'),
  devPlayground: resolveApp('dev-elements/playground'),
  testsSetup: resolveApp('src/setupTests.js'),
  yarnLockFile: resolveApp('yarn.lock'),
};
