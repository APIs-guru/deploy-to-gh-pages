#!/usr/bin/env node
'use strict';

require('shelljs/global');
var argv = require('yargs')
  .boolean('update')
  .argv;

var prepareUpdate = require('./update').prepareUpdate;

function safeOutput(str) {
  return str.replace(new RegExp(process.env.GH_TOKEN, 'g'), 'xxPASSxx');
}

function safeExec(command) {
  set('+v');
  set('+e');
  console.log(safeOutput(command));
  var res = exec(command, {silent:true});
  if (res.code == 0) {
    console.log(safeOutput(res.stdout));
  } else {
    console.error(safeOutput(res.stderr));
    process.exit(1);
  }
  set('-e');
  set('-v');
  return res;
}

set('-e');
set('-v');

if (argv._.length < 1) {
  console.error('Missed argument <folder>:\nUsage: deploy-to-gh-pages [--update] <folder>');
  process.exit(1);
}

if (!process.env.GH_TOKEN) {
  console.error('You need to setup GH_TOKEN environment variable')
  process.exit(1);
}

var folder = argv._[0];
var GH_REPO=exec('git config --get remote.origin.url').stdout;
GH_REPO = GH_REPO && GH_REPO.trim();
if (GH_REPO.substring(0, 8) !== 'https://') {
  console.log('This tool works only for https:// protocol');
  process.exit(1);
}

function doRelease() {
  if (argv.update) {
    prepareUpdate(folder, GH_REPO);
  }

  cd(folder);
  exec('git init')
  exec('git config user.name "Travis-CI"');
  exec('git config user.email "travis@travis"');

  exec('git add .');
  exec('git commit -m "Deployed to Github Pages"');

  var GH_URL= GH_REPO.replace('://', '://' + process.env.GH_TOKEN + '@');
  safeExec('git push --force "' + GH_URL + '" master:gh-pages');
}

try {
  doRelease();
} catch(e) {
  console.log(safeOutput(e.message));
  process.exit(1);
}

console.log('Deployed successfully');
