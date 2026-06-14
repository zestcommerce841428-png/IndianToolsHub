# 🔐 Firebase Admin SDK Setup Guide

## Complete Guide to Enable Magic Link Auto-Login

This guide will help you get Firebase Admin credentials and configure them in Vercel.

---

## 📋 Prerequisites

- Firebase project already created (you have this)
- Access to Firebase Console
- Access to Vercel dashboard

---

## 🔑 Step 1: Get Firebase Admin Credentials

### Method 1: Download Service Account Key (Easiest)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: **IndianToolsHub** (or your project name)

2. **Navigate to Project Settings**
   - Click the **gear icon** (⚙️) next to "Project Overview"
   - Click **"Project settings"**

3. **Go to Service Accounts Tab**
   - Click the **"Service accounts"** tab
   - You'll see "Firebase Admin SDK" section

4. **Generate New Private Key**
   - Click **"Generate new private key"** button
   - A dialog will appear warning you to keep it secure
   - Click **"Generate key"**
   - A JSON file will download to your computer

5. **Open the Downloaded JSON File**
   - File name will be like: `your-project-123456-firebase-adminsdk-xxxxx.json`
   - Open it in a text editor (VS Code, Notepad, etc.)

6. **Extract the Values You Need**
   
   The JSON file looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "abc123...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
     "client_id": "123456789",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
   }
   ```

   **You need these 3 values:**
   - `project_id` → Use for `FIREBASE_PROJECT_ID`
   - `private_key` → Use for `FIREBASE_PRIVATE_KEY`
   - `client_email` → Use for `FIREBASE_CLIENT_EMAIL`

---

## 🚀 Step 2: Add to Vercel Environment Variables

### Option A: Using Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project: **indian-tools-hub** or **IndianToolsHub**

2. **Navigate to Settings → Environment Variables**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in sidebar

3. **Add Three New Variables**

   **Variable 1: FIREBASE_PROJECT_ID**
   ```
   Name: FIREBASE_PROJECT_ID
   Value: your-project-id (from JSON file)
   Environment: Production, Preview, Development (select all)
   ```
   Click **"Save"**

   **Variable 2: FIREBASE_CLIENT_EMAIL**
   ```
   Name: FIREBASE_CLIENT_EMAIL
   Value: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com (from JSON)
   Environment: Production, Preview, Development (select all)
   ```
   Click **"Save"**

   **Variable 3: FIREBASE_PRIVATE_KEY**
   ```
   Name: FIREBASE_PRIVATE_KEY
   Value: -----BEGIN PRIVATE KEY-----\nMIIEvgIBAD...\n-----END PRIVATE KEY-----\n
   Environment: Production, Preview, Development (select all)
   ```
   
   **IMPORTANT for FIREBASE_PRIVATE_KEY:**
   - Copy the ENTIRE private_key value from JSON (including quotes)
   - Keep the `\n` characters (they represent line breaks)
   - Don't add extra quotes or modify the format
   - Paste exactly as it appears in the JSON file

   Click **"Save"**

4. **Redeploy Your Application**
   - After adding all 3 variables, go to **"Deployments"** tab
   - Click the **"..."** menu on latest deployment
   - Click **"Redeploy"**
   - This will rebuild with the new environment variables

### Option B: Using Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add FIREBASE_PROJECT_ID
# Paste: your-project-id

vercel env add FIREBASE_CLIENT_EMAIL
# Paste: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

vercel env add FIREBASE_PRIVATE_KEY
# Paste: "-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"

# Redeploy
vercel --prod
```

---

## 🧪 Step 3: Test the Setup

### Test Endpoint

Visit this URL to test Firebase Admin connection:
```
https://indian-tools-hub.vercel.app/api/test-firebase-admin
```

(Create this test endpoint if needed)

### Test Magic Link

1. Go to: https://indian-tools-hub.vercel.app/auth/magic-link
2. Enter your email
3. Check your **spam folder** for the magic link email
4. Click the link
5. You should be automatically logged in and redirected to homepage

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep the service account JSON file secure (don't commit to Git)
- Add to `.gitignore`: `*-firebase-adminsdk-*.json`
- Only share credentials through secure channels
- Regenerate keys if exposed
- Use environment variables (never hardcode)

### ❌ DON'T:
- Don't commit service account keys to Git
- Don't share keys publicly
- Don't modify the private key format
- Don't add extra spaces or line breaks

---

## 🐛 Troubleshooting

### Error: "Firebase Admin not initialized"
**Solution**: Check that all 3 environment variables are set in Vercel

### Error: "Invalid private key"
**Solution**: 
- Make sure you copied the entire private_key value
- Keep the `\n` characters (don't replace with actual newlines)
- Include the BEGIN and END markers
- Check for extra spaces or quotes

### Error: "Service account doesn't have required permissions"
**Solution**:
- Go to Firebase Console → Project Settings → Service Accounts
- Make sure "Firebase Admin SDK" has correct permissions
- Generate a new key if needed

### Magic Link Still Not Working
**Solution**:
1. Clear browser cache (Ctrl+F5)
2. Check Vercel deployment logs for errors
3. Verify environment variables are set for "Production" environment
4. Try the test endpoint: `/api/test-firebase-admin`
5. Check that email is not in spam folder

---

## 📝 Alternative: Use Entire JSON as Single Variable

If you prefer, you can store the entire service account JSON as one variable:

```
Name: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account","project_id":"your-project",...}
Environment: Production, Preview, Development
```

Then update the code in `/api/auth/magic-link/route.ts`:
```typescript
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
```

---

## ✅ Verification Checklist

- [ ] Downloaded Firebase service account JSON file
- [ ] Extracted project_id, client_email, private_key
- [ ] Added FIREBASE_PROJECT_ID to Vercel
- [ ] Added FIREBASE_CLIENT_EMAIL to Vercel
- [ ] Added FIREBASE_PRIVATE_KEY to Vercel (with \n preserved)
- [ ] Redeployed application in Vercel
- [ ] Tested magic link functionality
- [ ] Magic link auto-logs user in (not just redirecting to login)

---

## 🎉 Success!

Once configured, users will:
1. Request magic link
2. Receive email (check spam folder)
3. Click link
4. Be automatically logged in with Firebase
5. Redirected to homepage

No manual login required!

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Visit `/api/deployment-status` to verify deployment
3. Visit `/api/test-firebase-admin` to test Firebase connection
4. Verify environment variables in Vercel dashboard
5. Make sure you're checking spam folder for emails
