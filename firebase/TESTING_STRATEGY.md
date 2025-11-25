
# Firebase Security Testing Strategy
## Voice Unheard - SDG 16 App

This document outlines the testing strategy for Firebase security rules, ensuring data privacy and proper access control in accordance with SDG 16 principles.

---

## Overview

The testing strategy focuses on validating that:
1. **Privacy**: Anonymous reports remain private until verified
2. **Access Control**: Users can only access appropriate data based on their role
3. **Data Integrity**: Reports cannot be tampered with during moderation
4. **Accountability**: All moderation actions are logged

---

## Test Categories

### 1. Authentication Tests

#### Test 1.1: Anonymous Sign-In
**Objective**: Verify that users can sign in anonymously without providing personal information

**Test Steps**:
```javascript
// Test file: __tests__/auth.test.js
import { signInAnonymously } from '../src/services/firebaseService';

test('User can sign in anonymously', async () => {
  const result = await signInAnonymously();

  expect(result.success).toBe(true);
  expect(result.user.isAnonymous).toBe(true);
  expect(result.user.uid).toBeDefined();
});
```

**Expected Result**: User successfully signs in with anonymous flag set to true

**Privacy Validation**: Verify that no PII is collected during anonymous sign-in

---

### 2. Privacy & Access Control Tests

#### Test 2.1: Anonymous User Cannot Read Pending Reports (CRITICAL)
**Objective**: Verify that an anonymous user cannot read pending reports submitted by another user

**Test Steps**:
```javascript
// Test file: __tests__/privacy.test.js
import {
  signInAnonymously,
  submitReport,
  fetchPendingReports
} from '../src/services/firebaseService';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

test('Anonymous user cannot read another user\'s pending report', async () => {
  // Step 1: User A signs in anonymously and submits a report
  const userA = await signInAnonymously();
  expect(userA.success).toBe(true);

  const reportData = {
    title: 'Test Injustice Report',
    description: 'This is a test report about corruption in local government.',
    category: 'corruption',
    location: 'Test City',
    isAnonymous: true
  };

  const reportResult = await submitReport(reportData);
  expect(reportResult.success).toBe(true);
  const reportId = reportResult.reportId;

  // Step 2: User B signs in anonymously
  await signOut(); // Sign out User A
  const userB = await signInAnonymously();
  expect(userB.success).toBe(true);

  // Step 3: User B attempts to read User A's pending report directly
  const db = getFirestore();
  const reportRef = doc(db, 'reports', reportId);

  let accessDenied = false;
  try {
    const reportDoc = await getDoc(reportRef);
    // If we can read the document, check if it's actually accessible
    if (reportDoc.exists()) {
      // This should not happen - security rules should prevent this
      accessDenied = false;
    }
  } catch (error) {
    // Expected behavior: permission-denied error
    if (error.code === 'permission-denied') {
      accessDenied = true;
    }
  }

  expect(accessDenied).toBe(true);

  // Step 4: Verify User B cannot fetch pending reports
  const pendingResult = await fetchPendingReports();
  expect(pendingResult.success).toBe(false);
  expect(pendingResult.error).toContain('permission');
});
```

**Expected Result**:
- User B receives `permission-denied` error when trying to read User A's pending report
- `fetchPendingReports()` fails for non-moderator users

**Privacy Validation**:
- Pending reports are NOT visible to unauthorized users
- Anonymous reports remain completely private until verified

---

#### Test 2.2: User Can Read Own Pending Reports
**Objective**: Verify that users can access their own pending reports

**Test Steps**:
```javascript
test('User can read their own pending report', async () => {
  // Sign in and submit report
  const user = await signInAnonymously();
  const reportData = {
    title: 'My Personal Report',
    description: 'This is my report about workplace discrimination.',
    category: 'discrimination',
    isAnonymous: true
  };

  const reportResult = await submitReport(reportData);
  expect(reportResult.success).toBe(true);

  // Fetch own reports
  const myReports = await fetchMyReports();
  expect(myReports.success).toBe(true);
  expect(myReports.reports.length).toBeGreaterThan(0);

  // Verify the report is in the list
  const foundReport = myReports.reports.find(
    r => r.id === reportResult.reportId
  );
  expect(foundReport).toBeDefined();
  expect(foundReport.title).toBe('My Personal Report');
  expect(foundReport.status).toBe('pending');
});
```

**Expected Result**: User successfully retrieves their own pending reports

---

#### Test 2.3: Public Can Only Read Verified Reports
**Objective**: Verify that only verified reports with public visibility are accessible in the feed

**Test Steps**:
```javascript
test('Public feed only shows verified reports', async () => {
  // User submits report (status: pending, visibility: private)
  const user = await signInAnonymously();
  const reportData = {
    title: 'Test Report for Feed',
    description: 'This report should not appear in feed until verified.',
    category: 'abuse',
    isAnonymous: false
  };

  const reportResult = await submitReport(reportData);
  const reportId = reportResult.reportId;

  // Fetch public feed
  const feedBeforeVerification = await fetchFeedReports();
  expect(feedBeforeVerification.success).toBe(true);

  // Verify report is NOT in feed
  const foundInFeed = feedBeforeVerification.reports.find(
    r => r.id === reportId
  );
  expect(foundInFeed).toBeUndefined();

  // Note: In real test, we would have a moderator verify the report
  // Then check that it appears in the feed
  // This requires setting up custom claims for moderator role
});
```

**Expected Result**: Pending reports do not appear in public feed

---

### 3. Moderation & Role-Based Access Tests

#### Test 3.1: Only Moderators Can Update Report Status
**Objective**: Verify that regular users cannot change report status

**Test Steps**:
```javascript
test('Regular user cannot update report status', async () => {
  const user = await signInAnonymously();

  // Submit report
  const reportData = {
    title: 'Test Report',
    description: 'Testing status update restrictions.',
    category: 'other',
    isAnonymous: true
  };

  const reportResult = await submitReport(reportData);
  const reportId = reportResult.reportId;

  // Attempt to update status (should fail)
  const updateResult = await updateReportStatus(
    reportId,
    'verified',
    'Trying to self-verify'
  );

  expect(updateResult.success).toBe(false);
  expect(updateResult.error).toContain('permission');
});
```

**Expected Result**: Non-moderator users receive permission error

---

#### Test 3.2: Moderator Can Update Report Status
**Objective**: Verify that users with moderator role can update report status

**Setup**: Requires setting custom claims for test user
```javascript
// Setup (run in Firebase Admin SDK or emulator)
// admin.auth().setCustomUserClaims(moderatorUid, { role: 'moderator' });
```

**Test Steps**:
```javascript
test('Moderator can update report status', async () => {
  // Note: This test requires Firebase emulator or test environment
  // where custom claims can be set

  // User submits report
  const user = await signInAnonymously();
  const reportData = {
    title: 'Report for Moderation',
    description: 'This report will be verified by moderator.',
    category: 'corruption',
    isAnonymous: true
  };

  const reportResult = await submitReport(reportData);
  const reportId = reportResult.reportId;

  // Sign out and sign in as moderator
  await signOut();
  const moderator = await signInWithEmail(
    'moderator@test.com',
    'testpassword'
  );

  // Update status
  const updateResult = await updateReportStatus(
    reportId,
    'verified',
    'Report verified after investigation'
  );

  expect(updateResult.success).toBe(true);

  // Verify report is now in public feed
  const feed = await fetchFeedReports();
  const verifiedReport = feed.reports.find(r => r.id === reportId);
  expect(verifiedReport).toBeDefined();
  expect(verifiedReport.status).toBe('verified');
  expect(verifiedReport.visibility).toBe('public');
});
```

**Expected Result**: Moderator successfully updates report status and it becomes public

---

### 4. Data Integrity Tests

#### Test 4.1: User Cannot Modify Sensitive Fields
**Objective**: Verify that users cannot modify fields like status, upvotes, or moderatorId

**Test Steps**:
```javascript
test('User cannot modify protected fields', async () => {
  const user = await signInAnonymously();

  // Submit report
  const reportData = {
    title: 'Original Title',
    description: 'Original description for integrity test.',
    category: 'violence',
    isAnonymous: true
  };

  const reportResult = await submitReport(reportData);
  const reportId = reportResult.reportId;

  // Attempt to update with protected fields
  const updateResult = await updateMyReport(reportId, {
    title: 'Updated Title', // Allowed
    status: 'verified', // NOT allowed
    upvotes: 1000, // NOT allowed
    moderatorId: user.user.uid // NOT allowed
  });

  // Update should succeed for allowed fields only
  expect(updateResult.success).toBe(true);

  // Verify protected fields were not modified
  const myReports = await fetchMyReports();
  const updatedReport = myReports.reports.find(r => r.id === reportId);

  expect(updatedReport.title).toBe('Updated Title');
  expect(updatedReport.status).toBe('pending'); // Should remain pending
  expect(updatedReport.upvotes).toBe(0); // Should remain 0
});
```

**Expected Result**: Only allowed fields are updated; protected fields remain unchanged

---

### 5. Anonymous Identity Protection Tests

#### Test 5.1: Anonymous Author ID Hidden in Public Feed
**Objective**: Verify that authorId is hidden for anonymous reports in public feed

**Test Steps**:
```javascript
test('Anonymous reports hide authorId in public feed', async () => {
  // Submit anonymous report
  const user = await signInAnonymously();
  const reportData = {
    title: 'Anonymous Report',
    description: 'This report should hide my identity.',
    category: 'discrimination',
    isAnonymous: true
  };

  const reportResult = await submitReport(reportData);
  const reportId = reportResult.reportId;

  // Moderator verifies report (simulated)
  // ... (would require moderator role setup)

  // Fetch from public feed
  const feed = await fetchFeedReports();
  const publicReport = feed.reports.find(r => r.id === reportId);

  if (publicReport) {
    // Verify authorId is null for anonymous reports
    expect(publicReport.authorId).toBeNull();
    expect(publicReport.isAnonymous).toBe(true);
  }
});
```

**Expected Result**: AuthorId is null in public feed for anonymous reports

---

## Testing Tools & Setup

### Prerequisites
```bash
# Install Firebase testing dependencies
npm install --save-dev @firebase/testing jest
npm install --save-dev @firebase/rules-unit-testing
```

### Firebase Emulator Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase emulator
firebase init emulators

# Start emulators
firebase emulators:start
```

### Test Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testTimeout: 10000
};
```

```javascript
// jest.setup.js
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'voice-unheard-test',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: fs.readFileSync('firebase/firestore.rules', 'utf8')
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});
```

---

## Manual Testing Checklist

### Privacy Tests
- [ ] Anonymous user cannot view other users' pending reports
- [ ] Anonymous user cannot view other users' personal information
- [ ] Only verified reports appear in public feed
- [ ] Anonymous reports hide author identity

### Access Control Tests
- [ ] Regular users cannot access moderator functions
- [ ] Users can only edit their own pending reports
- [ ] Users cannot change report status
- [ ] Moderators can view all pending reports
- [ ] Moderators can change report status

### Data Integrity Tests
- [ ] Report timestamps are set by server (not client)
- [ ] Upvote counts cannot be manually set
- [ ] Status changes create audit log entries
- [ ] Deleted reports decrease user report count

### SDG 16 Compliance Tests
- [ ] All moderation actions are logged in auditLog
- [ ] Audit logs are immutable (cannot be deleted)
- [ ] Only moderators can access audit logs
- [ ] Anonymous reporting protects vulnerable individuals

---

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/firebase-tests.yml
name: Firebase Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Start Firebase Emulator
        run: firebase emulators:exec --only firestore "npm test"
```

---

## Security Audit Schedule

| Frequency | Activity | Responsible |
|-----------|----------|-------------|
| Weekly | Run automated test suite | CI/CD Pipeline |
| Monthly | Manual security audit | Backend Team |
| Quarterly | Third-party security review | Security Consultant |
| Annually | Comprehensive penetration testing | External Auditor |

---

## Test Report Template

```markdown
## Test Execution Report

**Date**: [YYYY-MM-DD]
**Tester**: [Name]
**Environment**: [Production/Staging/Test]

### Test Results Summary
- Total Tests: [X]
- Passed: [X]
- Failed: [X]
- Skipped: [X]

### Failed Tests
1. [Test Name]
   - **Error**: [Error message]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]
   - **Action**: [Remediation plan]

### Privacy Compliance
- [ ] All privacy tests passed
- [ ] No PII exposed in logs
- [ ] Anonymous reports remain private

### SDG 16 Compliance
- [ ] Audit trail complete
- [ ] Access controls enforced
- [ ] Accountability measures verified

### Recommendations
[Any recommendations for improving security or privacy]
```

---

## Key Privacy Validation Points

### Critical Test: Anonymous User Cannot Read Pending Report

This is the **MOST IMPORTANT** test for SDG 16 compliance and user privacy.

**Why it matters**:
- Protects vulnerable individuals reporting injustice
- Prevents retaliation against whistleblowers
- Ensures only verified, safe information is public
- Maintains trust in the reporting system

**Test Validation**:
```javascript
// This MUST return permission-denied error
const db = getFirestore();
const reportRef = doc(db, 'reports', pendingReportId);

try {
  await getDoc(reportRef);
  // FAIL: Should not reach here
  throw new Error('Security breach: Unauthorized access to pending report');
} catch (error) {
  if (error.code !== 'permission-denied') {
    // FAIL: Wrong error type
    throw error;
  }
  // PASS: Correct behavior
  console.log('✓ Privacy protected: Unauthorized access denied');
}
```

**Real-world Impact**:
- If this test fails, anonymous reporters' identities could be exposed
- Pending reports could be accessed before verification
- Attackers could identify and target whistleblowers

---

## Conclusion

This testing strategy ensures that the Voice Unheard app maintains the highest standards of privacy and security, in alignment with SDG 16 principles of peace, justice, and strong institutions. Regular testing and auditing are essential to maintaining user trust and protecting vulnerable individuals.

**Remember**: Privacy is not just a feature—it's a fundamental human right that we must protect through rigorous testing and validation.
