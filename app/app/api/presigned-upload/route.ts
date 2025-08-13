import { NextRequest, NextResponse } from 'next/server';
import { generateUniqueFileName } from '@/lib/upload-utils';
import { generatePresignedUploadUrl } from '@/lib/aws';

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType } = await request.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    const key = generateUniqueFileName(fileName);
    const uploadUrl = await generatePresignedUploadUrl(key, contentType, 3600);

    return NextResponse.json({ key, uploadUrl, expiresIn: 3600 });
  } catch (error) {
    console.error('Error creating presigned upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to create presigned upload URL' },
      { status: 500 }
    );
  }
}
