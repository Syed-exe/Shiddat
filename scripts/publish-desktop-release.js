/**
 * Shiddat Desktop Release Publisher
 *
 * Runs after electron-builder finishes (see the desktop:build:* scripts in
 * package.json). Copies whatever installers were just built out of `dist/`
 * into `public/releases/` using the exact file names our own download
 * system expects (src/lib/config/releaseAssets.ts + /releases/[filename]).
 *
 * This is what lets the app serve Windows/macOS installers straight from
 * our own domain instead of proxying GitHub - same idea as apk:build
 * already does for the Android APK.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const releasesDir = path.join(rootDir, 'public', 'releases');

// Source file (as produced by electron-builder, per package.json's
// nsis/portable/dmg artifactName settings) -> the name our download
// system serves it as.
const PUBLISH_MAP = {
  'Shiddat-Windows-Universal.exe': 'Shiddat-Windows-Universal.exe',
  'Shiddat-Windows-Portable.exe': 'Shiddat-Windows-Portable.exe',
  'Shiddat-macOS-Universal.dmg': 'Shiddat-macOS-Universal.dmg',
};

if (!fs.existsSync(distDir)) {
  console.warn('⚠️ [Publish Release] No dist/ folder found - nothing to publish. Did the build step run first?');
  process.exit(0);
}

if (!fs.existsSync(releasesDir)) {
  fs.mkdirSync(releasesDir, { recursive: true });
}

let publishedCount = 0;
for (const [sourceName, destName] of Object.entries(PUBLISH_MAP)) {
  const sourcePath = path.join(distDir, sourceName);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, path.join(releasesDir, destName));
    console.log(`📦 [Publish Release] ${sourceName} -> public/releases/${destName}`);
    publishedCount += 1;
  }
}

if (publishedCount === 0) {
  console.warn('⚠️ [Publish Release] No matching installers found in dist/. Nothing published.');
} else {
  console.log(`🎉 [Publish Release] ${publishedCount} installer(s) published to public/releases/.`);
}
