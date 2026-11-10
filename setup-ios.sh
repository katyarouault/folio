#!/bin/sh
# Builds the Folio iPhone app project and opens it in Xcode.
# Run it again any time the app's code changes.
set -e
cd "$(dirname "$0")"

echo "1/4  Copying the app into www/"
rm -rf www && mkdir www
cp index.html app.js styles.css www/
cp -R assets vendor www/

echo "2/4  Installing Capacitor"
npm install --no-audit --no-fund

echo "3/4  Creating / updating the Xcode project"
[ -d ios ] || npx cap add ios --packagemanager SPM
npx cap sync ios

PL=ios/App/App/Info.plist
setkey() { /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PL" 2>/dev/null || /usr/libexec/PlistBuddy -c "Add :$1 string $2" "$PL"; }
setkey NSCameraUsageDescription "Folio uses your camera to scan handwritten pages and notes."
setkey NSPhotoLibraryUsageDescription "Folio lets you pick photos of your notes to add to your library."
setkey NSPhotoLibraryAddUsageDescription "Folio saves pages you export to your photo library."

echo "4/4  Opening Xcode"
npx cap open ios
