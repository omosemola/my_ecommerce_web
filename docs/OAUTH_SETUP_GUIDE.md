# Google & Facebook OAuth Setup Guide

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name it something like "Tech2etc Ecommerce")
3. Go to **APIs & Services** → **OAuth consent screen**

### Step 2: Configure OAuth Consent Screen
1. Select **External** as User Type
2. Fill in:
   - App name: "Tech2etc Ecommerce"
   - User support email: Your email
   - Developer contact: Your email
3. Add scopes: Select `email`, `profile`, `openid`
4. Add test users (your email and any testers)
5. Click **Save and Continue**

### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Name it "Web Client"
5. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5500` (if using Live Server)
   - `http://127.0.0.1:3000`
   - Your production domain (when ready)
6. Add Authorized redirect URIs:
   - `http://localhost:3000/callback`
   - `http://localhost:5500/callback`
   - `http://127.0.0.1:3000/callback`
   - Your production URLs
7. Click **Create**
8. Copy your **Client ID**

### Step 4: Update Your Code
Replace `YOUR_GOOGLE_CLIENT_ID` in both `login.html` and `signup.html`:

```html
<!-- Change from: -->
client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'

<!-- To: -->
client_id: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com'
```

Example: `client_id: '123456789-abcdefghijklmnop.apps.googleusercontent.com'`

---

## Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as app type
4. Fill in app details and create

### Step 2: Configure Facebook Login
1. In your app, go to **Products** → **Add Product**
2. Search for **Facebook Login** and add it
3. Go to **Facebook Login** → **Settings**
4. Add Valid OAuth Redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:5500`
   - `http://127.0.0.1:3000`
   - Your production domain

### Step 3: Get Your App ID
1. Go to **Settings** → **Basic**
2. Copy your **App ID**

### Step 4: Update Your Code
Replace `YOUR_APP_ID` in both `login.html` and `signup.html`:

```html
<!-- Change from: -->
src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=YOUR_APP_ID"

<!-- To: -->
src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=123456789012345"
```

---

## Testing Locally

### Option 1: Using `localhost`
- Run your server on `http://localhost:3000`
- Make sure port 3000 is in your OAuth authorized origins

### Option 2: Using Live Server (VS Code)
- Use `http://127.0.0.1:5500` 
- Add this to your authorized origins
- Access via `http://127.0.0.1:5500`

### Option 3: Using ngrok (Expose Local Server)
1. Install [ngrok](https://ngrok.com)
2. Run: `ngrok http 3000`
3. Copy the `https://` URL ngrok provides
4. Add to your OAuth authorized origins
5. Add as redirect URI

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| **"Access blocked"** | Origin not authorized | Add localhost/domain to authorized origins |
| **"Redirect URI mismatch"** | URI not configured | Add exact redirect URI in console |
| **"Invalid Client"** | Wrong Client ID | Replace placeholder with actual ID |
| **"Popup blocked"** | Browser security | Ensure auth is triggered by user click |
| **CORS Error** | Cross-origin issue | Make sure origins are whitelisted |

---

## Quick Checklist

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured (External)
- [ ] Web client credentials created
- [ ] Localhost added to authorized origins
- [ ] Google Client ID copied and updated in code
- [ ] Facebook App created
- [ ] Facebook Login product added
- [ ] Localhost added to Facebook OAuth URIs
- [ ] Facebook App ID copied and updated in code
- [ ] Both pages tested on same server

---

## Backend Integration (Optional)

If you have a backend server, implement these endpoints:

```
POST /api/auth/google-signup
POST /api/auth/google-login
POST /api/auth/facebook-signup
POST /api/auth/facebook-login
```

The auth.js will automatically try backend first, then fallback to localStorage if not available.

---

## Support

If you still have issues:
1. Check browser console (F12) for exact error message
2. Verify Client ID and App ID are correct
3. Ensure no typos in configuration
4. Clear browser cookies and try again
5. Test in incognito/private mode
