import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/aws';
import { sendVideoUploadNotification } from '@/lib/email';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { key, originalName, fileSize, senderName, senderEmail } = await request.json();

    if (!key || !originalName || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'key, originalName and fileSize are required' },
        { status: 400 }
      );
    }

    const viewableUrl = await generatePresignedUrl(key, 604800);

    // Send notification via Edge-compatible email provider
    try {
      await sendVideoUploadNotification(
        originalName,
        fileSize,
        viewableUrl,
        senderName,
        senderEmail
      );
    } catch (emailError) {
      console.warn('Email notification failed (non-fatal):', emailError);
    }

    return NextResponse.json({
      message: 'Notification sent',
      fileName: key,
      originalName,
      fileSize,
      viewableUrl,
      senderName: senderName || null,
      senderEmail: senderEmail || null,
    });
  } catch (error) {
    console.error('Error in notify route:', error);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
