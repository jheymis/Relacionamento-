import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Note: The Google Sign-In functionality uses the following OAuth Client ID,
// which is configured in your Firebase project's console, not in this file.
// Client ID: 694035286998-7dcc9ojckqhqjfdslb7lcagmrfi8s05i.apps.googleusercontent.com

// Your Firebase configuration has been updated with the provided API key.
// For a production environment, please replace the other placeholder values with the actual credentials
// from your Firebase project console.
const firebaseConfig = {
  apiKey: "AIzaSyAoQmuEa4Gv5Oybf63FLM-SotgyDgGO8yM",
  authDomain: "aura-dating-app.firebaseapp.com",
  projectId: "aura-dating-app",
  storageBucket: "aura-dating-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services, which will be used in other parts of the app
export const auth = getAuth(app);
export const db = getFirestore(app);
