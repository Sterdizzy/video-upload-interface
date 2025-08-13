
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'csc-media-82828id98u884nfkwp937';

// Upload file to S3 using multipart upload
export async function uploadToS3(file: Buffer, fileName: string, contentType: string) {
  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Body: file,
        ContentType: contentType,
      },
      partSize: 5 * 1024 * 1024, // 5MB parts
      queueSize: 4,
    });

    // Track upload progress
    upload.on('httpUploadProgress', (progress) => {
      console.log(`Upload progress: ${progress?.loaded}/${progress?.total} bytes`);
    });

    const result = await upload.done();
    return result;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

// Generate presigned URL for uploading the video directly from the client
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
) {
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw error;
  }
}

// Generate presigned URL for viewing the video
export async function generatePresignedUrl(fileName: string, expiresIn: number = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}
