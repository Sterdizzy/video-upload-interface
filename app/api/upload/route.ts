
import { NextRequest, NextResponse } from 'next/server';
// Note: This endpoint handled multipart uploads to the server using Node APIs
// (Buffer, streaming). Cloudflare Pages (Next on Pages) requires Edge runtime
// for API routes, which does not support Node APIs or server-side file parsing.
// We disable this route and guide clients to use the presigned upload flow.

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error:
        'Direct server uploads are disabled on Cloudflare Pages. Use the presigned upload flow via /app/api/presigned-upload instead.',
    },
    { status: 405 }
  );
}

// Note: For Cloudflare Pages, clients should call `/app/api/presigned-upload` to get a
// presigned S3 URL, then upload directly to S3 from the browser, and optionally call
// `/app/api/notify` afterwards.
