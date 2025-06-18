// src/App.jsx
// This is your main App component, now containing all authentication logic.
import React, { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'; // All Auth functions are imported here
import { auth, db } from './firebase.js'; // This import needs firebase.js to exist
import DataDisplay from './DataDisplay.jsx'; // Updated import to .jsx extension

function App() {
  const [user, setUser] = useState(null); // Stores the current authenticated user
  const [loading, setLoading] = useState(true); // Manages loading state for initial auth check
  const [firebaseInitialized, setFirebaseInitialized] = useState(false); // Tracks if Firebase is successfully initialized

  // States for the authentication form (email/password, Google)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Sign Up views
  const [formError, setFormError] = useState(''); // Displays authentication-related errors to the user

  // Effect hook to initialize Firebase services and set up the authentication state listener.
  // This runs once when the component mounts.
  useEffect(() => {
    // Check if Firebase auth and db instances are available from firebase.js
    if (auth && db) {
      setFirebaseInitialized(true); // Mark Firebase as initialized
      console.log("Firebase services (auth, db) are initialized.");

      // Set up a listener for changes in the user's authentication state.
      // This is crucial for keeping your UI in sync with Firebase Auth.
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser); // Update the user state
        setLoading(false); // Authentication check is complete, stop loading
        if (currentUser) {
          setFormError(''); // Clear any previous authentication errors if a user logs in
        }
      });

      // Cleanup function: This is called when the component unmounts
      // to detach the authentication state listener and prevent memory leaks.
      return () => unsubscribe();
    } else {
      // If Firebase instances are not available (e.g., due to config error in firebase.js)
      console.error("Firebase services (auth, db) not available. Check src/firebase.js initialization.");
      setLoading(false); // Stop loading to allow other UI to render (e.g., error message)
      setFormError("Firebase initialization failed. Please ensure your Firebase config is correctly added in src/firebase.js.");
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Handles email/password login and signup form submission.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setFormError(''); // Clear any previous errors
    setLoading(true); // Set loading state

    // Basic validation
    if (!email || !password) {
      setFormError('Email and password cannot be empty.');
      setLoading(false);
      return;
    }

    // Ensure Firebase Auth is initialized before attempting operations
    if (!auth) {
      setFormError('Firebase Auth not initialized. Please check Firebase configuration.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Attempt to sign in with email and password
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in successfully with email/password!');
      } else {
        // Attempt to create a new user with email and password
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up successfully with email/password!');
      }
      // Clear form fields on successful operation
      setEmail('');
      setPassword('');
    } catch (error) {
      // Handle Firebase authentication errors and provide user-friendly messages
      console.error("Authentication error:", error.message);
      let errorMessage = "An unknown authentication error occurred.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address. Please check format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This user account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No user found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use. Try signing in or using a different email.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = `Authentication failed: ${error.message}`;
          break;
      }
      setFormError(errorMessage); // Display error message to the user
    } finally {
      setLoading(false); // End loading state
    }
  };

  // Handles Google Sign-in using a popup window.
  const handleGoogleSignIn = async () => {
    setFormError(''); // Clear any previous errors
    setLoading(true); // Set loading state for Google sign-in
    const provider = new GoogleAuthProvider(); // Create an instance of the Google Auth Provider

    try {
      // Initiate the Google sign-in flow via a popup window
      await signInWithPopup(auth, provider);
      console.log('User signed in successfully with Google!');
      // The onAuthStateChanged listener will automatically update the `user` state.
    } catch (error) {
      console.error('Google Sign-in error:', error.message);
      // Handle specific Google sign-in errors
      let errorMessage = "Google Sign-in failed.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google sign-in popup was closed.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Another sign-in popup was already open.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Unauthorized domain. Check Firebase project settings.';
      } else {
        errorMessage = `Google Sign-in failed: ${error.message}`;
      }
      setFormError(errorMessage); // Display error message to the user
    } finally {
      setLoading(false); // End loading state
    }
  };

  // Handles user sign out.
  const handleSignOut = async () => {
    setLoading(true); // Indicate signing out in progress
    try {
      if (auth) {
        await signOut(auth); // Sign the current user out of Firebase
        console.log('User signed out successfully!');
      } else {
        console.error('Firebase Auth not initialized. Cannot sign out.');
      }
    } catch (error) {
      console.error("Sign out error:", error.message);
      // You might want to display this error to the user in the UI
    } finally {
      setLoading(false); // Sign out process complete
    }
  };

  // Display a loading screen while Firebase is initializing or authenticating.
  if (!firebaseInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-inter">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <p className="text-gray-700 text-lg">Initializing Firebase and checking authentication status...</p>
          {/* Display initialization errors if any */}
          {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
        </div>
      </div>
    );
  }

  // Determine userId for display, providing a fallback if no user is authenticated.
  const userId = user?.uid || 'Not Authenticated';

  return (
    <div className="min-h-screen bg-gray-100 py-10 font-inter">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
        React + Firebase App
      </h1>
      <p className="text-center text-gray-600 mb-6">
        Current User ID: <span className="font-mono bg-gray-200 rounded-md px-2 py-1 text-xs">{userId}</span>
      </p>

      <div className="flex flex-col items-center justify-center space-y-8">
        {user ? (
          // Content for authenticated users: Welcome message, Sign Out button, and DataDisplay
          <div className="text-center">
            <p className="text-xl text-gray-800 mb-4">Welcome, {user.email || 'Guest User'}!</p>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Signing Out...' : 'Sign Out'}
            </button>
            {/* Render DataDisplay component after successful authentication */}
            <DataDisplay />
          </div>
        ) : (
          // Content for unauthenticated users: Email/Password and Google Sign-in form
          <div className="p-4 bg-white rounded-lg shadow-lg w-full max-w-sm mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Authentication</h2>
            {formError && <p className="text-red-500 mb-4">{formError}</p>} {/* Display form-specific errors */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password:
              </label>
              <input
                type="password"
                id="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <button
                type="submit"
                onClick={handleSubmit} // Triggers email/password login or signup
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading} // Disable button while loading
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
              <button
                type="button" // Important: type="button" to prevent form submission
                onClick={() => setIsLogin(!isLogin)} // Toggles between login and signup view
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading} // Disable button while loading
              >
                Switch to {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-3">OR</p>
              <button
                type="button" // Important: type="button" to prevent form submission
                onClick={handleGoogleSignIn} // Triggers Google sign-in
                // Removed w-full. Set a fixed width and ensured centering.
                // Added transform for a subtle hover effect that doesn't "zoom" too much.
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center w-64 mx-auto transition-all duration-300 ease-in-out hover:scale-105"
                disabled={loading} // Disable button while loading
              >
                {/* Google Icon SVG */}
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.27c0-.78-.07-1.5-.2-2.2H12v4.26h6.15c-.25 1.25-.97 2.3-2.1 3.03v2.79h3.6c2.1-1.95 3.33-4.8 3.33-8.08zm-1.88-1.74h-6.19V6.22h3.94c.14.7.21 1.44.21 2.2V10.53z" fill="#4285F4"/>
                  <path d="M12 23.99c2.72 0 5.2-1 6.93-2.69L15.34 18.5c-1.07.72-2.45 1.14-3.34 1.14-3.55 0-6.57-2.38-7.65-5.6H.75v2.79c1.55 3.03 4.8 5.11 8.87 5.11h2.38z" fill="#34A853"/>
                  <path d="M4.35 14.51c-.22-.65-.35-1.35-.35-2.07s.13-1.42.35-2.07V7.58H.75c-.56 1.12-.88 2.37-.88 3.65s.32 2.53.88 3.65l3.6 2.79v-2.79z" fill="#FBBC05"/>
                  <path d="M12 4.41c1.92 0 3.63.78 4.96 2.05L19.4 3.48c-1.73-1.66-4.21-2.69-6.4-2.69C7.8 0 4.54 2.08 3 5.11l3.6 2.79c1.07-3.22 4.09-5.6 7.65-5.6z" fill="#EA4335"/>
                </svg>
                Sign In with Google
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;