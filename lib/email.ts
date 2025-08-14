
// Edge-compatible email using Resend API (https://resend.com)
// Requires RESEND_API_KEY and EMAIL_TO in environment variables.

export async function sendVideoUploadNotification(
  fileName: string,
  fileSize: number,
  viewableUrl: string,
  senderName?: string,
  senderEmail?: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.EMAIL_TO || '';
  const from = process.env.EMAIL_FROM || 'uploads@no-reply.example';

  if (!apiKey || !to) {
    console.warn('Email disabled: missing RESEND_API_KEY or EMAIL_TO');
    return { id: 'skip', message: 'Email disabled (missing config)' };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Video Upload Successful</h2>
      <p>Your video has been successfully uploaded to S3.</p>
      ${senderName || senderEmail ? `<p><strong>Sender:</strong> ${
        [senderName, senderEmail].filter(Boolean).join(' <') + (senderEmail ? '>' : '')
      }</p>` : ''}
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
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Video Upload Complete: ${fileName}`,
      html,
      reply_to: senderEmail || undefined,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Resend email error:', res.status, text);
    throw new Error(`Email failed: ${res.status}`);
  }

  const data = await res.json().catch(() => ({}));
  return data;
}
