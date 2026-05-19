import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

let quotaExceeded = false;
const quotaListeners: ((exceeded: boolean) => void)[] = [];

export const isFirestoreQuotaExceeded = () => quotaExceeded;
export const setFirestoreQuotaExceeded = (exceeded: boolean) => {
  quotaExceeded = exceeded;
  quotaListeners.forEach(listener => listener(exceeded));
};
export const onQuotaChange = (listener: (exceeded: boolean) => void) => {
  quotaListeners.push(listener);
  return () => {
    const index = quotaListeners.indexOf(listener);
    if (index > -1) quotaListeners.splice(index, 1);
  };
};

export const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
  console.error(`Firestore error during ${operation} at ${path}:`, error);
  if (error?.message?.includes('Quota exceeded')) {
    setFirestoreQuotaExceeded(true);
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log("Firebase connection verified.");
  } catch (error: any) {
    if (error.message && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}
