const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME || 'csc-media-82828id98u884nfkwp937';

const corsConfiguration = {
  CORSRules: [
    {
      AllowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://videos.factsbuilt.com'
      ],
      AllowedMethods: [
        'GET',
        'PUT',
        'POST',
        'DELETE',
        'HEAD'
      ],
      AllowedHeaders: ['*'],
      ExposeHeaders: [
        'ETag',
        'x-amz-meta-custom-header'
      ],
      MaxAgeSeconds: 3000
    }
  ]
};

async function setupCORS() {
  try {
    console.log(`Setting up CORS for bucket: ${bucketName}`);
    
    const command = new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: corsConfiguration
    });

    await s3Client.send(command);
    console.log('✅ CORS configuration applied successfully!');

    // Verify the configuration
    const getCommand = new GetBucketCorsCommand({ Bucket: bucketName });
    const result = await s3Client.send(getCommand);
    console.log('📋 Current CORS configuration:');
    console.log(JSON.stringify(result.CORSRules, null, 2));

  } catch (error) {
    console.error('❌ Error setting up CORS:', error.message);
    
    if (error.name === 'InvalidAccessKeyId') {
      console.log('\n🔧 Please check your AWS credentials in the .env file');
    } else if (error.name === 'NoSuchBucket') {
      console.log('\n🔧 Please check your S3 bucket name in the .env file');
    } else if (error.name === 'AccessDenied') {
      console.log('\n🔧 Your AWS credentials need s3:PutBucketCors permission');
    }
  }
}

setupCORS();
