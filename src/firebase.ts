import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";

// Import the Firebase configuration
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase SDK
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific databaseId and settings
const dbId = firebaseConfig.firestoreDatabaseId || "(default)";
let db;

try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId);
} catch (e: any) {
  if (e.code === 'failed-precondition' || e.message?.includes('already been called')) {
    db = getFirestore(app, dbId);
  } else {
    throw e;
  }
}

export { db };
export const auth = getAuth();
