// src/server/bootstrap/firebase.ts
// Initialises the Firebase client SDK, the Admin SDK, and the Firestore
// database connection.  Also installs a lightweight console filter to
// suppress repetitive, benign Firebase internal log noise.

import path from "path";
import fs from "fs";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import {
  initializeApp,
  getApps,
  getApp,
} from "firebase/app";
import {
  getFirestore,
  initializeFirestore,
  getDocFromServer,
  doc,
  setLogLevel,
} from "firebase/firestore";

export interface FirebaseBootstrapResult {
  db: any;
  adminDb: any;
}

/**
 * Initialises Firebase (client + admin) and returns database handles.
 * Returns `{ db: null, adminDb: null }` when the config file is absent.
 */
export async function initFirebase(): Promise<FirebaseBootstrapResult> {
  const firebaseConfigPath = path.join(
    process.cwd(),
    "firebase-applet-config.json"
  );
  let db: any = null;
  let adminDb: any = null;

  if (!fs.existsSync(firebaseConfigPath)) {
    return { db, adminDb };
  }

  try {
    const firebaseConfig = JSON.parse(
      fs.readFileSync(firebaseConfigPath, "utf-8")
    );
    const app =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    // --- Admin SDK ---
    let adminApp: admin.app.App | undefined;
    if (admin.apps.length === 0) {
      try {
        if (firebaseConfig.projectId) {
          adminApp = admin.initializeApp({
            projectId: firebaseConfig.projectId,
          });
          console.log(
            `[VEDA_ADMIN] Admin SDK initialized with explicit projectId: ${firebaseConfig.projectId}`
          );
        } else {
          adminApp = admin.initializeApp();
          console.log(
            "[VEDA_ADMIN] Admin SDK initialized via Default Credentials."
          );
        }
      } catch (e) {
        console.warn(
          "[VEDA_ADMIN_WARNING] Explicit initialization failed, using default fallback:",
          e
        );
        try {
          adminApp = admin.initializeApp();
        } catch (innerErr) {
          console.error(
            "[VEDA_ADMIN_FATAL] Admin SDK initialization failed completely:",
            innerErr
          );
        }
      }
    } else {
      adminApp = admin.app();
    }

    // Admin Firestore
    if (adminApp) {
      const requestedDbId =
        firebaseConfig.firestoreDatabaseId || "(default)";
      try {
        adminDb =
          requestedDbId !== "(default)"
            ? getAdminFirestore(adminApp, requestedDbId)
            : getAdminFirestore(adminApp);
        console.log(
          `[VEDA_ADMIN] Admin SDK linked to database: ${requestedDbId}`
        );
      } catch (e) {
        console.warn(
          `[VEDA_ADMIN_WARNING] Failed to link to ${requestedDbId}, falling back to (default).`,
          e
        );
        try {
          adminDb = getAdminFirestore(adminApp);
        } catch (innerErr) {
          console.error(
            "[VEDA_ADMIN_FATAL] Admin SDK absolute fallback failed:",
            innerErr
          );
          adminDb = null;
        }
      }
    }

    // Silence internal SDK logs early
    setLogLevel("silent");
    suppressFirebaseNoiseLogs();

    // --- Client Firestore ---
    const firestoreSettings =
      process.env.NODE_ENV === "production"
        ? {}
        : { experimentalForceLongPolling: true };
    const dbId = firebaseConfig.firestoreDatabaseId || "(default)";

    try {
      db = initializeFirestore(app, firestoreSettings, dbId);
    } catch (e: any) {
      if (
        e.code === "failed-precondition" ||
        e.message?.includes("already been called")
      ) {
        db = getFirestore(app, dbId);
      } else {
        throw e;
      }
    }

    console.log(
      `[FIREBASE] VEDA Persistent Memory Interface Online. Database: ${
        firebaseConfig.firestoreDatabaseId || "(default)"
      }`
    );

    // Non-blocking connectivity check (fire-and-forget)
    verifyFirebaseConnection(db);
  } catch (e) {
    console.error("[FIREBASE] Config Fault:", e);
  }

  return { db, adminDb };
}

/**
 * Patches console.error / console.warn to drop repetitive, benign Firebase
 * internal lifecycle messages that would otherwise flood the dev console.
 */
function suppressFirebaseNoiseLogs(): void {
  const originalError = console.error;
  const originalWarn = console.warn;

  // Broader set used for warn suppression
  const noiseSignatures = [
    "idle stream",
    "timed out waiting for new targets",
    "grpcconnection rpc",
    "listen stream",
    "code: 1",
    "cancelled",
  ];

  console.error = (...args: any[]) => {
    const msg = args.join(" ").toLowerCase();
    // Only suppress truly benign, repetitive SDK internal timeout logs
    const benignSignatures = [
      "idle stream",
      "timed out waiting for new targets",
    ];
    const isNoise =
      benignSignatures.some((sig) => msg.includes(sig)) &&
      msg.includes("firebase");
    if (isNoise) return;
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const msg = args.join(" ").toLowerCase();
    const isNoise =
      noiseSignatures.some((sig) => msg.includes(sig)) &&
      msg.includes("firebase");
    if (isNoise) return;
    originalWarn.apply(console, args);
  };
}

/**
 * Attempts a lightweight Firestore read to confirm network connectivity.
 * Degrades gracefully — the system enters hybrid/offline mode on failure.
 */
async function verifyFirebaseConnection(
  db: any,
  retries = 3
): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      // Any response (even document-not-found) confirms connectivity
      await getDocFromServer(doc(db, "test", "connection"));
      console.log("[FIREBASE] Connection verified successfully.");
      return;
    } catch (err: any) {
      if (err?.code === "permission-denied") {
        console.log(
          "[FIREBASE] Connection verified (Auth required but network is alive)."
        );
        return;
      }
      if (i === retries - 1) {
        console.warn(
          "[FIREBASE] Initial connection test failed after 3 attempts. System will operate in hybrid/offline mode."
        );
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}
