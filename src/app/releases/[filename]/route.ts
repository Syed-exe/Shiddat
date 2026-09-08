import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { RELEASE_ASSET_MAP, resolveGithubAssetUrl, contentTypeForFile } from '@/lib/config/releaseAssets';

// Runs on Cloudflare's edge/worker runtime (via OpenNext) as well as Node -
// `fetch` is the only API this route needs, so it works in both.
export const dynamic = 'force-dynamic';

// Serves installer binaries straight from this app's own `public/releases`
// folder whenever the CI build has actually placed them there (see
// .github/workflows/release.yml), so the file never has to leave our
// domain. Falls back to proxying the asset from GitHub Releases only when
// no local copy exists yet (e.g. this environment can't read the filesystem,
// or a release hasn't been synced locally yet) - same safety net as
// /api/app/download.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  const localAssetName = RELEASE_ASSET_MAP[filename];
  if (localAssetName) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'releases', localAssetName);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);
        const headers = new Headers();
        headers.set('Content-Type', contentTypeForFile(filename));
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Length', stat.size.toString());
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return new NextResponse(fileStream as any, { status: 200, headers });
      }
    } catch {
      // Filesystem isn't available on every runtime (e.g. Cloudflare
      // Workers) - that's expected, just fall through to the proxy below.
    }
  }

  const upstreamUrl = resolveGithubAssetUrl(filename);
  if (!upstreamUrl) {
    return new NextResponse('Requested release file was not found.', { status: 404 });
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      redirect: 'follow',
      headers: {
        // GitHub's release CDN wants a UA header or it can reject the request.
        'User-Agent': 'Shiddat-App-Release-Proxy',
      },
    });
  } catch (e) {
    console.error('[releases proxy] Failed to reach upstream release asset:', e);
    return new NextResponse('Unable to reach the release server. Please try again shortly.', {
      status: 502,
    });
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    console.error('[releases proxy] Upstream responded with', upstreamResponse.status);
    return new NextResponse('The requested release file is currently unavailable.', {
      status: 502,
    });
  }

  const headers = new Headers();
  headers.set('Content-Type', contentTypeForFile(filename));
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  const upstreamLength = upstreamResponse.headers.get('content-length');
  if (upstreamLength) headers.set('Content-Length', upstreamLength);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  // Stream the body straight through instead of buffering the whole file in memory.
  return new NextResponse(upstreamResponse.body, { status: 200, headers });
}
