/**
 * Firebase Service - Voice Unheard App
 * Comprehensive backend integration for SDG 16 Social Injustice Reporting
 *
 * Features:
 * - Anonymous & authenticated user management
 * - Privacy-first report submission and management
 * - Moderation and status updates with audit logging
 * - Resource management for educational content
 * - Community voting system
 */

import {
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  increment,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

import { auth, db } from '../../firebaseConfig';
import {
  User,
  CreateUserData,
  Report,
  CreateReportData,
  UpdateReportData,
  ReportStatus,
  Resource,
  ResourceCategory,
  ReportVote,
  AuditLog,
  ApiResponse,
  PaginatedResponse
} from '../types/firebase.types';

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sign in anonymously (recommended for privacy)
 * Creates a new anonymous user account automatically
 */
export const signInAnonymously = async (): Promise<ApiResponse<User>> => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    const userData: CreateUserData = {
      uid: firebaseUser.uid,
      email: null,
      displayName: null,
      isAnonymous: true,
      role: 'user',
      reportsCount: 0
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });

    return {
      success: true,
      data: {
        ...userData,
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now()
      },
      message: 'Signed in anonymously'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<ApiResponse<User>> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update last active timestamp
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      lastActive: serverTimestamp()
    });

    // Fetch user document
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data() as User;

    return {
      success: true,
      data: userData,
      message: 'Signed in successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create a new account with email and password
 */
export const createAccount = async (
  email: string,
  password: string,
  displayName?: string
): Promise<ApiResponse<User>> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile with display name
    if (displayName) {
      await updateProfile(firebaseUser, { displayName });
    }

    // Create user document
    const userData: CreateUserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName || null,
      isAnonymous: false,
      role: 'user',
      reportsCount: 0
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });

    return {
      success: true,
      data: {
        ...userData,
        createdAt: Timestamp.now(),
        lastActive: Timestamp.now()
      },
      message: 'Account created successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<ApiResponse> => {
  try {
    await firebaseSignOut(auth);
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current user data
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  if (!userDoc.exists()) return null;

  return userDoc.data() as User;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================================================
// REPORT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Submit a new report
 */
export const submitReport = async (
  reportData: CreateReportData
): Promise<ApiResponse<{ reportId: string }>> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Validate required fields
    if (!reportData.title || reportData.title.length < 5 || reportData.title.length > 200) {
      return { success: false, error: 'Title must be between 5 and 200 characters' };
    }

    if (!reportData.description || reportData.description.length < 20 || reportData.description.length > 5000) {
      return { success: false, error: 'Description must be between 20 and 5000 characters' };
    }

    // Create report document
    const reportRef = doc(collection(db, 'reports'));
    const report = {
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: reportData.location || null,
      locationCoords: reportData.locationCoords || null,
      authorId: user.uid,
      isAnonymous: reportData.isAnonymous ?? true,
      status: 'pending',
      visibility: 'private',
      upvotes: 0,
      viewCount: 0,
      mediaUrls: reportData.mediaUrls || [],
      tags: reportData.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(reportRef, report);

    // Increment user's report count
    await updateDoc(doc(db, 'users', user.uid), {
      reportsCount: increment(1),
      lastActive: serverTimestamp()
    });

    return {
      success: true,
      data: { reportId: reportRef.id },
      message: 'Report submitted successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch public feed reports (verified only)
 */
export const fetchFeedReports = async (
  limitCount: number = 20,
  lastDocument?: QueryDocumentSnapshot<DocumentData>
): Promise<PaginatedResponse<Report>> => {
  try {
    let q = query(
      collection(db, 'reports'),
      where('status', '==', 'verified'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastDocument) {
      q = query(q, startAfter(lastDocument));
    }

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return {
      items: reports,
      hasMore: querySnapshot.docs.length === limitCount,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error: any) {
    console.error('Error fetching feed reports:', error);
    return { items: [], hasMore: false };
  }
};

/**
 * Fetch user's own reports
 */
export const fetchMyReports = async (
  limitCount: number = 50
): Promise<ApiResponse<Report[]>> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const q = query(
      collection(db, 'reports'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return {
      success: true,
      data: reports
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch a single report by ID
 */
export const fetchReportById = async (reportId: string): Promise<ApiResponse<Report>> => {
  try {
    const reportDoc = await getDoc(doc(db, 'reports', reportId));

    if (!reportDoc.exists()) {
      return { success: false, error: 'Report not found' };
    }

    const report = { id: reportDoc.id, ...reportDoc.data() } as Report;

    return {
      success: true,
      data: report
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user's own pending report
 */
export const updateMyReport = async (
  reportId: string,
  updates: UpdateReportData
): Promise<ApiResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch report to verify ownership and status
    const reportDoc = await getDoc(doc(db, 'reports', reportId));
    if (!reportDoc.exists()) {
      return { success: false, error: 'Report not found' };
    }

    const report = reportDoc.data() as Report;

    if (report.authorId !== user.uid) {
      return { success: false, error: 'You can only edit your own reports' };
    }

    if (report.status !== 'pending') {
      return { success: false, error: 'Only pending reports can be edited' };
    }

    // Update report
    await updateDoc(doc(db, 'reports', reportId), {
      ...updates,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: 'Report updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete user's own pending report
 */
export const deleteMyReport = async (reportId: string): Promise<ApiResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Fetch report to verify ownership and status
    const reportDoc = await getDoc(doc(db, 'reports', reportId));
    if (!reportDoc.exists()) {
      return { success: false, error: 'Report not found' };
    }

    const report = reportDoc.data() as Report;

    if (report.authorId !== user.uid) {
      return { success: false, error: 'You can only delete your own reports' };
    }

    if (report.status !== 'pending') {
      return { success: false, error: 'Only pending reports can be deleted' };
    }

    // Delete report
    await deleteDoc(doc(db, 'reports', reportId));

    // Decrement user's report count
    await updateDoc(doc(db, 'users', user.uid), {
      reportsCount: increment(-1)
    });

    return {
      success: true,
      message: 'Report deleted successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Increment report view count
 */
export const incrementViewCount = async (reportId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'reports', reportId), {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
};

// ============================================================================
// MODERATION FUNCTIONS (Requires moderator role)
// ============================================================================

/**
 * Fetch pending reports (moderators only)
 */
export const fetchPendingReports = async (
  limitCount: number = 50
): Promise<ApiResponse<Report[]>> => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'asc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return {
      success: true,
      data: reports
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update report status (moderators only)
 */
export const updateReportStatus = async (
  reportId: string,
  newStatus: ReportStatus,
  moderatorNotes?: string
): Promise<ApiResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const updateData: any = {
      status: newStatus,
      moderatorId: user.uid,
      updatedAt: serverTimestamp()
    };

    // If status is verified, make it public
    if (newStatus === 'verified') {
      updateData.visibility = 'public';
      updateData.verifiedAt = serverTimestamp();
    }

    if (moderatorNotes) {
      updateData.moderatorNotes = moderatorNotes;
    }

    await updateDoc(doc(db, 'reports', reportId), updateData);

    // Create audit log entry
    await createAuditLog({
      action: 'status_change',
      resourceType: 'report',
      resourceId: reportId,
      moderatorId: user.uid,
      details: {
        newStatus,
        notes: moderatorNotes
      }
    });

    return {
      success: true,
      message: 'Report status updated successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create audit log entry
 */
const createAuditLog = async (logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const logRef = doc(collection(db, 'auditLog'));
    await setDoc(logRef, {
      ...logData,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

// ============================================================================
// VOTING FUNCTIONS
// ============================================================================

/**
 * Upvote a report
 */
export const upvoteReport = async (reportId: string): Promise<ApiResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const voteId = `${user.uid}_${reportId}`;
    const voteRef = doc(db, 'reportVotes', voteId);

    // Check if already voted
    const voteDoc = await getDoc(voteRef);
    if (voteDoc.exists()) {
      return { success: false, error: 'You have already voted on this report' };
    }

    // Create vote document
    await setDoc(voteRef, {
      userId: user.uid,
      reportId: reportId,
      voteType: 'upvote',
      createdAt: serverTimestamp()
    });

    // Increment report upvotes
    await updateDoc(doc(db, 'reports', reportId), {
      upvotes: increment(1)
    });

    return {
      success: true,
      message: 'Report upvoted successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Remove upvote from a report
 */
export const removeUpvote = async (reportId: string): Promise<ApiResponse> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const voteId = `${user.uid}_${reportId}`;

    // Delete vote document
    await deleteDoc(doc(db, 'reportVotes', voteId));

    // Decrement report upvotes
    await updateDoc(doc(db, 'reports', reportId), {
      upvotes: increment(-1)
    });

    return {
      success: true,
      message: 'Upvote removed successfully'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Check if user has voted on a report
 */
export const hasUserVoted = async (reportId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const voteId = `${user.uid}_${reportId}`;
    const voteDoc = await getDoc(doc(db, 'reportVotes', voteId));

    return voteDoc.exists();
  } catch (error) {
    return false;
  }
};

// ============================================================================
// RESOURCE FUNCTIONS
// ============================================================================

/**
 * Fetch published resources
 */
export const fetchResources = async (
  category?: ResourceCategory
): Promise<ApiResponse<Resource[]>> => {
  try {
    let q = query(
      collection(db, 'resources'),
      where('isPublished', '==', true),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );

    if (category) {
      q = query(
        collection(db, 'resources'),
        where('category', '==', category),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const resources: Resource[] = [];

    querySnapshot.forEach((doc) => {
      resources.push({ id: doc.id, ...doc.data() } as Resource);
    });

    return {
      success: true,
      data: resources
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Increment resource view count
 */
export const incrementResourceViewCount = async (resourceId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'resources', resourceId), {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing resource view count:', error);
  }
};

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // Auth
  signInAnonymously,
  signInWithEmail,
  createAccount,
  signOut,
  getCurrentUser,
  onAuthStateChange,

  // Reports
  submitReport,
  fetchFeedReports,
  fetchMyReports,
  fetchReportById,
  updateMyReport,
  deleteMyReport,
  incrementViewCount,

  // Moderation
  fetchPendingReports,
  updateReportStatus,

  // Voting
  upvoteReport,
  removeUpvote,
  hasUserVoted,

  // Resources
  fetchResources,
  incrementResourceViewCount
};
