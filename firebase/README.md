# Firebase Backend Integration
## Voice Unheard - SDG 16 Social Injustice Reporting App

This directory contains the Firebase backend configuration, security rules, and documentation for the Voice Unheard application.

---

## 📁 Directory Structure

```
firebase/
├── firestore.rules          # Firestore security rules
├── schema.json              # Database schema documentation
├── TESTING_STRATEGY.md      # Comprehensive testing guide
└── README.md                # This file

src/
├── config/
│   └── firebase.js          # Firebase initialization
└── services/
    └── firebaseService.js   # Backend integration functions
```

---

## 🚀 Quick Start

### 1. Install Firebase Dependencies

```bash
npm install firebase
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click "Add app" > Web
5. Copy the configuration object
6. Update `src/config/firebase.js` with your credentials

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Deploy Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules
```

### 4. Enable Authentication Methods

1. Go to Firebase Console > Authentication
2. Click "Get Started"
3. Enable "Anonymous" authentication
4. (Optional) Enable "Email/Password" authentication

### 5. Create Firestore Database

1. Go to Firebase Console > Firestore Database
2. Click "Create database"
3. Choose "Start in production mode" (security rules will protect data)
4. Select a location closest to your users

---

## 🔒 Security & Privacy (SDG 16 Compliance)

### Data Minimization Principles

1. **Collect Only Essential Data**: Store minimal user information
2. **Anonymous by Default**: Users can report without creating accounts
3. **Privacy-First Design**: Location data is generalized, not precise
4. **Encrypted Storage**: Firebase handles encryption at rest and in transit

### Access Control Hierarchy

```
Public (Unauthenticated)
└── Read: Verified reports (public visibility only)

Authenticated Users
├── Read: Own reports (all statuses)
├── Create: New reports (status: pending)
├── Update: Own pending reports (limited fields)
└── Delete: Own pending reports

Moderators (Custom Claim: role='moderator')
├── Read: All reports (any status)
├── Update: Report status and moderation fields
├── Read: Audit logs
└── Create: Audit log entries

Admins (Custom Claim: role='admin')
├── All Moderator permissions
├── Update: User roles
├── Delete: Any report or user
└── Full access to all collections
```

### Critical Security Features

1. **Privacy Protection**
   - Pending reports are private to author and moderators
   - Anonymous reports hide author identity
   - Only verified reports are publicly visible

2. **Data Integrity**
   - Server timestamps prevent time manipulation
   - Protected fields (status, upvotes) cannot be modified by users
   - Atomic operations for vote counting

3. **Accountability (SDG 16)**
   - All moderation actions logged in `auditLog` collection
   - Audit logs are immutable
   - Moderator ID tracked for every status change

4. **Input Validation**
   - String length limits enforced
   - Category validation (predefined list)
   - Required fields checked at database level

---

## 📊 Data Model

### Collections Overview

#### `users`
Stores minimal user information with privacy-first approach
- Anonymous users: Only uid, isAnonymous, createdAt, role
- Registered users: Add email and optional displayName
- **No location tracking or behavioral data**

#### `reports`
Social injustice reports with privacy and moderation
- **Pending**: Only author and moderators can read
- **Verified**: Public visibility (appears in feed)
- **Rejected**: Only author and moderators can read
- Anonymous flag hides author from public view

#### `resources`
Educational content about rights and justice
- Public access (even unauthenticated)
- Categories: legal_rights, safety, reporting_guide, support
- Priority sorting for important resources

#### `reportVotes`
Tracks user votes to prevent duplicates
- Composite key: `{userId}_{reportId}`
- One vote per user per report

#### `auditLog`
Immutable audit trail for accountability
- Records all moderation actions
- Cannot be updated or deleted
- Only accessible to moderators and admins

See `schema.json` for detailed field documentation.

---

## 🔧 Service Functions

### Authentication

```javascript
import { signInAnonymously, signInWithEmail, createAccount } from './src/services/firebaseService';

// Anonymous sign-in (recommended for privacy)
const result = await signInAnonymously();

// Email/password sign-in
const result = await signInWithEmail('user@example.com', 'password');

// Create account
const result = await createAccount('user@example.com', 'password', 'Display Name');
```

### Submit Report

```javascript
import { submitReport } from './src/services/firebaseService';

const reportData = {
  title: 'Incident Title',
  description: 'Detailed description of the incident...',
  category: 'corruption', // or 'abuse', 'discrimination', 'violence', 'other'
  location: 'General location (optional)',
  isAnonymous: true, // Default: true
  mediaUrls: [], // Optional
  tags: [] // Optional
};

const result = await submitReport(reportData);
console.log(result.reportId); // Use this to track the report
```

### Fetch Reports

```javascript
import { fetchFeedReports, fetchMyReports, fetchPendingReports } from './src/services/firebaseService';

// Public feed (verified reports only)
const feed = await fetchFeedReports(20); // limit: 20

// User's own reports
const myReports = await fetchMyReports(50);

// Pending reports (moderators only)
const pending = await fetchPendingReports(50);
```

### Moderation (Requires Moderator Role)

```javascript
import { updateReportStatus } from './src/services/firebaseService';

// Update report status
const result = await updateReportStatus(
  reportId,
  'verified', // or 'under_review', 'rejected', 'resolved'
  'Moderator notes (optional)'
);
```

### Resources

```javascript
import { fetchResources } from './src/services/firebaseService';

// Fetch all published resources
const resources = await fetchResources();

// Fetch by category
const legalResources = await fetchResources('legal_rights');
```

---

## 👥 Setting Up Moderator Roles

Moderator and admin roles are set via Firebase Authentication Custom Claims.

### Using Firebase Admin SDK

```javascript
// Node.js script or Cloud Function
const admin = require('firebase-admin');
admin.initializeApp();

// Set moderator role
await admin.auth().setCustomUserClaims(userId, { role: 'moderator' });

// Set admin role
await admin.auth().setCustomUserClaims(userId, { role: 'admin' });
```

### Using Firebase CLI (Manual)

```bash
# Install Firebase Admin
npm install firebase-admin

# Create a script (setCustomClaims.js)
# Run with: node setCustomClaims.js [userId] [role]
```

---

## 🧪 Testing

See `TESTING_STRATEGY.md` for comprehensive testing documentation.

### Quick Test Setup

```bash
# Install testing dependencies
npm install --save-dev @firebase/rules-unit-testing jest

# Start Firebase Emulator
firebase emulators:start

# Run tests
npm test
```

### Critical Test: Privacy Protection

```javascript
// Verify anonymous users cannot read other users' pending reports
test('Anonymous user cannot read pending report', async () => {
  // User A submits report
  const userA = await signInAnonymously();
  const report = await submitReport({
    title: 'Test Report',
    description: 'This should be private',
    category: 'other',
    isAnonymous: true
  });

  // User B attempts to read
  await signOut();
  const userB = await signInAnonymously();

  // Should fail with permission-denied
  try {
    const reportDoc = await getDoc(doc(db, 'reports', report.reportId));
    expect(reportDoc.exists()).toBe(false); // Should not exist for userB
  } catch (error) {
    expect(error.code).toBe('permission-denied'); // Expected
  }
});
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Firebase config file added to `.gitignore`
- [ ] Security rules deployed to Firestore
- [ ] Anonymous authentication enabled
- [ ] Test user accounts created for testing
- [ ] Moderator custom claims set for admin users
- [ ] All security tests passing
- [ ] Privacy tests validated
- [ ] Audit log collection verified
- [ ] Data minimization principles followed
- [ ] Backup and recovery plan established

---

## 📈 Firestore Indexes

The following composite indexes are required:

```
Collection: reports
- status ASC, createdAt DESC
- visibility ASC, status ASC, createdAt DESC
- authorId ASC, createdAt DESC
- category ASC, status ASC, createdAt DESC

Collection: resources
- isPublished ASC, priority DESC, createdAt DESC
- category ASC, isPublished ASC, createdAt DESC

Collection: auditLog
- resourceType ASC, resourceId ASC, timestamp DESC
- moderatorId ASC, timestamp DESC
```

These will be automatically created when you run queries, or you can create them manually in Firebase Console > Firestore Database > Indexes.

---

## 🚨 Troubleshooting

### "Missing or insufficient permissions" Error

**Cause**: Security rules are blocking the operation
**Solution**:
1. Check that security rules are deployed: `firebase deploy --only firestore:rules`
2. Verify user authentication state
3. For moderator operations, verify custom claims are set
4. Check that report status allows the operation (e.g., only pending reports can be edited by author)

### "Quota Exceeded" Error

**Cause**: Free tier limits exceeded
**Solution**:
1. Check Firebase Console > Usage
2. Optimize queries with proper indexing
3. Consider upgrading to Blaze (pay-as-you-go) plan
4. Implement client-side caching

### "Index Required" Error

**Cause**: Composite index not created
**Solution**:
1. Click the link in the error message (Firebase will auto-create index)
2. Or manually create in Firebase Console > Firestore > Indexes
3. Wait 5-10 minutes for index to build

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [SDG 16: Peace, Justice and Strong Institutions](https://sdgs.un.org/goals/goal16)

---

## 📝 License & Ethics

This backend implementation follows:
- **GDPR** compliance for data privacy
- **SDG 16** principles for justice and accountability
- **Privacy by Design** methodology
- **Data Minimization** best practices

**Remember**: This app protects vulnerable individuals. Always prioritize privacy and security in every decision.

---

## 🤝 Contributing

When contributing to backend code:
1. Never commit Firebase credentials
2. Test security rules thoroughly
3. Document all data model changes
4. Update testing strategy for new features
5. Verify privacy protections remain intact

---

**Built with ❤️ for Social Justice and SDG 16**
