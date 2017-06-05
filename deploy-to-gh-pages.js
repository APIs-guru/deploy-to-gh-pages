#!/usr/bin/env node
'use strict';

require('shelljs/global');
var argv = require('yargs')
  .boolean('update')
  .boolean('local')
  .argv;

var prepareUpdate = require('./update').prepareUpdate;

function safeOutput(str) {
  if (!process.env.GH_TOKEN) return str;
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
  console.error('Missed argument <folder>:\nUsage: deploy-to-gh-pages [--repo <repo>] [--update] <folder>');
  process.exit(1);
}

if (!argv.local && !process.env.GH_TOKEN) {
  console.error('You need to setup GH_TOKEN environment variable')
  process.exit(1);
}

var folder = argv._[0];

function getRepoUrl() {
  if (argv.repo) {
    if (argv.repo.split('/').length !== 2)
      throw Error('Repo should be specified as "<org_name|user_name>/<repo_name>"');
    return 'https://github.com/' + argv.repo + '.git';
  }

  var repo = exec('git config --get remote.origin.url').stdout;
  repo = repo && repo.trim();
  if (!argv.local && repo.substring(0, 8) !== 'https://')
    throw Error('This tool works only for https:// protocol');
  return repo;
}

function doRelease() {
  var GH_REPO = getRepoUrl();

  if (argv.update) {
    prepareUpdate(folder, GH_REPO);
  }

  cd(folder);
  exec('git init')

  if (!argv.local) {
    exec('git config user.name "Travis-CI"');
    exec('git config user.email "travis@travis"');
  }

  exec('git add .');
  exec('git commit -m "Deployed to Github Pages"');

  var GH_URL = GH_REPO;
  if (!argv.local) {
    GH_URL = GH_REPO.replace('://', '://' + process.env.GH_TOKEN + '@');
  }

  safeExec('git push --force "' + GH_URL + '" master:gh-pages');
}

try {
  doRelease();
} catch(e) {
  console.log(safeOutput(e.message));
  process.exit(1);
}

console.log('Deployed successfully');
