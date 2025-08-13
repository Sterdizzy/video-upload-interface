
# Video Upload Interface

A professional NextJS web application for uploading video files (MP4 and AVI) to AWS S3 with automatic email notifications.

## Features

- 🎥 **Video Upload**: Drag-and-drop interface supporting MP4 and AVI files
- 📦 **S3 Storage**: Multipart upload to AWS S3 bucket for files of any size
- 📧 **Email Notifications**: Automatic email alerts when videos are uploaded
- 🔗 **Presigned URLs**: Generate secure, viewable links for uploaded videos
- 📊 **Progress Tracking**: Real-time upload progress visualization
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🛡️ **Error Handling**: Comprehensive error management and user feedback

## Setup Instructions

### 1. Environment Variables

Update the `.env` file with your actual AWS and email credentials:

```bash
# AWS Configuration (REQUIRED)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key
S3_BUCKET_NAME=csc-media-82828id98u884nfkwp937

# Email Configuration (REQUIRED)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=video-editor@example.com
```

### 2. AWS Setup

1. **Create IAM User** with the following permissions:
   - `s3:PutObject`
   - `s3:PutObjectAcl`
   - `s3:GetObject`
   - `s3:DeleteObject`

2. **S3 Bucket Configuration**:
   - Bucket name: `csc-media-82828id98u884nfkwp937`
   - Enable CORS for web uploads
   - Configure bucket policy for secure access

### 3. Email Setup

For Gmail SMTP:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in `SMTP_PASS`

### 4. Run the Application

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit `http://localhost:3000` to use the application.

## Usage

1. **Upload Video**: Drag and drop an MP4 or AVI file onto the upload area
2. **Monitor Progress**: Watch the real-time upload progress bar
3. **Get Viewable Link**: Receive a secure presigned URL to view the video
4. **Email Notification**: Automatic email sent with upload details and viewable link
5. **View Video**: Click the "View Video" button to open the video in a new tab

## Technical Details

- **Framework**: Next.js 14 with App Router
- **AWS Integration**: AWS SDK v3 with multipart upload support
- **Email Service**: Nodemailer with SMTP
- **UI Components**: Shadcn/ui with Tailwind CSS
- **File Validation**: Client and server-side validation for MP4/AVI files
- **Security**: Presigned URLs with 1-hour expiration

## File Structure

```
app/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # Main upload API
│   │   └── presigned-url/route.ts   # URL generation API
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── video-upload.tsx             # Main upload component
│   └── ui/                          # UI components
├── lib/
│   ├── aws.ts                       # AWS S3 integration
│   ├── email.ts                     # Email notification service
│   └── upload-utils.ts              # Validation utilities
└── .env                             # Environment variables
```

## Troubleshooting

- **Upload fails**: Check AWS credentials and S3 bucket permissions
- **Email not sent**: Verify SMTP configuration and credentials
- **CORS errors**: Ensure S3 bucket has proper CORS configuration
- **Large files**: The app supports multipart upload for files of any size

## Security Notes

- Presigned URLs expire after 1 hour for security
- Only MP4 and AVI files are accepted
- AWS credentials should never be exposed to the client
- Use environment variables for all sensitive configuration
