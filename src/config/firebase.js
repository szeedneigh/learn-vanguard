import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let googleProvider;

try {
  // Validate required environment variables
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  // Configure Google provider
  googleProvider.setCustomParameters({
    hd: 'student.laverdad.edu.ph', // Restrict to school domain
    prompt: 'select_account'
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} User data and ID token
 */
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase authentication not initialized');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Verify email domain
    if (!result.user.email?.endsWith('@student.laverdad.edu.ph')) {
      await signOut(auth);
      throw new Error('Only @student.laverdad.edu.ph email addresses are allowed');
    }
    
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const firebaseSignOut = async () => {
  if (!auth) {
    console.warn('Firebase auth not initialized, skipping sign out');
    return;
  }
  try {
    await signOut(auth);
    console.log('Firebase sign out successful');
  } catch (error) {
    console.error('Firebase sign out error:', error);
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
    console.warn('Firebase auth not initialized, skipping auth state listener');
    return () => {};
  }
  return auth.onAuthStateChanged(callback);
};

export { auth, app }; 