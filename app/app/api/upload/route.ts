
import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, generatePresignedUrl } from '@/lib/aws';
import { sendVideoUploadNotification } from '@/lib/email';
import { generateUniqueFileName, validateVideoFile } from '@/lib/upload-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create a temporary File object for validation
    const tempFile = new File([await file.arrayBuffer()], file.name, {
      type: file.type,
    });

    // Validate file type
    const validation = validateVideoFile(tempFile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name);

    // Convert file to buffer for S3 upload
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to S3
    const uploadResult = await uploadToS3(buffer, uniqueFileName, file.type);

    // Generate presigned URL for viewing
    const presignedUrl = await generatePresignedUrl(uniqueFileName, 3600); // 1 hour

    // Send email notification
    try {
      await sendVideoUploadNotification(
        file.name,
        file.size,
        presignedUrl
      );
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the upload if email fails
    }

    return NextResponse.json({
      message: 'File uploaded successfully',
      fileName: uniqueFileName,
      originalName: file.name,
      fileSize: file.size,
      viewableUrl: presignedUrl,
      s3Location: uploadResult?.Location || '',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Note: In App Router, bodyParser is handled differently and doesn't need explicit config
