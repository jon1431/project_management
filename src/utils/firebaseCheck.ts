import { db } from '../config/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export const checkFirebaseSetup = async (): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> => {
  try {
    // Try to read from Firestore to verify it's set up
    const testQuery = query(collection(db, 'users'), limit(1));
    await getDocs(testQuery);

    return {
      success: true,
      message: 'Firebase connected successfully'
    };
  } catch (error: any) {
    console.error('Firebase setup error:', error);

    if (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions')) {
      return {
        success: false,
        error: 'FIRESTORE_NOT_ENABLED',
        message: 'Firestore database not created. Please create it in Firebase Console.'
      };
    }

    if (error.code === 'unavailable') {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Cannot connect to Firebase. Check your internet connection.'
      };
    }

    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: error.message || 'Unknown Firebase error'
    };
  }
};
