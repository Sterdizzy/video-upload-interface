
import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/aws';

export async function POST(request: NextRequest) {
  try {
    const { fileName, expiresIn = 3600 } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    const presignedUrl = await generatePresignedUrl(fileName, expiresIn);

    return NextResponse.json({
      presignedUrl,
      expiresIn,
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
