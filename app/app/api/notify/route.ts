import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/aws';
import { sendVideoUploadNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { key, originalName, fileSize } = await request.json();

    if (!key || !originalName || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'key, originalName and fileSize are required' },
        { status: 400 }
      );
    }

    const viewableUrl = await generatePresignedUrl(key, 3600);

    try {
      await sendVideoUploadNotification(originalName, fileSize, viewableUrl);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // do not fail the request on email issues
    }

    return NextResponse.json({
      message: 'Notification sent',
      fileName: key,
      originalName,
      fileSize,
      viewableUrl,
    });
  } catch (error) {
    console.error('Error in notify route:', error);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
