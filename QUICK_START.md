# 🚀 Quick Start Guide - Voice Unheard App

## ⚡ 3 Steps to Get Running

### Step 1: Deploy Security Rules (Required!)
```bash
firebase login
firebase use project-managem
firebase deploy --only firestore
```

### Step 2: Enable Authentication
1. Go to https://console.firebase.google.com/project/project-managem/authentication/providers
2. Click "Anonymous" → Toggle ON → Save
3. (Optional) Click "Email/Password" → Toggle ON → Save

### Step 3: Start the App
```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

---

## ✅ What's Working

| Feature | Status | Location |
|---------|--------|----------|
| Anonymous Login | ✅ | `app/(auth)/login.tsx` |
| Email/Password Login | ✅ | `app/(auth)/login.tsx` |
| Submit Reports | ✅ | `app/(tabs)/report.tsx` |
| View Feed | ✅ | `app/(tabs)/home.tsx` |
| Resources | ✅ | `app/(tabs)/resources.tsx` |
| My Reports | ✅ | `app/(tabs)/profile.tsx` |
| Sign Out | ✅ | `app/(tabs)/profile.tsx` |

---

## 🧪 Quick Test

1. **Launch App** → Click "Continue Anonymously"
2. **Go to Report Tab** → Submit a test report
3. **Go to Profile Tab** → See your report in "pending" status
4. **Manually verify it** in Firebase Console
5. **Go to Home Tab** → Pull down to refresh → See verified report!

---

## 🔧 Quick Fixes

### "No reports in feed"
→ Reports must be verified first. Go to Firebase Console → Firestore → Edit report:
- `status`: "verified"
- `visibility`: "public"

### "Permission denied"
→ Deploy security rules:
```bash
firebase deploy --only firestore
```

### "Auth not working"
→ Enable Anonymous auth in Firebase Console

---

## 📚 Full Documentation

- **Integration Details**: `INTEGRATION_SUMMARY.md`
- **API Examples**: `src/services/FIREBASE_USAGE_EXAMPLES.md`
- **Backend Setup**: `firebase/README.md`
- **Schema**: `firebase/schema.json`

---

**Ready to go! 🎉** Deploy security rules and start testing!
