# 🚀 Production Deployment Guide

## Prerequisites

Before deploying Spendly to production, ensure you have:

- [x] Supabase project set up
- [x] All environment variables configured
- [x] Production build tested locally
- [x] Database initialized
- [x] API keys ready (GROK_API_KEY optional)

## Environment Variables

### Required Variables (Already configured)
```bash
SUPABASE_URL=your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...
```

### Optional Variables (For advanced features)
```bash
# AI Integration
GROK_API_KEY=your-grok-api-key
# or
OPENAI_API_KEY=your-openai-api-key

# OCR Service (future)
GOOGLE_CLOUD_VISION_KEY=your-gcv-key
AWS_TEXTRACT_KEY=your-aws-key
```

## Deployment Steps

### 1. Build for Production

```bash
# Install dependencies
pnpm install

# Build the app
pnpm build

# Preview production build locally
pnpm preview
```

### 2. Deploy Frontend (Vercel - Recommended)

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure:
   - Framework Preset: **Vite**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### 3. Deploy Backend (Supabase Edge Functions)

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy Edge Functions
supabase functions deploy server

# Set environment variables
supabase secrets set SUPABASE_URL=your-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-key
supabase secrets set SUPABASE_ANON_KEY=your-anon-key

# Optional: AI API Key
supabase secrets set GROK_API_KEY=your-grok-key
```

### 4. Configure PWA

1. **Generate Icons**
```bash
# Install PWA Asset Generator
npm i -g pwa-asset-generator

# Generate icons
pwa-asset-generator logo.png ./public/icons \
  --background "#3B82F6" \
  --scrape false
```

2. **Update manifest.json**
- Ensure `/public/manifest.json` has correct URLs
- Update `start_url` to production URL

3. **Register Service Worker**
- Service worker is already in `/public/sw.js`
- It will auto-register in production

### 5. Database Setup

The database is already initialized via the KV store. No additional SQL migrations needed.

### 6. Domain Configuration

#### For Vercel:
1. Go to Project Settings > Domains
2. Add your custom domain (e.g., spendly.app)
3. Configure DNS:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

#### For Supabase Functions:
- Functions are available at:
  `https://your-project.supabase.co/functions/v1/make-server-f5f5b39c/`

### 7. SSL/HTTPS

- **Vercel**: Automatic SSL with Let's Encrypt
- **Supabase**: Automatic SSL included

### 8. Performance Optimization

#### Enable Compression
Vercel handles this automatically.

#### CDN Configuration
Vercel Edge Network is enabled by default.

#### Caching Headers
Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 9. Monitoring & Analytics

#### Setup Vercel Analytics
```bash
pnpm add @vercel/analytics
```

Add to `App.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

#### Setup Error Tracking (Sentry)
```bash
pnpm add @sentry/react
```

Configure in `App.tsx`:
```tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### 10. Security Checklist

- [x] HTTPS enabled
- [x] CORS configured correctly
- [x] API keys in environment variables (not in code)
- [x] Service Role Key never exposed to frontend
- [x] Row Level Security (RLS) policies in Supabase
- [ ] Rate limiting on API endpoints
- [ ] Content Security Policy (CSP) headers

### 11. Testing in Production

#### Smoke Tests
```bash
# Test authentication
curl -X POST https://your-app.com/functions/v1/make-server-f5f5b39c/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test dashboard
curl https://your-app.com/functions/v1/make-server-f5f5b39c/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### PWA Tests
1. Open Chrome DevTools > Application > Manifest
2. Verify manifest loads correctly
3. Test "Install App" prompt
4. Test offline functionality

#### Performance Tests
1. Run Lighthouse audit
2. Check Core Web Vitals
3. Test on slow 3G

## Post-Deployment

### 1. Monitor Logs

#### Vercel Logs
```bash
vercel logs production
```

#### Supabase Logs
```bash
supabase functions logs server
```

### 2. Setup Backups

Supabase provides automatic daily backups. For additional safety:
```bash
# Backup KV data
supabase db dump -f backup.sql
```

### 3. Update Documentation

- Update README with production URL
- Add API documentation
- Create user onboarding guide

### 4. Marketing & Launch

- [ ] Create landing page
- [ ] Setup Google Analytics
- [ ] Social media announcement
- [ ] Product Hunt launch
- [ ] App Store submission (future)

## Rollback Plan

If deployment fails:

```bash
# Vercel: Rollback to previous deployment
vercel rollback

# Supabase: Redeploy previous function
supabase functions deploy server --legacy-bundle
```

## Scaling Considerations

### When to Scale
- 1,000+ users: Upgrade Supabase plan
- 10,000+ users: Consider Redis for caching
- 100,000+ users: Implement read replicas

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_transaction_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_budget_user_month ON budgets(user_id, month);
```

### CDN for Static Assets
- Already handled by Vercel Edge Network
- Consider Cloudflare for additional layer

## Support & Maintenance

### Weekly Tasks
- Review error logs
- Check performance metrics
- Update dependencies

### Monthly Tasks
- Review user feedback
- Plan new features
- Security audit

## Cost Estimation

### Vercel (Hobby Plan - Free)
- Unlimited deployments
- 100 GB bandwidth
- Automatic SSL

### Supabase (Free Tier)
- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- Upgrade to Pro ($25/month) for:
  - 8 GB database
  - 100 GB storage
  - 250 GB bandwidth

### Total: $0-25/month for MVP

## Success Metrics

Track these KPIs post-launch:
- Daily Active Users (DAU)
- Retention Rate (D1, D7, D30)
- Transaction Creation Rate
- Budget Adherence %
- Goal Completion Rate
- App Install Rate (PWA)

## Troubleshooting

### Common Issues

**Issue: Function timeout**
```bash
# Increase timeout in Supabase dashboard
# Functions > Settings > Timeout > 30s
```

**Issue: CORS errors**
```bash
# Check CORS config in server/index.tsx
# Ensure origin includes your domain
```

**Issue: PWA not installable**
```bash
# Verify manifest.json is served correctly
# Check service worker registration
# Ensure HTTPS is enabled
```

## Next Steps After Deployment

1. **Monitor for 24 hours** - Watch for errors
2. **Gather feedback** - First 10 users
3. **Iterate quickly** - Fix critical bugs
4. **Plan v1.1** - New features based on feedback

---

**Congratulations! 🎉**

Your Spendly app is now live in production!

Need help? Contact: support@spendly.com
