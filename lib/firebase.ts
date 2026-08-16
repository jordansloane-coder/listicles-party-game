// Online play is entirely optional — solo/pass-the-phone mode never touches
// this file. Everything here is lazy so a build or a visit with no Firebase
// project configured yet never throws; isFirebaseConfigured() is what the UI
// checks before offering the "play online" entry point at all.
import { type FirebaseApp, initializeApp, getApps } from 'firebase/app';
import { type Auth, getAuth, signInAnonymously } from 'firebase/auth';
import { type Database, getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured — set the NEXT_PUBLIC_FIREBASE_* env vars.');
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseDb(): Database {
  if (!db) db = getDatabase(getFirebaseApp());
  return db;
}

// Anonymous auth gives each device a stable uid for the session — no
// login UI, no password, just enough identity for the database rules to
// tell "this device owns this player slot" apart from everyone else.
export async function ensureSignedIn(): Promise<string> {
  if (!auth) auth = getAuth(getFirebaseApp());
  if (auth.currentUser) return auth.currentUser.uid;
  const result = await signInAnonymously(auth);
  return result.user.uid;
}
