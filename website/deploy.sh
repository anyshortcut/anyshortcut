#!/usr/bin/env bash
set -e

BRANCH="website"

build() {
  echo "Starting building..."
  npm install

  export NODE_ENV=production
  npm run build

  sudo snap install --edge zola
  zola build

  mv public /tmp/public
  cd ..
}

deploy() {
  echo "Starting deploying..."
  git config --global url."https://".insteadOf git://
  git config --global url."https://github.com/".insteadOf git@github.com:

  # fatal: 'website' could be both a local file and a tracking branch.
  # Please use -- (and optionally --no-guess) to disambiguate
  git checkout ${BRANCH} --
  cp -vr /tmp/public/* .
  git config user.name "GitHub Actions"
  git config user.email "github-actions-bot@users.noreply.github.com"
  git add .
  git commit -m "Deploy new version"
  git push --force "https://${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git" ${BRANCH}

  echo "Deploy complete"
}

build
deploy