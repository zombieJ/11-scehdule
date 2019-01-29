echo "dist page..."
npm run dist
rm -rf /tmp/dist
mv dist /tmp/

echo "switch to page branch..."
git co gh-pages
mv /tmp/dist/* ./
rm -rf /tmp/dist

echo "upload..."
git add .
git commit -m "update docs"
git push -f

echo "back to master branch..."
git co -f master