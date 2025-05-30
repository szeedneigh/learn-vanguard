import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { environment } from './environment';

// Firebase configuration
const firebaseConfig = {
  apiKey: environment.FIREBASE.apiKey,
  authDomain: environment.FIREBASE.authDomain,
  projectId: environment.FIREBASE.projectId,
  storageBucket: environment.FIREBASE.storageBucket,
  messagingSenderId: environment.FIREBASE.messagingSenderId,
  appId: environment.FIREBASE.appId,
};

// Initialize Firebase
let app;
let auth;
let googleProvider;

try {
  // Only initialize if all required config is present
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    
    // Configure Google provider
    googleProvider.setCustomParameters({
      hd: 'student.laverdad.edu.ph', // Restrict to specific domain
      prompt: 'select_account'
    });
  } else {
    console.warn('Firebase configuration incomplete. Google Sign-in will not be available.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} User data and ID token
 */
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase not properly configured');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get ID token for backend authentication
    const idToken = await user.getIdToken();
    
    // Validate email domain
    if (!user.email?.endsWith('@student.laverdad.edu.ph')) {
      await signOut(auth);
      throw new Error('Only @student.laverdad.edu.ph email addresses are allowed');
    }
    
    return {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
      idToken,
      success: true
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOutGoogle = async () => {
  if (!auth) {
    throw new Error('Firebase not properly configured');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get current user's ID token
 * @returns {Promise<string|null>}
 */
export const getCurrentUserToken = async () => {
  if (!auth?.currentUser) {
    return null;
  }
  
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  if (!auth) {
    return () => {};
  }
  
  return auth.onAuthStateChanged(callback);
};

export { auth, googleProvider };
export default app; 