import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
let firestoreDb: Firestore;
try {
  if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
    firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    firestoreDb = getFirestore(app);
  }
} catch (err) {
  console.warn('Firestore database ID init fallback to default:', err);
  firestoreDb = getFirestore(app);
}

// Initialize Auth
const firebaseAuth = getAuth(app);

// Helper to ensure authenticated state for security rules
export async function ensureFirebaseAuth() {
  try {
    if (!firebaseAuth.currentUser) {
      await signInAnonymously(firebaseAuth);
    }
    return firebaseAuth.currentUser;
  } catch (error) {
    console.warn('Anonymous auth note (proceeding):', error);
    return null;
  }
}

export { app, firestoreDb as db, firebaseAuth as auth };
