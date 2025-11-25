# Firebase Service Usage Examples

Complete guide for using the Firebase service functions in your Voice Unheard app.

## Table of Contents
1. [Authentication](#authentication)
2. [Report Management](#report-management)
3. [Voting System](#voting-system)
4. [Moderation](#moderation)
5. [Resources](#resources)
6. [Error Handling](#error-handling)

---

## Authentication

### Anonymous Sign-In (Recommended for Privacy)

```typescript
import { signInAnonymously } from './services/firebaseService';

// Sign in anonymously
const handleAnonymousSignIn = async () => {
  const result = await signInAnonymously();

  if (result.success) {
    console.log('Signed in anonymously');
    console.log('User data:', result.data);
  } else {
    console.error('Sign in failed:', result.error);
  }
};
```

### Create Account with Email/Password

```typescript
import { createAccount } from './services/firebaseService';

const handleCreateAccount = async () => {
  const result = await createAccount(
    'user@example.com',
    'securePassword123',
    'John Doe' // optional display name
  );

  if (result.success) {
    console.log('Account created:', result.data);
  } else {
    console.error('Error:', result.error);
  }
};
```

### Sign In with Email/Password

```typescript
import { signInWithEmail } from './services/firebaseService';

const handleSignIn = async (email: string, password: string) => {
  const result = await signInWithEmail(email, password);

  if (result.success) {
    console.log('Signed in successfully');
    console.log('User role:', result.data?.role);
  } else {
    console.error('Sign in failed:', result.error);
  }
};
```

### Listen to Auth State Changes

```typescript
import { onAuthStateChange } from './services/firebaseService';
import { useEffect } from 'react';

const AuthObserver = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        console.log('User is signed in:', user.uid);
      } else {
        console.log('User is signed out');
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);
};
```

### Sign Out

```typescript
import { signOut } from './services/firebaseService';

const handleSignOut = async () => {
  const result = await signOut();

  if (result.success) {
    console.log('Signed out successfully');
  }
};
```

---

## Report Management

### Submit a New Report

```typescript
import { submitReport } from './services/firebaseService';
import { CreateReportData } from '../types/firebase.types';

const handleSubmitReport = async () => {
  const reportData: CreateReportData = {
    title: 'Police Brutality at Downtown Protest',
    description: 'Detailed description of the incident that occurred on...',
    category: 'abuse',
    location: 'Downtown City Center', // optional
    isAnonymous: true, // default is true for privacy
    tags: ['protest', 'police', 'rights'], // optional
    mediaUrls: [] // optional
  };

  const result = await submitReport(reportData);

  if (result.success) {
    console.log('Report submitted with ID:', result.data?.reportId);
    // Navigate to report details or show success message
  } else {
    console.error('Error submitting report:', result.error);
  }
};
```

### Fetch Public Feed (Verified Reports)

```typescript
import { fetchFeedReports } from './services/firebaseService';
import { useState, useEffect } from 'react';
import { Report } from '../types/firebase.types';

const FeedScreen = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    setLoading(true);
    const result = await fetchFeedReports(20); // limit to 20 reports

    setReports(result.items);
    setLoading(false);
  };

  // Pagination - Load more
  const [lastDoc, setLastDoc] = useState<any>(null);

  const loadMoreReports = async () => {
    if (!lastDoc) return;

    const result = await fetchFeedReports(20, lastDoc);

    if (result.hasMore) {
      setReports([...reports, ...result.items]);
      setLastDoc(result.lastDoc);
    }
  };

  return (
    // Your UI components
  );
};
```

### Fetch My Reports

```typescript
import { fetchMyReports } from './services/firebaseService';

const MyReportsScreen = () => {
  const [myReports, setMyReports] = useState<Report[]>([]);

  useEffect(() => {
    loadMyReports();
  }, []);

  const loadMyReports = async () => {
    const result = await fetchMyReports(50); // limit to 50

    if (result.success) {
      setMyReports(result.data || []);
    } else {
      console.error('Error loading reports:', result.error);
    }
  };
};
```

### Fetch Single Report by ID

```typescript
import { fetchReportById, incrementViewCount } from './services/firebaseService';

const ReportDetailScreen = ({ reportId }: { reportId: string }) => {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    const result = await fetchReportById(reportId);

    if (result.success) {
      setReport(result.data || null);

      // Increment view count
      await incrementViewCount(reportId);
    }
  };
};
```

### Update My Pending Report

```typescript
import { updateMyReport } from './services/firebaseService';
import { UpdateReportData } from '../types/firebase.types';

const handleUpdateReport = async (reportId: string) => {
  const updates: UpdateReportData = {
    title: 'Updated Title',
    description: 'Updated description with more details...',
    tags: ['updated', 'tags']
  };

  const result = await updateMyReport(reportId, updates);

  if (result.success) {
    console.log('Report updated successfully');
  } else {
    console.error('Error:', result.error);
    // "Only pending reports can be edited"
  }
};
```

### Delete My Pending Report

```typescript
import { deleteMyReport } from './services/firebaseService';

const handleDeleteReport = async (reportId: string) => {
  // Show confirmation dialog first
  const confirmed = window.confirm('Are you sure you want to delete this report?');

  if (confirmed) {
    const result = await deleteMyReport(reportId);

    if (result.success) {
      console.log('Report deleted');
      // Navigate back or refresh list
    } else {
      console.error('Error:', result.error);
    }
  }
};
```

---

## Voting System

### Upvote a Report

```typescript
import { upvoteReport, hasUserVoted } from './services/firebaseService';
import { useState, useEffect } from 'react';

const UpvoteButton = ({ reportId }: { reportId: string }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkVoteStatus();
  }, [reportId]);

  const checkVoteStatus = async () => {
    const voted = await hasUserVoted(reportId);
    setHasVoted(voted);
  };

  const handleUpvote = async () => {
    setLoading(true);
    const result = await upvoteReport(reportId);

    if (result.success) {
      setHasVoted(true);
      console.log('Upvoted successfully');
    } else {
      console.error('Error:', result.error);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={hasVoted || loading}
    >
      {hasVoted ? 'Upvoted' : 'Upvote'}
    </button>
  );
};
```

### Remove Upvote

```typescript
import { removeUpvote } from './services/firebaseService';

const handleRemoveUpvote = async (reportId: string) => {
  const result = await removeUpvote(reportId);

  if (result.success) {
    console.log('Upvote removed');
    setHasVoted(false);
  }
};
```

---

## Moderation

### Fetch Pending Reports (Moderators Only)

```typescript
import { fetchPendingReports } from './services/firebaseService';

const ModerationDashboard = () => {
  const [pendingReports, setPendingReports] = useState<Report[]>([]);

  useEffect(() => {
    loadPendingReports();
  }, []);

  const loadPendingReports = async () => {
    const result = await fetchPendingReports(50);

    if (result.success) {
      setPendingReports(result.data || []);
    } else {
      console.error('Error:', result.error);
      // User might not have moderator permissions
    }
  };
};
```

### Update Report Status

```typescript
import { updateReportStatus } from './services/firebaseService';
import { ReportStatus } from '../types/firebase.types';

const handleVerifyReport = async (reportId: string) => {
  const result = await updateReportStatus(
    reportId,
    'verified',
    'Verified after thorough review'
  );

  if (result.success) {
    console.log('Report verified and made public');
    // Refresh pending reports list
  }
};

const handleRejectReport = async (reportId: string) => {
  const result = await updateReportStatus(
    reportId,
    'rejected',
    'Does not meet community guidelines'
  );

  if (result.success) {
    console.log('Report rejected');
  }
};

const handleMarkUnderReview = async (reportId: string) => {
  const result = await updateReportStatus(
    reportId,
    'under_review',
    'Investigating claims'
  );
};
```

---

## Resources

### Fetch All Published Resources

```typescript
import { fetchResources, incrementResourceViewCount } from './services/firebaseService';
import { Resource } from '../types/firebase.types';

const ResourcesScreen = () => {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    const result = await fetchResources(); // All categories

    if (result.success) {
      setResources(result.data || []);
    }
  };

  const handleResourceView = async (resourceId: string) => {
    await incrementResourceViewCount(resourceId);
  };
};
```

### Fetch Resources by Category

```typescript
import { fetchResources } from './services/firebaseService';
import { ResourceCategory } from '../types/firebase.types';

const LegalRightsScreen = () => {
  const [legalResources, setLegalResources] = useState<Resource[]>([]);

  useEffect(() => {
    loadLegalResources();
  }, []);

  const loadLegalResources = async () => {
    const result = await fetchResources('legal_rights');

    if (result.success) {
      setLegalResources(result.data || []);
    }
  };
};

// Available categories:
// 'legal_rights' | 'safety' | 'reporting_guide' | 'support' | 'general'
```

---

## Error Handling

### Comprehensive Error Handling Pattern

```typescript
import { submitReport } from './services/firebaseService';
import { useState } from 'react';

const ReportForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: CreateReportData) => {
    setError(null);
    setLoading(true);

    try {
      const result = await submitReport(formData);

      if (result.success) {
        // Success - navigate or show success message
        console.log('Report submitted:', result.data?.reportId);
      } else {
        // Handle specific errors
        if (result.error?.includes('Title must be')) {
          setError('Please check your title length');
        } else if (result.error?.includes('authenticated')) {
          setError('Please sign in to submit a report');
        } else {
          setError(result.error || 'An error occurred');
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
};
```

### Common Error Messages

```typescript
// Authentication errors
"User not authenticated" // User needs to sign in
"Invalid email or password" // Wrong credentials

// Report errors
"Title must be between 5 and 200 characters"
"Description must be between 20 and 5000 characters"
"You can only edit your own reports"
"Only pending reports can be edited"
"Report not found"

// Voting errors
"You have already voted on this report"

// Permission errors
"Missing or insufficient permissions" // User lacks required role
```

---

## Complete Example: Report Submission Flow

```typescript
import React, { useState } from 'react';
import { submitReport, signInAnonymously } from './services/firebaseService';
import { CreateReportData, ReportCategory } from '../types/firebase.types';

const ReportSubmissionScreen = () => {
  const [formData, setFormData] = useState<CreateReportData>({
    title: '',
    description: '',
    category: 'other',
    location: '',
    isAnonymous: true,
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      // Ensure user is authenticated (anonymous)
      const user = auth.currentUser;
      if (!user) {
        await signInAnonymously();
      }

      // Submit report
      const result = await submitReport(formData);

      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'other',
          location: '',
          isAnonymous: true,
          tags: []
        });

        // Navigate to success screen or report details
      } else {
        setError(result.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your form UI here */}
      {error && <div className="error">{error}</div>}
      {success && <div className="success">Report submitted successfully!</div>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Report'}
      </button>
    </div>
  );
};
```

---

## Best Practices

### 1. Always Check Authentication First

```typescript
import { auth } from '../../firebaseConfig';

const checkAuth = () => {
  if (!auth.currentUser) {
    // Redirect to sign in or sign in anonymously
    await signInAnonymously();
  }
};
```

### 2. Handle Loading States

```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    // Your async operation
  } finally {
    setLoading(false); // Always cleanup
  }
};
```

### 3. Implement Pagination for Large Lists

```typescript
const [reports, setReports] = useState<Report[]>([]);
const [lastDoc, setLastDoc] = useState<any>(null);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore) return;

  const result = await fetchFeedReports(20, lastDoc);

  setReports([...reports, ...result.items]);
  setLastDoc(result.lastDoc);
  setHasMore(result.hasMore);
};
```

### 4. Cache Data When Appropriate

```typescript
import { useState, useEffect } from 'react';

const useCachedResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    if (!cached) {
      loadResources();
    }
  }, [cached]);

  const loadResources = async () => {
    const result = await fetchResources();
    if (result.success) {
      setResources(result.data || []);
      setCached(true);
    }
  };

  return { resources, refresh: () => setCached(false) };
};
```

---

## Testing Your Implementation

### Quick Test Checklist

- [ ] Anonymous sign-in works
- [ ] Report submission succeeds
- [ ] Feed displays verified reports
- [ ] User can view their own reports
- [ ] Upvoting works and prevents duplicates
- [ ] Resources load correctly
- [ ] Error messages display properly
- [ ] Loading states work

### Console Testing

```typescript
// In browser console or React Native debugger:

// Test anonymous sign in
signInAnonymously().then(console.log);

// Test report submission
submitReport({
  title: 'Test Report',
  description: 'This is a test report with enough characters to pass validation',
  category: 'other',
  isAnonymous: true
}).then(console.log);

// Test fetching feed
fetchFeedReports(5).then(console.log);
```

---

**Need Help?** Check the Firebase console for detailed error logs and security rule violations.
