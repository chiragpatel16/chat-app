import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyAEN_TyyseTZAB8DSm7SWjUQXcytkE_x8c",
  authDomain: "chat-app-f8a20.firebaseapp.com",
  projectId: "chat-app-f8a20",
  storageBucket: "chat-app-f8a20.firebasestorage.app",
  messagingSenderId: "946537710590",
  appId: "1:946537710590:web:815fe4b8c45731a67636af",
  measurementId: "G-E3HWWTXW9D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const db = getFirestore(app)