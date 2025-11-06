# Deploy to Vercel (Production CORS Solution)

## Why Vercel?

Your app currently has CORS issues on GitHub Pages because NewsAPI.org blocks browser requests. Vercel solves this with **serverless functions** that act as a secure proxy.

### Benefits:
- ✅ **Fixes CORS permanently** - No third-party proxy needed
- ✅ **Free hosting** - Same as GitHub Pages
- ✅ **Automatic HTTPS** - Secure by default
- ✅ **CI/CD built-in** - Auto-deploy on git push
- ✅ **Your own domain** - Professional URL
- ✅ **API key stays secure** - Never exposed to browser

---

## Quick Start (5 Minutes)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

This will open a browser to sign in (use GitHub account for easy integration).

### Step 3: Deploy

```bash
cd C:\Dev\Test123\news-search-app
vercel
```

**Answer the prompts:**
- Setup and deploy? → **Y**
- Which scope? → **Your username**
- Link to existing project? → **N**
- Project name? → **news-search-app** (or press Enter)
- In which directory is your code located? → **./** (press Enter)
- Want to override settings? → **N**

Vercel will:
1. Build your project
2. Deploy it
3. Give you a live URL like: `https://news-search-app-xyz.vercel.app`

### Step 4: Add Environment Variable

```bash
vercel env add VITE_NEWS_API_KEY
```

- Choose environment: **Production**
- Enter value: **e87d178585e24f839333b39436fa2e27**

### Step 5: Redeploy with Environment Variable

```bash
vercel --prod
```

Your app is now live with working CORS!

---

## Connect to GitHub for Auto-Deploy

### Option A: Via Vercel Dashboard (Easiest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click your project → Settings → Git
3. Connect your GitHub repository
4. Now every `git push` auto-deploys!

### Option B: Via CLI

```bash
vercel git connect
```

---

## Custom Domain (Optional)

### Free Vercel Subdomain
Your app is already live at: `https://your-project-name.vercel.app`

### Custom Domain ($10-15/year)
1. Buy domain from Namecheap, Google Domains, etc.
2. In Vercel dashboard:
   - Project → Settings → Domains
   - Add domain (e.g., `news.yourdomain.com`)
   - Follow DNS instructions
3. Vercel automatically provisions SSL

---

## How the Serverless Proxy Works

### Old (Broken) Flow:
```
Browser → NewsAPI.org
          ❌ CORS Error
```

### New (Working) Flow:
```
Browser → Vercel Function → NewsAPI.org
                          ✅ No CORS (server-side)
          ← Return Data ←
```

### The Code:

**Frontend (`src/services/newsApi.js`):**
```javascript
// Calls YOUR serverless function instead of NewsAPI.org directly
const response = await fetch('/api/news?endpoint=everything&q=technology');
```

**Backend (`api/news.js`):**
```javascript
// Your serverless function makes the request (no CORS issues)
const response = await fetch('https://newsapi.org/v2/everything?q=technology', {
  headers: { 'X-Api-Key': process.env.VITE_NEWS_API_KEY }
});
```

---

## Development vs Production

### Local Development
```bash
npm run dev
```
- Uses CORS proxy (may fail sometimes)
- Runs on `http://localhost:5173`

### Production (Vercel)
```bash
vercel --prod
```
- Uses serverless function (always works)
- Runs on `https://your-app.vercel.app`

---

## Updating Your App

### Manual Deployment
```bash
# Make changes
code src/App.jsx

# Deploy
vercel --prod
```

### Automatic Deployment (After GitHub Connection)
```bash
# Make changes
git add .
git commit -m "Updated feature"
git push origin main

# Vercel auto-deploys in ~30 seconds!
```

---

## Comparison: GitHub Pages vs Vercel

| Feature | GitHub Pages | Vercel |
|---------|--------------|--------|
| **CORS Issue** | ❌ Broken | ✅ Fixed |
| **Hosting Cost** | Free | Free |
| **Custom Domain** | ✅ Supported | ✅ Supported |
| **HTTPS** | ✅ Auto | ✅ Auto |
| **Backend/API** | ❌ No | ✅ Serverless Functions |
| **CI/CD** | ✅ GitHub Actions | ✅ Built-in |
| **Build Time** | ~2 min | ~30 sec |
| **Setup Time** | 10 min | 5 min |

**Verdict:** Vercel is better for this project due to CORS requirements.

---

## Keep Both (Recommended)

You can keep GitHub Pages AND add Vercel:

- **GitHub Pages**: Backup/portfolio showcase
- **Vercel**: Production version users actually use

Both auto-deploy from the same GitHub repo!

---

## Troubleshooting

### Error: "VITE_NEWS_API_KEY is undefined"

**Fix:**
```bash
vercel env add VITE_NEWS_API_KEY
# Enter your API key when prompted
vercel --prod
```

### Error: "Failed to fetch from /api/news"

**Check:**
1. Serverless function exists: `api/news.js`
2. File is in the correct location (not `src/api/`)
3. Vercel deployed successfully: check dashboard

**Test function directly:**
```bash
curl https://your-app.vercel.app/api/news?endpoint=top-headlines&country=us&pageSize=10
```

### Error: "Module not found"

**Fix:**
```bash
# Reinstall dependencies
npm install
vercel --prod
```

---

## Monitoring & Analytics

### View Logs
```bash
vercel logs
```

### View Deployments
```bash
vercel ls
```

### Dashboard
- Go to [vercel.com/dashboard](https://vercel.com/dashboard)
- View:
  - Real-time function invocations
  - Error logs
  - Performance metrics
  - Bandwidth usage

---

## Cost Breakdown

### Vercel Free Tier (Hobby):
- ✅ 100 GB bandwidth/month
- ✅ 100 serverless function invocations/day
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ DDoS mitigation

**Perfect for personal projects!**

If you exceed limits (unlikely):
- Pro plan: $20/month
- Or switch to self-hosted

---

## Security Best Practices

### 1. Environment Variables
✅ API key is never exposed to browser
✅ Stored securely in Vercel's environment

### 2. Function Security
The serverless function validates:
- Only GET requests
- Only allowed endpoints (top-headlines, everything)
- Rate limiting (built-in by Vercel)

### 3. HTTPS
All traffic is encrypted automatically.

---

## Alternative: Stay on GitHub Pages with Different Solution

If you prefer to stay on GitHub Pages, here are alternatives:

### Option 1: Different CORS Proxy
Try these in `src/services/newsApi.js`:

```javascript
// Option 1: CORS Anywhere (more reliable)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Option 2: Proxy CORS
const CORS_PROXY = 'https://corsproxy.io/?';
```

**Cons:** Still depends on third-party service.

### Option 2: Different News API
Switch to an API that supports CORS:
- [MediaStack](https://mediastack.com/) - 500 free requests/month
- [GNews](https://gnews.io/) - 100 free requests/day
- [Currents API](https://currentsapi.services/) - 600 free requests/day

---

## Next Steps

**Immediate:**
1. Deploy to Vercel: `vercel`
2. Test the app works
3. Connect GitHub for auto-deploy

**Optional:**
1. Add custom domain
2. Set up monitoring
3. Add analytics

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions Guide](https://vercel.com/docs/functions)
- [Environment Variables](https://vercel.com/docs/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

**Ready to deploy?** Run:
```bash
vercel
```

**Need help?** Check the troubleshooting section above.
