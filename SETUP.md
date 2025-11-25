# Voice Unheard - Setup Guide

This guide will help you set up and run the Voice Unheard application after all bug fixes have been applied.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

#### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Enable **Email/Password** authentication
4. Enable **Anonymous** authentication

#### Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode** (you'll deploy security rules later)
4. Choose your preferred region

#### Deploy Firestore Security Rules

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Select your Firebase project
# Use the existing firestore.rules file when prompted

# Deploy the rules
firebase deploy --only firestore:rules
```

#### Get Your Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Firebase credentials:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

### 4. Run the Application

#### For Web
```bash
npm run web
```

#### For iOS (requires macOS with Xcode)
```bash
npm run ios
```

#### For Android (requires Android Studio)
```bash
npm run android
```

#### Using Expo Go App
```bash
npx expo start
```
Then scan the QR code with the Expo Go app on your mobile device.

## Bug Fixes Applied

The following critical bugs have been fixed:

### ✅ Critical Fixes

1. **Firebase Configuration Missing** - Created `firebaseConfig.ts` and `src/config/firebase.ts`
2. **Duplicate Service Files** - Removed JavaScript version, standardized on TypeScript
3. **API Response Structure Mismatches** - Fixed all response handling in home, resources, and profile screens
4. **Admin Dashboard Mock Data** - Implemented real Firebase integration with `fetchPendingReports()` and `updateReportStatus()`
5. **Missing Sign-Up Functionality** - Created complete sign-up flow with validation

### ✅ Error Handling

- Added try-catch blocks to all async operations
- Proper error messages for users
- Console logging for debugging

### ✅ Code Quality Improvements

- Consistent TypeScript usage across all service calls
- Proper error propagation
- Loading states and user feedback

## Testing the App

### Test Anonymous Sign-In

1. Click "Continue Anonymously" on the login screen
2. You should be redirected to the home screen
3. Navigate to Profile to see your anonymous user status

### Test Email Sign-Up

1. Click "Sign Up" on the login screen
2. Fill in the registration form
3. Create an account
4. You should be redirected to the home screen

### Test Report Submission

1. Click the "+" button on the home screen
2. Fill in the report form
3. Submit the report
4. Navigate to Profile to see your submitted report (status: pending)

### Test Admin Moderation

1. Navigate to Resources screen
2. Click "Access Moderator Dashboard"
3. View pending reports
4. Approve or reject reports
5. Check the home feed to see verified reports

## Important Notes

### Security

- **Never commit your `.env` file** - It's already in `.gitignore`
- Deploy Firestore security rules before going to production
- The current Firestore rules allow all reads/writes for testing - update them for production

### Moderator Access

Currently, any user can access the moderation dashboard. In production, you should:

1. Set up Firebase Custom Claims for moderator roles
2. Update Firestore rules to enforce role-based access
3. Add client-side role checking in the UI

### Storage

If you want to enable image uploads for reports:

1. Enable Firebase Storage in Firebase Console
2. Deploy storage security rules from `firebase/storage.rules`
3. Implement image upload functionality in the report submission form

## Firestore Collections Structure

The app uses these Firestore collections:

- `users` - User profiles and metadata
- `reports` - User-submitted reports
- `resources` - Educational resources
- `reportVotes` - User votes on reports
- `auditLog` - Moderation activity logs

## Troubleshooting

### "Module not found: firebaseConfig"

Make sure you've created the `.env` file with your Firebase credentials.

### "Firebase: Error (auth/invalid-api-key)"

Check that your Firebase API key in `.env` is correct.

### "No pending reports" in Admin Dashboard

This is normal if no reports have been submitted yet. Submit a report first.

### Reports not showing in feed

Reports must be approved by a moderator before appearing in the public feed.

## Next Steps

1. **Add Image Upload**: Implement media upload for reports
2. **Email Verification**: Add email verification for new accounts
3. **Password Reset**: Implement forgot password functionality
4. **Push Notifications**: Notify users when their reports are reviewed
5. **Report Details**: Create a detail view for individual reports
6. **Search & Filters**: Add search and filtering to the home feed
7. **Analytics**: Track app usage and report trends

## Support

For issues or questions, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
