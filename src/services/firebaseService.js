/**
 * Firebase Service for Voice Unheard App
 * Backend Integration Specialist Implementation
 *
 * This service provides secure backend integration with Firebase
 * Emphasizing data privacy and SDG 16 compliance
 */

import {
  getAuth,
  signInAnonymously as firebaseSignInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';

// Initialize Firebase (configuration should be in separate config file)
// import { firebaseApp } from '../config/firebase';

// Note: You'll need to create firebase.js config file with your Firebase credentials
// For now, we'll use getAuth() and getFirestore() without arguments
// which assumes Firebase has been initialized elsewhere

const auth = getAuth();
const db = getFirestore();


// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sign in anonymously
 * Allows users to report without creating an account (privacy-first)
 * @returns {Promise<Object>} User credential object
 */
export const signInAnonymously = async () => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    const user = userCredential.user;

    // Create user document in Firestore if it doesn't exist
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: null,
        displayName: null,
        isAnonymous: true,
        role: 'user',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        reportsCount: 0
      });
    } else {
      // Update last active timestamp
      await updateDoc(userDocRef, {
        lastActive: serverTimestamp()
      });
    }

    return {
      success: true,
      user: {
        uid: user.uid,
        isAnonymous: user.isAnonymous
      }
    };
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential object
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last active
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      lastActive: serverTimestamp()
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        isAnonymous: false
      }
    };
  } catch (error) {
    console.error('Error signing in with email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Create account with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - Optional display name
 * @returns {Promise<Object>} User credential object
 */
export const createAccount = async (email, password, displayName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document
    await addDoc(collection(db, 'users'), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      isAnonymous: false,
      role: 'user',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp(),
      reportsCount: 0
    });

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        isAnonymous: false
      }
    };
  } catch (error) {
    console.error('Error creating account:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Sign out current user
 * @returns {Promise<Object>} Success status
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function to handle auth state
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current authenticated user
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};


// ============================================================================
// REPORT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Submit a new report
 * @param {Object} reportData - Report data
 * @param {string} reportData.title - Report title
 * @param {string} reportData.description - Report description
 * @param {string} reportData.category - Report category
 * @param {string} reportData.location - Optional location
 * @param {boolean} reportData.isAnonymous - Whether report is anonymous
 * @param {Array<string>} reportData.mediaUrls - Optional media URLs
 * @param {Array<string>} reportData.tags - Optional tags
 * @returns {Promise<Object>} Created report ID and success status
 */
export const submitReport = async (reportData) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated to submit a report');
    }

    // Validate required fields
    if (!reportData.title || !reportData.description || !reportData.category) {
      throw new Error('Title, description, and category are required');
    }

    // Validate string lengths
    if (reportData.title.length < 5 || reportData.title.length > 200) {
      throw new Error('Title must be between 5 and 200 characters');
    }

    if (reportData.description.length < 20 || reportData.description.length > 5000) {
      throw new Error('Description must be between 20 and 5000 characters');
    }

    // Validate category
    const validCategories = ['corruption', 'abuse', 'discrimination', 'violence', 'other'];
    if (!validCategories.includes(reportData.category)) {
      throw new Error('Invalid category');
    }

    // Prepare report document
    const report = {
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      location: reportData.location || '',
      locationCoords: reportData.locationCoords || null,
      authorId: user.uid,
      isAnonymous: reportData.isAnonymous !== undefined ? reportData.isAnonymous : true,
      status: 'pending',
      visibility: 'private',
      upvotes: 0,
      viewCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      mediaUrls: reportData.mediaUrls || [],
      tags: reportData.tags || []
    };

    // Add report to Firestore
    const docRef = await addDoc(collection(db, 'reports'), report);

    // Increment user's report count
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      reportsCount: increment(1)
    });

    return {
      success: true,
      reportId: docRef.id,
      message: 'Report submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting report:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fetch feed reports (only verified and public)
 * This is what regular users see in the public feed
 * @param {number} limitCount - Number of reports to fetch (default: 20)
 * @returns {Promise<Object>} Array of reports
 */
export const fetchFeedReports = async (limitCount = 20) => {
  try {
    const reportsRef = collection(db, 'reports');

    // Query only verified reports with public visibility
    const q = query(
      reportsRef,
      where('status', '==', 'verified'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        // Privacy: Hide authorId for anonymous reports
        authorId: data.isAnonymous ? null : data.authorId,
        // Convert Firestore timestamps to JavaScript Date
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        verifiedAt: data.verifiedAt?.toDate()
      });
    });

    return {
      success: true,
      reports
    };
  } catch (error) {
    console.error('Error fetching feed reports:', error);
    return {
      success: false,
      error: error.message,
      reports: []
    };
  }
};

/**
 * Fetch user's own reports
 * @param {number} limitCount - Number of reports to fetch
 * @returns {Promise<Object>} Array of user's reports
 */
export const fetchMyReports = async (limitCount = 50) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const reportsRef = collection(db, 'reports');

    const q = query(
      reportsRef,
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        verifiedAt: data.verifiedAt?.toDate()
      });
    });

    return {
      success: true,
      reports
    };
  } catch (error) {
    console.error('Error fetching my reports:', error);
    return {
      success: false,
      error: error.message,
      reports: []
    };
  }
};

/**
 * Fetch pending reports (MODERATOR ONLY)
 * Used in moderation dashboard
 * @param {number} limitCount - Number of reports to fetch
 * @returns {Promise<Object>} Array of pending reports
 */
export const fetchPendingReports = async (limitCount = 50) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Note: In production, verify user has moderator role via custom claims
    // This is a client-side check, but Firestore rules will enforce server-side

    const reportsRef = collection(db, 'reports');

    const q = query(
      reportsRef,
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);

    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });

    return {
      success: true,
      reports
    };
  } catch (error) {
    console.error('Error fetching pending reports:', error);

    // Check if error is permission denied
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'You do not have permission to view pending reports. Moderator role required.',
        reports: []
      };
    }

    return {
      success: false,
      error: error.message,
      reports: []
    };
  }
};

/**
 * Update report status (MODERATOR ONLY)
 * @param {string} reportId - Report ID
 * @param {string} newStatus - New status ('under_review', 'verified', 'rejected', 'resolved')
 * @param {string} moderatorNotes - Optional notes from moderator
 * @returns {Promise<Object>} Success status
 */
export const updateReportStatus = async (reportId, newStatus, moderatorNotes = '') => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const validStatuses = ['under_review', 'verified', 'rejected', 'resolved'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    const reportRef = doc(db, 'reports', reportId);

    const updateData = {
      status: newStatus,
      moderatorId: user.uid,
      updatedAt: serverTimestamp()
    };

    // If status is 'verified', set visibility to 'public' and set verifiedAt
    if (newStatus === 'verified') {
      updateData.visibility = 'public';
      updateData.verifiedAt = serverTimestamp();
    }

    // Add moderator notes if provided
    if (moderatorNotes) {
      updateData.moderatorNotes = moderatorNotes;
    }

    await updateDoc(reportRef, updateData);

    // Create audit log entry
    await addDoc(collection(db, 'auditLog'), {
      action: 'status_change',
      resourceType: 'report',
      resourceId: reportId,
      moderatorId: user.uid,
      details: {
        newStatus: newStatus,
        notes: moderatorNotes
      },
      timestamp: serverTimestamp()
    });

    return {
      success: true,
      message: 'Report status updated successfully'
    };
  } catch (error) {
    console.error('Error updating report status:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'You do not have permission to update report status. Moderator role required.'
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update user's own pending report
 * @param {string} reportId - Report ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Success status
 */
export const updateMyReport = async (reportId, updates) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    // Only allow updating specific fields
    const allowedFields = ['title', 'description', 'category', 'location', 'locationCoords', 'mediaUrls', 'tags'];
    const updateData = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    updateData.updatedAt = serverTimestamp();

    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, updateData);

    return {
      success: true,
      message: 'Report updated successfully'
    };
  } catch (error) {
    console.error('Error updating report:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'You can only update your own pending reports.'
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete user's own pending report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Success status
 */
export const deleteMyReport = async (reportId) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const reportRef = doc(db, 'reports', reportId);
    await deleteDoc(reportRef);

    // Decrement user's report count
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      reportsCount: increment(-1)
    });

    return {
      success: true,
      message: 'Report deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting report:', error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: 'You can only delete your own pending reports.'
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Increment report view count
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Success status
 */
export const incrementReportViews = async (reportId) => {
  try {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      viewCount: increment(1)
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


// ============================================================================
// RESOURCES MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Fetch published educational resources
 * @param {string} category - Optional category filter
 * @param {number} limitCount - Number of resources to fetch
 * @returns {Promise<Object>} Array of resources
 */
export const fetchResources = async (category = null, limitCount = 50) => {
  try {
    const resourcesRef = collection(db, 'resources');

    let q;
    if (category) {
      q = query(
        resourcesRef,
        where('isPublished', '==', true),
        where('category', '==', category),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        resourcesRef,
        where('isPublished', '==', true),
        orderBy('priority', 'desc'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);

    const resources = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      resources.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });

    return {
      success: true,
      resources
    };
  } catch (error) {
    console.error('Error fetching resources:', error);
    return {
      success: false,
      error: error.message,
      resources: []
    };
  }
};

/**
 * Increment resource view count
 * @param {string} resourceId - Resource ID
 * @returns {Promise<Object>} Success status
 */
export const incrementResourceViews = async (resourceId) => {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    await updateDoc(resourceRef, {
      viewCount: increment(1)
    });

    return { success: true };
  } catch (error) {
    console.error('Error incrementing resource view count:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


// ============================================================================
// VOTING FUNCTIONS
// ============================================================================

/**
 * Upvote a verified report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Success status
 */
export const upvoteReport = async (reportId) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated to vote');
    }

    // Check if user already voted
    const voteId = `${user.uid}_${reportId}`;
    const voteRef = doc(db, 'reportVotes', voteId);
    const voteDoc = await getDoc(voteRef);

    if (voteDoc.exists()) {
      throw new Error('You have already voted on this report');
    }

    // Create vote document
    await addDoc(collection(db, 'reportVotes'), {
      userId: user.uid,
      reportId: reportId,
      voteType: 'upvote',
      createdAt: serverTimestamp()
    });

    // Increment report upvote count
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      upvotes: increment(1)
    });

    return {
      success: true,
      message: 'Vote recorded successfully'
    };
  } catch (error) {
    console.error('Error upvoting report:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Remove upvote from a report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Success status
 */
export const removeUpvote = async (reportId) => {
  try {
    const user = getCurrentUser();

    if (!user) {
      throw new Error('User must be authenticated');
    }

    const voteId = `${user.uid}_${reportId}`;
    const voteRef = doc(db, 'reportVotes', voteId);

    await deleteDoc(voteRef);

    // Decrement report upvote count
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      upvotes: increment(-1)
    });

    return {
      success: true,
      message: 'Vote removed successfully'
    };
  } catch (error) {
    console.error('Error removing upvote:', error);
    return {
      success: false,
      error: error.message
    };
  }
};


// Export all functions
export default {
  // Auth
  signInAnonymously,
  signInWithEmail,
  createAccount,
  signOut,
  onAuthStateChange,
  getCurrentUser,

  // Reports
  submitReport,
  fetchFeedReports,
  fetchMyReports,
  fetchPendingReports,
  updateReportStatus,
  updateMyReport,
  deleteMyReport,
  incrementReportViews,

  // Resources
  fetchResources,
  incrementResourceViews,

  // Voting
  upvoteReport,
  removeUpvote
};
