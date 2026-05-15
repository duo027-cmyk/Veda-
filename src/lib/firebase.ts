import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { 
  initializeFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocFromServer, 
  FirestoreError, 
  terminate, 
  disableNetwork, 
  setLogLevel 
} from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Silence internal SDK logs early
setLogLevel('silent');

// Global Log Filter: Suppress benign Firebase SDK internal lifecycle "errors"
const originalError = console.error;
const originalWarn = console.warn;
const noiseSignatures = [
  'idle stream',
  'timed out waiting for new targets',
  'grpcconnection rpc',
  'listen stream',
  'code: 1',
  'cancelled'
];

console.error = (...args: any[]) => {
  const msg = args.join(' ').toLowerCase();
  if (noiseSignatures.some(sig => msg.includes(sig)) && msg.includes('firebase')) return;
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  const msg = args.join(' ').toLowerCase();
  if (noiseSignatures.some(sig => msg.includes(sig)) && msg.includes('firebase')) return;
  originalWarn.apply(console, args);
};

// Use Long Polling to avoid 'Listen stream' timeout errors in sandboxed environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

// Firestore Quota Circuit Breaker
let _isQuotaExceeded = false;
const quotaListeners: ((exceeded: boolean) => void)[] = [];

export const isFirestoreQuotaExceeded = () => _isQuotaExceeded;
export const setFirestoreQuotaExceeded = (exceeded: boolean) => {
  if (_isQuotaExceeded !== exceeded) {
    _isQuotaExceeded = exceeded;
    if (exceeded) {
      console.warn("[VEDA_FIRESTORE] Global Circuit Breaker: Quota Exceeded. Disabling Firestore and terminating SDK.");
      // Disable network first to stop active requests
      disableNetwork(db).catch(err => console.error("[VEDA_FIRESTORE] Failed to disable network:", err));
      // Terminate Firestore to stop background retries and save resources
      terminate(db).catch(err => console.error("[VEDA_FIRESTORE] Failed to terminate:", err));
    }
    quotaListeners.forEach(l => l(exceeded));
  }
};
export const onQuotaChange = (listener: (exceeded: boolean) => void) => {
  quotaListeners.push(listener);
  return () => {
    const idx = quotaListeners.indexOf(listener);
    if (idx > -1) quotaListeners.splice(idx, 1);
  };
};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const err = error as any;
  if (err?.code === 'resource-exhausted') {
    setFirestoreQuotaExceeded(true);
  }

  // Filter out noise: Idle stream cancellations are normal in this environment
  const errStr = String(error).toLowerCase();
  const errMsg = (err?.message || '').toLowerCase();
  
  const isIdleCancel = 
    err?.code === 'cancelled' || 
    err?.code === 1 ||
    err?.code === 'unavailable' ||
    errMsg.includes('cancelled') ||
    errMsg.includes('disconnecting idle stream') || 
    errMsg.includes('timed out waiting for new targets') ||
    errMsg.includes('grpcconnection rpc') ||
    errMsg.includes('listen stream') ||
    errStr.includes('cancelled') ||
    errStr.includes('code: 1') ||
    errStr.includes('idle stream');

  if (isIdleCancel) {
    // Silent maintenance - No logs unless strictly necessary for debugging
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Test with retry mechanism
export async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("[VEDA_FIRESTORE] Connection verified.");
      return;
    } catch (error: any) {
      if (error?.code === 'resource-exhausted') {
        setFirestoreQuotaExceeded(true);
        return;
      } else if (error?.code === 'permission-denied') {
         // Normal for unauthenticated test if rules are strict
         console.log("[VEDA_FIRESTORE] Auth required for test, connection likely OK.");
         return;
      }
      
      if (i === retries - 1) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        } else {
          console.warn("[VEDA_FIRESTORE] Connection test failed after retries:", error?.message || error);
        }
      } else {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

testConnection();
