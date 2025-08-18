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
    console.error('Email failed: RESEND_API_KEY is not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('EMAIL') || k.includes('RESEND')));
    return { error: 'Email server RESEND_API_KEY not configured.' };
  }
  if (!to) {
    console.error('Email failed: EMAIL_TO is not set. Available env vars:', Object.keys(process.env).filter(k => k.includes('EMAIL') || k.includes('RESEND')));
    return { error: 'Email recipient EMAIL_TO not configured.' };
  }

  console.log(`Email configured for To: ${to}, From: ${from}, API Key starts with: ${apiKey.substring(0, 10)}...`);

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
           style="background-color: #dc3545; color: #ffffff !important; padding: 15px 30px; 
                  text-decoration: none; border-radius: 8px; display: inline-block;
                  font-weight: bold; font-size: 18px; border: 3px solid #ffffff;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.2); text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
          🎥 VIEW VIDEO
        </a>
      </div>
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
