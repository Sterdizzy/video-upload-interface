# Deployment Guide - Video Upload Interface

## Option 1: Vercel (Recommended)

### Why Vercel?
- Built by Next.js creators - perfect compatibility
- Automatic deployments from Git
- Built-in environment variable management
- Global CDN
- Free tier available

### Steps:
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `AWS_REGION=us-east-1`
   - `AWS_ACCESS_KEY_ID=your_key`
   - `AWS_SECRET_ACCESS_KEY=your_secret`
   - `S3_BUCKET_NAME=csc-media-82828id98u884nfkwp937`
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your_email`
   - `SMTP_PASS=your_password`
   - `EMAIL_FROM=your_email`
   - `EMAIL_TO=recipient_email`

4. **Update CORS** to include your Vercel domain:
   ```json
   "AllowedOrigins": [
     "http://localhost:3000",
     "https://your-app.vercel.app"
   ]
   ```

---

## Option 2: AWS Amplify

### Why AWS Amplify?
- Native AWS integration
- Automatic scaling
- Built-in CI/CD

### Steps:
1. Push code to GitHub/GitLab
2. Connect repository in AWS Amplify Console
3. Configure build settings
4. Set environment variables
5. Deploy

---

## Option 3: Traditional VPS/Cloud Server

### Platforms:
- DigitalOcean App Platform
- Railway
- Render
- Heroku (paid plans)

### Steps:
1. Connect Git repository
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Set environment variables
5. Deploy

---

## Option 4: Self-Hosted (Advanced)

### Requirements:
- VPS with Node.js
- Process manager (PM2)
- Reverse proxy (Nginx)
- SSL certificate

---

## Why NOT S3 Static Hosting?

S3 static hosting only serves static files and cannot:
- Run server-side API routes (needed for S3 uploads)
- Execute Node.js code (needed for email notifications)
- Handle environment variables securely

Your app needs server-side functionality, so it requires a platform that can run Node.js.

---

## Recommended: Start with Vercel

Vercel is the easiest and most reliable option for Next.js apps. It's free for personal projects and handles all the complexity for you.
