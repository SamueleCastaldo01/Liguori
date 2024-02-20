import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHQ-ddvKW_dqukH0lRsmAssOqb5EeCIGo",
  authDomain: "liguorisrl-686ef.firebaseapp.com",
  projectId: "liguorisrl-686ef",
  storageBucket: "liguorisrl-686ef.appspot.com",
  messagingSenderId: "1096732542750",
  appId: "1:1096732542750:web:3109613f063279fa1c2b0f"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app)
export const providerGoogle = new GoogleAuthProvider();

export function signup(email, password) {
    return  createUserWithEmailAndPassword(auth, email, password);
  }
  
  export function login(email, password) {
    return  signInWithEmailAndPassword(auth, email, password);
  }
  
  export function forgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }