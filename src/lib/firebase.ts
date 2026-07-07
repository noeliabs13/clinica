import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "noeliabs");

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/calendar");
googleProvider.addScope("https://www.googleapis.com/auth/calendar.events");

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = () => cachedAccessToken;
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
