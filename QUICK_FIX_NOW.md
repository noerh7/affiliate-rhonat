# 🚀 QUICK ACTION GUIDE - Fix Your 500 Error NOW

## ✅ Step 1: DONE
The code fix has been pushed to GitHub. Vercel is now deploying.

## ⚡ Step 2: Set Environment Variables (DO THIS NOW)

### Go to Vercel Dashboard:
1. Open: https://vercel.com/dashboard
2. Find your project: **affiliate-rhonat** (or whatever your backend project is named)
3. Click on it
4. Click **Settings** (top menu)
5. Click **Environment Variables** (left sidebar)

### Add These Variables:

#### Variable 1: CLICKBANK_DEV_KEY
- Click "Add New"
- **Name**: `CLICKBANK_DEV_KEY`
- **Value**: `[Your ClickBank Developer Key]`
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variable 2: CLICKBANK_API_KEY
- Click "Add New"
- **Name**: `CLICKBANK_API_KEY`
- **Value**: `[Your ClickBank API Key]`
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variable 3: CLICKBANK_BASE_URL (Optional)
- Click "Add New"
- **Name**: `CLICKBANK_BASE_URL`
- **Value**: `https://api.clickbank.com`
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### Variable 4: FRONTEND_URL (Optional)
- Click "Add New"
- **Name**: `FRONTEND_URL`
- **Value**: `https://your-frontend-url.vercel.app` (or `*` for all origins)
- **Environments**: Check ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

## 🔄 Step 3: Redeploy (if needed)

After adding environment variables:
- Vercel might automatically redeploy
- If not, go to **Deployments** tab and click **Redeploy** on the latest deployment

## ✅ Step 4: Test

Once deployment is complete (1-2 minutes):

### Test the health endpoint:
```
https://your-backend-url.vercel.app/api/clickbank/health
```

### Expected Results:

**If environment variables are set correctly:**
```json
{
  "status": "ok",
  "message": "ClickBank API is reachable"
}
```

**If environment variables are missing:**
```json
{
  "status": "error",
  "message": "ClickBank credentials (CLICKBANK_DEV_KEY and CLICKBANK_API_KEY) are not configured..."
}
```

**If you still get 500 error:**
- Check Vercel logs: Dashboard → Your Project → Deployments → Latest → Functions
- Look for our debug logs starting with `[ClickBankService]` or `[Health API]`

## 📍 Where to Get Your ClickBank Keys

1. Go to https://accounts.clickbank.com/
2. Log in to your ClickBank account
3. Go to **Settings** → **API Settings**
4. You'll find:
   - **Developer API Key** (use for `CLICKBANK_DEV_KEY`)
   - **Clerk API Key** (use for `CLICKBANK_API_KEY`)

## ❓ Don't Have ClickBank Keys Yet?

For testing purposes, you can use dummy values:
- `CLICKBANK_DEV_KEY`: `test-dev-key`
- `CLICKBANK_API_KEY`: `test-api-key`

The function will start successfully, but API calls will fail (which is expected). You'll see proper error messages instead of crashes.

## 🎯 Summary

**What we fixed:**
- ❌ `vercel.json` was referencing non-existent secrets → Function crashed
- ✅ Removed invalid config → Function can now start
- ✅ Added debug logging → Can see what's happening
- ⏳ **YOU NEED TO**: Set environment variables in Vercel Dashboard

**Time to fix:** 2-3 minutes to add environment variables

**Next error you might see:** "ClickBank credentials not configured" - This is GOOD! It means the function is running, just needs the real API keys.
