#!/bin/bash
# Travis CI deployment script.
#
# See: https://medium.com/@nthgergo/publishing-gh-pages-with-travis-ci-53a8270e87db


# Exit on error or undefined
set -eu

(
    cd hamming-code
    npm install
    npm run build
)

TARGET=gh-pages

if [ -d "$TARGET" ]; then
    rm -rf "$TARGET"
fi

mkdir "$TARGET"

# Enable extended pattern matching operators
shopt -s extglob

# Copy everything excluding build files/artifacts and metadata
cp -r !(package.json|bin|node_modules|README.md|LICENSE|"$TARGET") "$TARGET"

# TODO: Setup DNS
#cp CNAME "$TARGET/CNAME"

cd "$TARGET"

# Remove dangling submodules and build dependencies
rm -rf */.git */node_modules */bower_components */.gitignore

git init
git config user.name "$GH_NAME"
git config user.email "$GH_EMAIL"

git add .
git commit -m 'Deployed to Github Pages'

# Output suppressed to prevent leaking GH_TOKEN
git push -f "https://${GH_TOKEN}@${GH_REF}" master:gh-pages 2>&1 | sed "s#${GH_TOKEN}#[secure]#g"
