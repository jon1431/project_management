# 🧪 Complete Testing Guide - Voice Unheard App

## Pre-Testing Setup (MUST DO FIRST!)

### Step 1: Deploy Security Rules to Firebase
```bash
cd /mnt/c/Users/User/Desktop/Year2/Sem1/Project_mangement/project_management

# Login to Firebase
firebase login

# Select your project
firebase use project-managem

# Deploy rules and indexes
firebase deploy --only firestore
```

**Expected Output:**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/project-managem/overview
```

### Step 2: Enable Authentication in Firebase Console

1. Open: https://console.firebase.google.com/project/project-managem/authentication
2. Click **"Get Started"** (if first time)
3. Go to **"Sign-in method"** tab
4. Click on **"Anonymous"**
   - Toggle it **ON**
   - Click **"Save"**
5. (Optional) Enable **"Email/Password"** the same way

### Step 3: Create Firestore Database (if not done)

1. Open: https://console.firebase.google.com/project/project-managem/firestore
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select location (e.g., us-central1)
5. Click **"Enable"**

---

## 🚀 Running the App

### Option 1: Web (Easiest for testing)
```bash
npm start

# When Metro bundler starts, press 'w' for web
```

### Option 2: Android Emulator
```bash
# Make sure Android emulator is running
npm run android
```

### Option 3: iOS Simulator (Mac only)
```bash
npm run ios
```

### Option 4: Physical Device
```bash
npm start

# Scan QR code with Expo Go app
# iOS: Use Camera app
# Android: Use Expo Go app
```

---

## ✅ Test Scenarios

### Test 1: Anonymous Authentication (Privacy-First)

**Goal:** Verify users can sign in anonymously

**Steps:**
1. ✅ Launch the app
2. ✅ You should see the **Login Screen** with:
   - Email/Password fields
   - "Login" button
   - "Continue Anonymously" button
3. ✅ Click **"Continue Anonymously"**
4. ✅ Should navigate to **Home Screen** automatically
5. ✅ Check console logs for: "✅ Firebase initialized successfully"

**Expected Result:**
- ✅ Successful navigation to Home tab
- ✅ Bottom tabs visible (Home, Report, Resources, Profile)

**If it fails:**
- Check Firebase Console → Authentication → Anonymous is enabled
- Check browser console for error messages
- Verify Firebase credentials in `src/config/firebase.js`

---

### Test 2: Submit a Report

**Goal:** Create a new report and save to Firestore

**Steps:**
1. ✅ Click on **"Report"** tab at bottom
2. ✅ Fill in the form:
   - **Title:** "Test Report - Integration Working"
   - **Category:** type "other"
   - **Location:** "Test City" (optional)
   - **Description:** "This is a test report to verify that Firebase integration is working correctly. The app should successfully save this to Firestore."
3. ✅ Toggle **"Submit Anonymously"** (should be ON by default)
4. ✅ Click **"Submit Report"**
5. ✅ Wait for success alert

**Expected Result:**
- ✅ Alert shows: "Report Submitted Successfully"
- ✅ Form clears
- ✅ Navigates back to previous screen

**Verify in Firebase Console:**
1. Go to: https://console.firebase.google.com/project/project-managem/firestore/data
2. Open `reports` collection
3. Find your new report document
4. Should see fields:
   - `title`: "Test Report - Integration Working"
   - `status`: "pending"
   - `visibility`: "private"
   - `authorId`: [your user ID]
   - `upvotes`: 0
   - `viewCount`: 0

---

### Test 3: View Your Reports (Profile Screen)

**Goal:** See all reports you've submitted

**Steps:**
1. ✅ Click on **"Profile"** tab
2. ✅ Should see:
   - Your email or "Anonymous User"
   - Statistics cards:
     - Total Reports: 1
     - Verified: 0
     - Pending: 1
3. ✅ Scroll down to see **"My Reports"** section
4. ✅ Should see your test report with:
   - Yellow "pending" badge
   - Title and description
   - Category badge
   - Created date

**Expected Result:**
- ✅ Report appears with pending status
- ✅ Stats are accurate
- ✅ Trash icon appears (since it's pending)

**Test Delete:**
1. ✅ Click trash icon on your pending report
2. ✅ Confirm deletion
3. ✅ Report disappears from list
4. ✅ Stats update (Pending: 0)

---

### Test 4: Manually Verify Report (For Feed Testing)

**Goal:** Make a report public so it appears in the feed

**Steps in Firebase Console:**
1. Go to: https://console.firebase.google.com/project/project-managem/firestore/data
2. Click `reports` collection
3. Find a report (create one first if you deleted it)
4. Click on the document ID to edit
5. **Edit these fields:**
   - `status`: Change from "pending" to **"verified"**
   - `visibility`: Change from "private" to **"public"**
6. Click **"Update"**

**Now test in app:**
1. ✅ Go to **Home** tab
2. ✅ Pull down to refresh
3. ✅ Your verified report should appear!
4. ✅ Should show:
   - Green "Verified" badge
   - Category badge
   - Title and description
   - View count: 0
   - Upvotes: 0

---

### Test 5: View Report & Increment View Count

**Goal:** Verify view tracking works

**Steps:**
1. ✅ On Home tab, click on a verified report
2. ✅ (Currently goes to TODO - but view count still increments)
3. ✅ Pull down to refresh the feed
4. ✅ View count should increase by 1

**Verify in Firebase Console:**
1. Check the report document
2. `viewCount` should have increased

---

### Test 6: Resources Screen

**Goal:** Display educational resources

**First, create a test resource in Firebase Console:**
1. Go to Firestore Data
2. Click **"Start collection"**
3. Collection ID: `resources`
4. Add document with these fields:
   ```
   title: "Your Legal Rights"
   description: "Learn about your fundamental rights and how to protect them."
   category: "legal_rights"
   type: "article"
   content: "Full article content here..."
   language: "en"
   isPublished: true
   priority: 10
   viewCount: 0
   createdAt: [Click "Current timestamp"]
   updatedAt: [Click "Current timestamp"]
   ```
5. Click **"Save"**

**Now test in app:**
1. ✅ Go to **Resources** tab
2. ✅ Should see your test resource
3. ✅ Try category filters at top
4. ✅ Click on a resource
5. ✅ View count increments

---

### Test 7: Sign Out

**Goal:** Verify sign out works

**Steps:**
1. ✅ Go to **Profile** tab
2. ✅ Click red **logout icon** (top right)
3. ✅ Confirm sign out
4. ✅ Should navigate back to **Login Screen**

**Expected Result:**
- ✅ Returns to login
- ✅ User state cleared
- ✅ Can sign in again

---

### Test 8: Email/Password Sign Up (Optional)

**Goal:** Create a registered account

**Steps:**
1. ✅ On Login screen, fill in:
   - Email: "test@example.com"
   - Password: "Test123456"
2. ✅ Click **"Sign Up"** (Need to add this button - see note below)
3. ✅ Or use Firebase Console to create user

**Note:** Sign up button not implemented yet. Two options:
1. Add sign up screen (recommended)
2. Create test users in Firebase Console → Authentication → Add user

---

## 🔍 Debugging Tests

### Check Console Logs

**Web:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for Firebase messages

**React Native:**
```bash
# In terminal where you ran npm start
# Should see logs like:
✅ Firebase initialized successfully
```

### Common Issues & Solutions

#### Issue: "Permission denied" errors
**Solution:**
```bash
# Deploy security rules
firebase deploy --only firestore

# Verify in Firebase Console → Firestore → Rules
# Should show your custom rules, not default
```

#### Issue: "No reports in feed"
**Cause:** Reports must be verified first
**Solution:** Manually verify a report in Firebase Console:
- Set `status`: "verified"
- Set `visibility`: "public"

#### Issue: "Auth not initialized"
**Solution:**
- Check Firebase Console → Authentication is set up
- Enable Anonymous sign-in method
- Restart the app

#### Issue: "Cannot find module 'firebase'"
**Solution:**
```bash
npm install firebase --legacy-peer-deps
```

#### Issue: App crashes on startup
**Solution:**
```bash
# Clear cache and restart
npm start -- --clear

# Or
rm -rf node_modules
npm install --legacy-peer-deps
npm start
```

---

## 📊 Monitoring in Firebase Console

### Real-time Monitoring

**Authentication:**
https://console.firebase.google.com/project/project-managem/authentication/users
- See all signed-in users
- Anonymous users will have random UIDs

**Firestore Data:**
https://console.firebase.google.com/project/project-managem/firestore/data
- See all reports
- Edit documents in real-time
- Monitor data structure

**Usage Stats:**
https://console.firebase.google.com/project/project-managem/usage
- Read/Write operations
- Storage usage
- Authentication counts

---

## ✅ Complete Test Checklist

### Setup Phase
- [ ] Security rules deployed
- [ ] Anonymous auth enabled
- [ ] Firestore database created
- [ ] App starts without errors

### Authentication Tests
- [ ] Anonymous sign in works
- [ ] Navigates to home after login
- [ ] User state persists on app refresh
- [ ] Sign out works
- [ ] Returns to login after sign out

### Report Tests
- [ ] Submit report form works
- [ ] Validation catches errors (try empty fields)
- [ ] Report appears in Firestore
- [ ] Report appears in Profile tab
- [ ] Delete pending report works
- [ ] Cannot delete verified reports

### Feed Tests
- [ ] Verified reports show in home feed
- [ ] Pull-to-refresh works
- [ ] Empty state shows when no reports
- [ ] View count increments
- [ ] Categories display correctly

### Profile Tests
- [ ] Shows correct user info
- [ ] Stats are accurate
- [ ] My reports list loads
- [ ] Status badges show correctly
- [ ] Moderator notes display (if any)

### Resources Tests
- [ ] Resources load
- [ ] Category filters work
- [ ] View count increments
- [ ] External links open (if any)

---

## 🎯 Performance Tests

### Load Testing
1. Create 20+ test reports
2. Verify feed loads quickly
3. Pull-to-refresh should be smooth

### Offline Testing
1. Turn off internet
2. Try to submit report
3. Should show appropriate error
4. Turn internet back on
5. Retry - should work

---

## 📱 Device-Specific Testing

### iOS
- Smooth animations
- Tab bar behaves correctly
- Keyboard doesn't cover inputs

### Android
- Back button works correctly
- Material design components
- Permissions handled properly

### Web
- Responsive design
- Works on different browsers
- Console shows no errors

---

## 🚨 Critical Tests Before Production

1. **Security:**
   - [ ] Rules deployed and working
   - [ ] Can't read other users' pending reports
   - [ ] Can't edit verified reports
   - [ ] Anonymous reporting works

2. **Data Integrity:**
   - [ ] No duplicate reports created
   - [ ] Timestamps are correct
   - [ ] Required fields enforced

3. **User Experience:**
   - [ ] Loading states show
   - [ ] Error messages clear
   - [ ] Success feedback appears
   - [ ] Navigation is smooth

---

## 📝 Test Report Template

After testing, document your findings:

```
Date: [Today's date]
Tester: [Your name]

✅ Working Features:
- Anonymous authentication
- Report submission
- [Add more...]

⚠️ Issues Found:
- [Describe any issues]
- [Steps to reproduce]

🔧 Fixes Needed:
- [List improvements needed]

📈 Performance:
- App load time: [X seconds]
- Report submission: [X seconds]
- Feed load time: [X seconds]
```

---

## 🎉 Success Criteria

Your integration is successful when:
- ✅ Can sign in anonymously
- ✅ Can submit reports
- ✅ Reports save to Firestore
- ✅ Can view own reports in Profile
- ✅ Verified reports show in feed
- ✅ View counts increment
- ✅ Resources load correctly
- ✅ Sign out works
- ✅ No console errors

---

**Ready to test!** Start with the pre-testing setup, then follow the test scenarios in order. Good luck! 🚀
