import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { resolveGithubAssetUrl, contentTypeForFile } from '@/lib/config/releaseAssets';

export const dynamic = 'force-dynamic';

const LOCAL_CANDIDATES = ['Shiddat-1.1.0.apk', 'Shiddat-latest.apk', 'Shiddat.apk'];

export async function GET() {
  // 1) If a build has actually bundled the APK locally (e.g. a packaged
  //    Electron/Node deployment), serve that copy directly - fastest path.
  for (const candidate of LOCAL_CANDIDATES) {
    try {
      const filePath = path.join(process.cwd(), 'public/releases', candidate);
      if (fs.existsSync(filePath)) {
        const fileStream = fs.createReadStream(filePath);
        const stat = fs.statSync(filePath);
        return new NextResponse(fileStream as any, {
          headers: {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Disposition': `attachment; filename="${candidate}"`,
            'Content-Length': stat.size.toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        });
      }
    } catch {
      // Filesystem access isn't available on every runtime (e.g. Cloudflare
      // Workers) - that's expected, just fall through to the proxy below.
      break;
    }
  }

  // 2) Otherwise, proxy the real APK from GitHub Releases through our own
  //    domain so the request never leaves our app and never surfaces a
  //    github.com redirect to the user.
  const upstreamUrl = resolveGithubAssetUrl('Shiddat.apk');
  if (!upstreamUrl) {
    return new NextResponse('APK update file not found.', { status: 404 });
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Shiddat-App-Release-Proxy' },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      console.error('[APK Stream API] Upstream responded with', upstreamResponse.status);
      return new NextResponse('The APK is currently unavailable. Please try again shortly.', {
        status: 502,
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentTypeForFile('Shiddat.apk'));
    headers.set('Content-Disposition', 'attachment; filename="Shiddat.apk"');
    const upstreamLength = upstreamResponse.headers.get('content-length');
    if (upstreamLength) headers.set('Content-Length', upstreamLength);
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    return new NextResponse(upstreamResponse.body, { status: 200, headers });
  } catch (e: any) {
    console.error('[APK Stream API] Failed to proxy update APK:', e);
    return new NextResponse('Internal server error streaming APK file.', { status: 500 });
  }
}
