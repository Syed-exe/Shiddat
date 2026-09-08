// Central place that maps the file names our own app exposes (e.g. /releases/Shiddat.apk)
// to the real binary sitting on GitHub Releases. Both /releases/[filename] and
// /api/app/download read from this map so there is exactly one place to update
// when a new version is published.
//
// Uses GitHub's stable "latest" redirect URL — this always points at whatever
// release is currently marked Latest, so publishing a new release (via the
// GitHub Actions workflow in .github/workflows/release.yml) never requires
// touching this file again, as long as the asset file names stay the same.

export const GITHUB_RELEASE_BASE =
  'https://github.com/Astrionix/Shiddat/releases/latest/download';

// filename the browser asks our app for -> actual asset filename on the GitHub release
export const RELEASE_ASSET_MAP: Record<string, string> = {
  'Shiddat-Windows-Universal.exe': 'Shiddat-Windows-Universal.exe',
  'Shiddat-Windows-Portable.exe': 'Shiddat-Windows-Portable.exe',
  'Shiddat-macOS-Universal.dmg': 'Shiddat-macOS-Universal.dmg',
  'Shiddat-macOS-arm64.dmg': 'Shiddat-macOS-Universal.dmg',
  'Shiddat-macOS-intel.dmg': 'Shiddat-macOS-Universal.dmg',
  'Shiddat-latest.apk': 'Shiddat.apk',
  'Shiddat.apk': 'Shiddat.apk',
  'Shiddat-1.1.0.apk': 'Shiddat.apk',
};

export function resolveGithubAssetUrl(requestedFileName: string): string | null {
  const assetName = RELEASE_ASSET_MAP[requestedFileName];
  if (!assetName) return null;
  return `${GITHUB_RELEASE_BASE}/${assetName}`;
}

export function contentTypeForFile(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.apk')) return 'application/vnd.android.package-archive';
  if (lower.endsWith('.exe')) return 'application/vnd.microsoft.portable-executable';
  if (lower.endsWith('.dmg')) return 'application/x-apple-diskimage';
  return 'application/octet-stream';
}
