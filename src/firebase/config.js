import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "",
  authDomain: "beauty-eyes-pro.firebaseapp.com",
  projectId: "beauty-eyes-pro",
  storageBucket: "beauty-eyes-pro.firebasestorage.app",
  messagingSenderId: "547858536920",
  appId: "1:547858536920:web:2dab9832ed770ee8893aad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth = getAuth(app);
export const db = getFirestore(app);

