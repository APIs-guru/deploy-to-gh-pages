var path = require('path');

exports.prepareUpdate = function(folder, repoUrl) {
  // download current gh-pages content
  rm('-rf', '.ghpages-tmp');
  mkdir('-p', '.ghpages-tmp');
  cd('.ghpages-tmp');
  exec('git clone --depth=1 --branch=gh-pages ' + repoUrl + ' .');
  var relativeFolder = path.join('..', folder, '/');
  cp('-Rn', '.', relativeFolder); // copy, not overwrite
  rm('-rf', path.join(relativeFolder, '.git'));
  cd('..');
}
