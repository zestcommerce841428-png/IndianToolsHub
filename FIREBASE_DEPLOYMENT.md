# Firebase Rules Deployment Guide

## Quick Deploy (Recommended)

### Option 1: Deploy via Firebase Console (Easiest - 2 minutes)

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project
3. Click "Firestore Database" → "Rules" tab
4. Copy the content from `firestore.rules` file
5. Paste into the editor
6. Click "Publish"

---

### Option 2: Deploy via Firebase CLI

#### Step 1: Login to Firebase
```bash
cd C:\Users\anony\Downloads\NakulTools-main
firebase login
```
A browser window will open for authentication.

#### Step 2: Initialize Firebase (if not already done)
```bash
firebase init firestore
```
- Select your Firebase project
- Accept default for Firestore rules file (firestore.rules)
- Skip Firestore indexes

#### Step 3: Deploy the Rules
```bash
firebase deploy --only firestore:rules
```

---

## Current Status

✅ Firestore rules file created: `firestore.rules`
✅ Firebase configuration created: `firebase.json`  
✅ Firebase CLI installed

⚠️ **Manual action required:** Deploy rules to Firebase using one of the options above

---

## What These Rules Do

- **User Documents** (`/users/{userId}`): Only authenticated users can access their own data
- **OTP Collection** (`/otps/{email}`): Allows server-side OTP operations for email verification
- **Security**: All other collections are denied by default

---

## After Deployment

Once rules are deployed, your OTP email system will work correctly!
