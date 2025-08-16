// Edge-compatible email using Resend API (https://resend.com)
// Requires RESEND_API_KEY and EMAIL_TO in environment variables.

export async function sendVideoUploadNotification(
  fileName: string,
  fileSize: number,
  viewableUrl: string,
  senderName?: string,
  senderEmail?: string
) {
  console.log('Attempting to send video upload notification...');

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.EMAIL_TO;
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Resend requires a verified domain or this default for testing

  if (!apiKey) {
    console.error('Email failed: RESEND_API_KEY is not set.');
    return { error: 'Email server RESEND_API_KEY not configured.' };
  }
  if (!to) {
    console.error('Email failed: EMAIL_TO is not set.');
    return { error: 'Email recipient EMAIL_TO not configured.' };
  }

  console.log(`Email configured for To: ${to}, From: ${from}`);

  const subject = `Video Upload Successful: ${fileName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Video Upload Successful</h2>
      <p>A video has been successfully uploaded.</p>
      ${senderName || senderEmail ? `<p><strong>Sender:</strong> ${[senderName, senderEmail].filter(Boolean).join(' &lt;')}</strong></p>` : ''}
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
    </div>`;

  try {
    console.log('Sending email via Resend API...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API returned an error:', data);
      return { error: 'Failed to send email.', details: data };
    }

    console.log('Email sent successfully via Resend:', data);
    return data;
  } catch (error) {
    console.error('An unexpected error occurred while sending email:', error);
    return { error: 'An unexpected error occurred.', details: error };
  }
}
