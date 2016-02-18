#!/bin/bash

if [ -z "$GH_TOKEN" ]; then
  echo "You need to setup GH_TOKEN variable" 2>&1
  exit 1
fi

set -o pipefail
(
  set -e
  set -x

  GH_REPO=$(git config --get remote.origin.url)

  cd $1

  git init

  git config user.name "Travis-CI"
  git config user.email "travis@travis"

  git add .
  git commit -m "Deployed to Github Pages"

  GH_URL=$(echo "$GH_REPO" | sed "s#://#&${GH_TOKEN}@#")
  git push --force "$GH_URL" master:gh-pages 2>&1
) 2>&1 | sed "s/${GH_TOKEN}/xxPASSxx/"
