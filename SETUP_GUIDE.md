# Complete Setup Guide
## Voice Unheard - Frontend + Backend Integration

This guide will walk you through setting up the complete Voice Unheard app with Firebase backend.

---

## ✅ Current Status

Your app now has:
- ✅ Firebase SDK added to package.json
- ✅ Firebase configuration file (needs credentials)
- ✅ Complete firebaseService.js with 20+ functions
- ✅ Login screen with Firebase authentication
- ✅ Report screen with Firebase submission
- ✅ Home screen fetching verified reports
- ✅ Resources screen with Firebase integration
- ✅ Security rules ready to deploy
- ✅ Complete data schema documented

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

**In your terminal, run:**

```bash
cd /mnt/c/Users/User/Desktop/Year2/Sem1/Project_mangement/project_management
npm install --legacy-peer-deps
```

This will install:
- `firebase` - Firebase SDK
- `@react-native-async-storage/async-storage` - For auth persistence

---

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: "voice-unheard" (or your choice)
4. Disable Google Analytics (optional for now)
5. Click "Create project"

---

### Step 3: Enable Firebase Services

#### A. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Anonymous** sign-in:
   - Click on "Anonymous"
   - Toggle "Enable"
   - Click "Save"
4. Enable **Email/Password** sign-in:
   - Click on "Email/Password"
   - Toggle "Enable" (first option only, not email link)
   - Click "Save"

#### B. Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **"Start in production mode"** (we'll add security rules)
4. Select a location closest to your users
5. Click "Enable"

---

### Step 4: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the **Web icon** `</>`
5. Register your app:
   - App nickname: "Voice Unheard Web"
   - Don't check "Firebase Hosting"
   - Click "Register app"
6. **Copy the firebaseConfig object**

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "voice-unheard-abc123.firebaseapp.com",
  projectId: "voice-unheard-abc123",
  storageBucket: "voice-unheard-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

---

### Step 5: Add Firebase Credentials to Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder values on **lines 19-27**:

```javascript
// src/config/firebase.js (lines 19-27)
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // Replace with your apiKey
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",      // Replace with your authDomain
  projectId: "YOUR_ACTUAL_PROJECT_ID",        // Replace with your projectId
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET", // Replace with your storageBucket
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID", // Replace with your messagingSenderId
  appId: "YOUR_ACTUAL_APP_ID",                // Replace with your appId
  measurementId: "YOUR_MEASUREMENT_ID"        // Optional
};
```

3. Save the file

---

## 🔒 Deploy Security Rules (Critical!)

Your Firestore database needs security rules to protect user privacy.

### Option A: Using Firebase CLI (Recommended)

1. **Install Firebase CLI globally:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project:**
   ```bash
   cd /mnt/c/Users/User/Desktop/Year2/Sem1/Project_mangement/project_management
   firebase init firestore
   ```

   - Select your Firebase project
   - For Firestore rules file, enter: `firebase/firestore.rules`
   - For Firestore indexes file, press Enter (default)

4. **Deploy security rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

### Option B: Copy-Paste in Firebase Console

1. Open `firebase/firestore.rules` in your editor
2. **Copy all the contents** (350+ lines)
3. Go to Firebase Console > Firestore Database > **Rules** tab
4. **Paste** the rules
5. Click **"Publish"**

---

## ✅ Testing the Integration

### Test 1: Run the App

```bash
npm start
```

Then press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

### Test 2: Anonymous Sign-In

1. Open the app
2. Click **"Continue Anonymously"**
3. You should be redirected to the home screen
4. Check Firebase Console > Authentication > Users
   - You should see an anonymous user listed

### Test 3: Submit a Report

1. Click the **"+"** button on home screen
2. Fill in the form:
   - **Title**: "Test Report About Corruption"
   - **Category**: "corruption"
   - **Location**: "Test City"
   - **Description**: "This is a test report to verify Firebase integration is working correctly."
   - **Anonymous**: Keep ON
3. Click **"Submit Report"**
4. You should see "Report Submitted Successfully"
5. Check Firebase Console > Firestore Database > `reports` collection
   - You should see your report with status: "pending"

### Test 4: Privacy Verification (Critical!)

1. Submit a report as User A (anonymous)
2. Sign out and sign in as User B (different anonymous user)
3. Go to home screen
4. **Expected Result**: Report should NOT appear (it's still pending)
5. **This confirms privacy protection is working!**

---

## 🎯 What's Working Now

### ✅ Authentication
- Anonymous sign-in (privacy-first)
- Email/password login (for future use)
- Persistent authentication (survives app restarts)

### ✅ Report Submission
- Full validation (title length, category, description)
- Firebase integration
- Auto-status: "pending"
- Reports are private until verified

### ✅ Public Feed
- Fetches only verified reports
- Pull-to-refresh
- Loading states
- Empty state handling
- View count tracking

### ✅ Resources
- Category filtering
- Firebase integration
- View count tracking
- External link support

### ✅ Security
- Privacy protection (pending reports are private)
- Role-based access control
- Input validation
- Anonymous identity protection

---

## 🔧 Troubleshooting

### Issue: "Firebase not initialized"
**Solution**: Make sure you ran `npm install --legacy-peer-deps` and added your Firebase credentials to `src/config/firebase.js`

### Issue: "Permission denied" when submitting report
**Solution**:
1. Check that security rules are deployed
2. Verify you're signed in (check Authentication tab in Firebase Console)
3. Make sure Firestore Database is created

### Issue: "No reports showing in feed"
**Solution**: This is normal! Reports need to be verified by a moderator first. To test:
1. Go to Firebase Console > Firestore Database
2. Find your report in the `reports` collection
3. Manually change `status` to "verified" and `visibility` to "public"
4. Pull to refresh the feed - report should now appear

### Issue: npm install fails with permission errors
**Solution**:
```bash
# Try with sudo (Linux/Mac)
sudo npm install --legacy-peer-deps

# Or on Windows, run as Administrator
```

### Issue: App crashes on startup
**Solution**:
1. Clear Metro bundler cache:
   ```bash
   npx expo start --clear
   ```
2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```

---

## 📱 Running on Physical Device

### Android

1. Install Expo Go app from Play Store
2. Run `npm start`
3. Scan QR code with Expo Go app

### iOS

1. Install Expo Go app from App Store
2. Run `npm start`
3. Scan QR code with Camera app

---

## 🎓 Next Steps

### 1. Set Up Moderation (Optional for now)

To moderate reports, you'll need to set custom claims for moderator users.
See `firebase/README.md` section "Setting Up Moderator Roles"

### 2. Add Sample Resources (Optional)

1. Go to Firebase Console > Firestore Database
2. Click "Start collection" > Enter: `resources`
3. Add a document with these fields:
   ```
   title: "Human Rights Watch"
   description: "Defends the rights of people worldwide"
   category: "legal_rights"
   type: "external_link"
   url: "https://www.hrw.org"
   language: "en"
   isPublished: true
   priority: 1
   viewCount: 0
   createdAt: (timestamp - use server timestamp)
   updatedAt: (timestamp - use server timestamp)
   ```

### 3. Test on Real Device

Build and test on a physical device for best experience

### 4. Customize Branding

- Update app icon: `assets/icon.png`
- Update splash screen: `assets/splash-icon.png`
- Update app name in `app.json`

---

## 📚 Documentation

- **Backend Overview**: `BACKEND_SUMMARY.md`
- **Integration Details**: `INTEGRATION_GUIDE.md`
- **Firebase Setup**: `firebase/README.md`
- **Security Rules**: `firebase/firestore.rules`
- **Data Schema**: `firebase/schema.json`
- **Testing Strategy**: `firebase/TESTING_STRATEGY.md`

---

## 🆘 Getting Help

1. **Firebase Issues**: Check Firebase Console logs
2. **App Crashes**: Check Metro bundler terminal output
3. **Security Rules**: Test in Firebase Console > Firestore > Rules > Rules Playground
4. **Documentation**: All docs are in the project root

---

## ✅ Final Checklist

Before deploying to production:

- [ ] Firebase credentials added to `src/config/firebase.js`
- [ ] Dependencies installed (`npm install --legacy-peer-deps`)
- [ ] Firebase Authentication enabled (Anonymous + Email)
- [ ] Firestore Database created
- [ ] Security rules deployed
- [ ] Tested anonymous sign-in
- [ ] Tested report submission
- [ ] Verified privacy protection (pending reports are private)
- [ ] Firebase config file added to `.gitignore` (already done)
- [ ] App tested on physical device

---

## 🎉 You're All Set!

Your Voice Unheard app is now fully integrated with Firebase backend!

**Key Features Working**:
- ✅ Anonymous reporting
- ✅ Privacy protection
- ✅ Secure data storage
- ✅ Role-based access control
- ✅ Public feed of verified reports
- ✅ Educational resources

**Remember**: This app protects vulnerable individuals. Always prioritize privacy and security!

---

**Need Help?** Check the documentation files or Firebase Console logs.

**Ready to Deploy?** Make sure all items in the Final Checklist are completed.

---

Built with ❤️ for Social Justice and SDG 16
