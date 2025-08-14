# Cloudflare Pages Deployment Guide

## Why Cloudflare Pages?
- ✅ Supports Next.js with server-side functionality
- ✅ Global CDN with excellent performance
- ✅ Built-in DDoS protection
- ✅ Free tier with generous limits
- ✅ Automatic deployments from Git
- ✅ Environment variable management

## Deployment Steps

### 1. Prepare Your Repository
First, make sure your code is in a Git repository (GitHub, GitLab, or Bitbucket):

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit - Video Upload Interface"

# Push to GitHub/GitLab (create repo first)
git remote add origin https://github.com/yourusername/video-upload-interface.git
git push -u origin main
```

### 2. Deploy to Cloudflare Pages

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. **Navigate to Pages**: Click "Pages" in the left sidebar
3. **Create a new project**: Click "Create a project"
4. **Connect Git repository**: 
   - Choose your Git provider (GitHub/GitLab)
   - Select your video upload repository
5. **Configure build settings**:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/app` (if your Next.js app is in the app folder)

### 3. Set Environment Variables

In your Cloudflare Pages project settings, add these environment variables:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET_NAME=csc-media-82828id98u884nfkwp937
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_TO=recipient@example.com
```

### 4. Update CORS Configuration

Update your S3 bucket CORS to include your Cloudflare Pages domain:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://your-project-name.pages.dev",
        "https://your-custom-domain.com"
      ],
      "AllowedMethods": [
        "GET",
        "PUT",
        "POST",
        "DELETE",
        "HEAD"
      ],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": [
        "ETag",
        "x-amz-meta-custom-header"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 5. Custom Domain (Optional)

If you want to use your own domain:

1. **Add custom domain** in Pages settings
2. **Update DNS** to point to Cloudflare
3. **Update CORS** to include your custom domain

## Alternative: Cloudflare Workers (Advanced)

If you prefer more control, you can deploy as Cloudflare Workers:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy .next --project-name=video-upload-interface
```

## Expected Results

After deployment, your app will be available at:
- `https://your-project-name.pages.dev`
- Or your custom domain if configured

## Troubleshooting

### Build Issues
- Ensure `package.json` has correct build scripts
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`

### Environment Variables
- Double-check all environment variables are set
- Ensure no trailing spaces in values
- Test AWS credentials have proper S3 permissions

### CORS Issues
- Update S3 CORS with your new domain
- Allow time for DNS propagation (up to 24 hours)

## Performance Benefits

Cloudflare Pages provides:
- **Global CDN**: Fast loading worldwide
- **Edge caching**: Static assets cached globally
- **DDoS protection**: Built-in security
- **Analytics**: Traffic and performance insights

Your video upload interface will be blazing fast and highly available! 🚀
