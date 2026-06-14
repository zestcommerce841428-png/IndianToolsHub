# Vercel Environment Variables Checklist

Please verify ALL these variables are configured in your Vercel project settings:

## 🔥 Firebase Configuration (Required - Client SDK)
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📧 SMTP Configuration (Required for emails)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Optional fallbacks (if using different names):**
```
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## 🔐 Firebase Admin SDK (Required - for password reset)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Alternative (JSON format):**
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

**Note:** Firebase Admin SDK is now required for the password reset flow. The system allows users to reset passwords directly via OTP verification without needing their current password or email links.

## 🌐 Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

## 🔒 reCAPTCHA (Optional - for contact form)
```
RECAPTCHA_SECRET_KEY=your_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
```

## 📤 File Upload (Optional - for Hostinger storage)
```
NEXT_PUBLIC_HOSTINGER_API_URL=your_hostinger_api_url
NEXT_PUBLIC_UPLOAD_SECRET=your_upload_secret
```

## 📊 Analytics & Monitoring (Optional)
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://your_sentry_dsn@sentry.io
```

---

## How to Add in Vercel:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with its value
5. Select which environments (Production, Preview, Development)
6. Click **Save**
7. **Important:** Redeploy after adding variables

## Password Reset Flow:

The password reset now uses a secure 4-step process:
1. User enters email address
2. User receives and verifies 6-digit OTP via email
3. User sets new password directly (NO current password required, NO email links)
4. Password is updated using Firebase Admin SDK

This eliminates the need for password reset links and allows users to reset passwords even when they've forgotten their current password.
