import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  signOut,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app = null;
let auth = null;
let googleProvider = null;
let firebaseInitialized = false;

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredEnvVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Firebase not fully configured. Missing: ${missingVars.join(", ")}`
    );
    return false;
  }

  // Check if API key is valid (not empty)
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "") {
    console.warn("Firebase API key is empty or invalid");
    return false;
  }

  return true;
};

// Initialize Firebase if properly configured
try {
  if (isFirebaseConfigured()) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Configure Google provider
    googleProvider.setCustomParameters({
      hd: "student.laverdad.edu.ph", // Restrict to school domain
      prompt: "select_account",
    });

    // Check for redirect result on page load
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result) {
            console.log("Redirect sign-in successful");
            // Dispatch an event that can be caught by the auth context
            window.dispatchEvent(
              new CustomEvent("auth:redirect-result", {
                detail: { user: result.user },
              })
            );
          }
        })
        .catch((error) => {
          console.error("Redirect sign-in error:", error);
          if (error.code === "auth/account-exists-with-different-credential") {
            console.error("Email already in use with different provider");
          }
        });
    }

    firebaseInitialized = true;
    console.log("Firebase initialized successfully");
  } else {
    console.warn(
      "Firebase initialization skipped due to missing configuration"
    );
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

/**
 * Sign in with Google
 * @param {boolean} useRedirect - Whether to use redirect method instead of popup
 * @returns {Promise<Object>} User data and ID token
 */
export const signInWithGoogle = async (useRedirect = false) => {
  if (!firebaseInitialized || !auth || !googleProvider) {
    console.error("Firebase authentication not initialized");
    return {
      success: false,
      error:
        "Google sign-in is not available. Firebase is not properly configured.",
    };
  }

  try {
    let result;

    if (useRedirect) {
      // Use redirect method (more reliable on mobile or when popups are blocked)
      await signInWithRedirect(auth, googleProvider);
      // This will redirect the page, so no further code will execute here
      return { inProgress: true };
    } else {
      // Try popup first (better UX on desktop)
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (error) {
        // If popup is blocked, fall back to redirect
        if (
          error.code === "auth/popup-blocked" ||
          error.code === "auth/popup-closed-by-user"
        ) {
          console.log("Popup was blocked, falling back to redirect method");
          await signInWithRedirect(auth, googleProvider);
          return { inProgress: true };
        }
        throw error;
      }
    }

    // Verify email domain
    if (!result.user.email?.endsWith("@student.laverdad.edu.ph")) {
      await signOut(auth);
      throw new Error(
        "Only @student.laverdad.edu.ph email addresses are allowed"
      );
    }

    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

/**
 * Check for redirect result
 * @returns {Promise<Object|null>} User data and ID token or null if no redirect result
 */
export const checkRedirectResult = async () => {
  if (!firebaseInitialized || !auth) {
    console.warn("Firebase not initialized, cannot check redirect result");
    return null;
  }

  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      return null;
    }

    // Verify email domain
    if (!result.user.email?.endsWith("@student.laverdad.edu.ph")) {
      await signOut(auth);
      throw new Error(
        "Only @student.laverdad.edu.ph email addresses are allowed"
      );
    }

    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error("Redirect result error:", error);
    return { error };
  }
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const firebaseSignOut = async () => {
  if (!firebaseInitialized || !auth) {
    console.warn("Firebase auth not initialized, skipping sign out");
    return;
  }
  try {
    await signOut(auth);
    console.log("Firebase sign out successful");
  } catch (error) {
    console.error("Firebase sign out error:", error);
    throw error;
  }
};

/**
 * Get current user's ID token
 * @returns {Promise<string|null>}
 */
export const getCurrentUserToken = async () => {
  if (!firebaseInitialized || !auth?.currentUser) {
    return null;
  }

  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error("Error getting user token:", error);
    return null;
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  if (!firebaseInitialized || !auth) {
    console.warn("Firebase auth not initialized, skipping auth state listener");
    return () => {};
  }
  return auth.onAuthStateChanged(callback);
};

export { auth, app, firebaseInitialized };
