# Deployment Guide - Share Your App for Testing

## Recommended: Deploy to Vercel (Free)

Vercel is the easiest way to deploy Next.js apps. Created by the Next.js team, it offers:
- ✅ Free tier (perfect for testing)
- ✅ Automatic deployments on git push
- ✅ HTTPS/SSL included
- ✅ Global CDN
- ✅ Works seamlessly with Supabase

---

## Step-by-Step: Deploy to Vercel

### 1. Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### 2. Import Your Project

1. Click "Add New..." → "Project"
2. Find "candescent" repository
3. Click "Import"

### 3. Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (leave as is)

**Build Command**: `npm run build` (default)

**Environment Variables**: Click "Add" and enter:

```
NEXT_PUBLIC_SUPABASE_URL=https://wsgftpcfjbuchsptuqdf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZ2Z0cGNmamJ1Y2hzcHR1cWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTQ0OTMsImV4cCI6MjA3NTM5MDQ5M30.gsjqmRzJoiHn8CSkvYNyvXJ6tkrjW6DiUCtqGP0cMkY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZ2Z0cGNmamJ1Y2hzcHR1cWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgxNDQ5MywiZXhwIjoyMDc1MzkwNDkzfQ.-G9qpfw33TQJD7IEs8TXWsdPB4M0Tu55aYYyF5rVqIs
```

*Copy these from your `.env.local` file*

### 4. Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Vercel will give you a URL: `https://candescent-xyz.vercel.app`

### 5. Share with Users

Send them the Vercel URL! They can:
- ✅ Access immediately (no installation)
- ✅ Use on any device (desktop, mobile, tablet)
- ✅ Always see the latest version

---

## Automatic Deployments

**Every time you push to GitHub:**
1. Vercel detects the push
2. Automatically builds your app
3. Deploys the new version
4. Users see updates immediately

**Preview Deployments:**
- Every git branch gets its own URL
- Test features before merging to main
- Share preview links for feedback

---

## Alternative Options

### Option 2: Netlify

Similar to Vercel, also free tier:
1. Go to https://netlify.com
2. "Add new site" → "Import from Git"
3. Select your repository
4. Add environment variables
5. Deploy

### Option 3: Railway

Good for full-stack apps:
1. https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Select repository
4. Add environment variables
5. Deploy

### Option 4: Render

Free tier available:
1. https://render.com
2. "New" → "Web Service"
3. Connect GitHub
4. Configure and deploy

---

## Supabase Configuration

### Update Allowed URLs

In Supabase Dashboard:
1. Go to Authentication → URL Configuration
2. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

This enables authentication to work on the deployed site.

---

## Custom Domain (Optional)

### Add Your Own Domain

In Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `candescent.yourdomain.com`)
3. Update DNS records as instructed
4. SSL automatically configured

Then update Supabase allowed URLs to include your custom domain.

---

## Testing Checklist

After deployment, verify:

- [ ] Home page loads
- [ ] Can log in
- [ ] Dashboard shows data
- [ ] Charts render
- [ ] Account detail modal opens
- [ ] Win Room Dashboard accessible
- [ ] Can edit data (if admin/DSM)
- [ ] Import page works (admin only)
- [ ] Admin settings accessible (admin only)
- [ ] All API endpoints respond

---

## Environment Variables Reference

Your app needs these in Vercel:

| Variable | Where to Find | Purpose |
|----------|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings → API | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings → API | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API | Service role key (keep secret!) |

**Important**: Never commit these to GitHub! They're in `.env.local` which is gitignored.

---

## Monitoring & Logs

### Vercel Dashboard

- **Deployments**: See all builds and their status
- **Logs**: View build and runtime logs
- **Analytics**: Track page views and performance
- **Functions**: Monitor API route usage

### Supabase Dashboard

- **Database**: Query tables directly
- **Auth**: See user signups and sessions
- **Logs**: View database queries and errors
- **API**: Monitor API usage

---

## Costs

### Free Tiers

**Vercel Free Tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- 100 GB-hours serverless function execution
- Automatic HTTPS
- Perfect for testing and small teams

**Supabase Free Tier includes:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- Sufficient for testing

### When to Upgrade

Upgrade when you exceed:
- Bandwidth limits (lots of users/traffic)
- Database size (>500MB)
- Need custom domains on Vercel
- Need priority support

---

## Quick Start (TL;DR)

1. **Go to** https://vercel.com
2. **Sign in** with GitHub
3. **Import** candescent repository
4. **Add** environment variables from `.env.local`
5. **Deploy** (wait 2-3 minutes)
6. **Share** the URL with testers!

Your app will be live at: `https://candescent-[random].vercel.app`

---

## Troubleshooting

### Build Fails

**Check:**
- All environment variables added
- No TypeScript errors (`npm run build` locally)
- Dependencies installed correctly

### Authentication Doesn't Work

**Fix:**
- Add Vercel URL to Supabase allowed URLs
- Check environment variables are correct
- Verify callback URL matches

### Database Connection Issues

**Fix:**
- Verify Supabase URL and keys
- Check RLS policies allow authenticated users
- Ensure Supabase project is active (not paused)

---

## Next Steps After Deployment

1. **Test thoroughly** on the live URL
2. **Share link** with testers
3. **Collect feedback**
4. **Make updates** (push to GitHub)
5. **Vercel auto-deploys** new version
6. **Testers see updates** automatically

Your app is production-ready! 🚀
