import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence  } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAboBq_ZV4MEPbzrPGqvejSQ53QZHRlGA0",
  authDomain: "liguorisrl-38c83.firebaseapp.com",
  projectId: "liguorisrl-38c83",
  storageBucket: "liguorisrl-38c83.firebasestorage.app",
  messagingSenderId: "510918580607",
  appId: "1:510918580607:web:f688375f1fa121606a224a"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app)
export const providerGoogle = new GoogleAuthProvider();

// Persistenza
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("⚠️ Persistenza non attivata: più tab aperte.");
    } else if (err.code === "unimplemented") {
      console.warn("⚠️ Persistenza non supportata su questo browser.");
    }
  });

export function signup(email, password) {
    return  createUserWithEmailAndPassword(auth, email, password);
  }
  
  export function login(email, password) {
    return  signInWithEmailAndPassword(auth, email, password);
  }
  
  export function forgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }