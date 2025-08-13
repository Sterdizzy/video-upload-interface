
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendVideoUploadNotification(
  fileName: string,
  fileSize: number,
  viewableUrl: string
) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'your-email@gmail.com',
      to: process.env.EMAIL_TO || 'video-editor@example.com',
      subject: `Video Upload Complete: ${fileName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Video Upload Successful</h2>
          <p>Your video has been successfully uploaded to the S3 storage.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">File Details:</h3>
            <p><strong>File Name:</strong> ${fileName}</p>
            <p><strong>File Size:</strong> ${(fileSize / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Upload Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewableUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              View Video
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Note: The viewable link will expire in 1 hour for security purposes.
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
