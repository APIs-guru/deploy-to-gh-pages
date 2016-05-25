#!/usr/bin/env node
'use strict';

require('shelljs/global');

function safeOutput(str) {
  return str.replace(new RegExp(process.env.GH_TOKEN, 'g'), 'xxPASSxx');
}

function execAndLog(command) {
  console.log('+ ' + safeOutput(command));
  return exec(command);
}

set('-e');

if (process.argv.length < 3) {
  console.error('Missed argument <folder>:\nUsage: deploy-to-gh-pages <folder>');
  process.exit(1);
}

if (!process.env.GH_TOKEN) {
  console.error('You need to setup GH_TOKEN environment variable')
  process.exit(1);
}

var folder = process.argv[2];
var GH_REPO=execAndLog('git config --get remote.origin.url').stdout;
if (GH_REPO.substring(0, 8) !== 'https://') {
  console.log('This tool works only for https:// protocol');
  process.exit(1);
}

function doRelease() {
  console.log('+ cd ' + folder);
  cd(folder);
  execAndLog('git init')
  execAndLog('git config user.name "Travis-CI"');
  execAndLog('git config user.email "travis@travis"');

  execAndLog('git add .');
  execAndLog('git commit -m "Deployed to Github Pages"');

  var GH_URL= GH_REPO.replace('://', '://' + process.env.GH_TOKEN + '@').trim();
  execAndLog('git push --force "' + GH_URL + '" master:gh-pages');
}

try {
  doRelease();
} catch(e) {
  console.log(safeOutput(e.message));
  process.exit(1);
}

console.log('Deployed successfully');
