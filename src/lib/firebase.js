import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: "reactchatapp-f1653.firebaseapp.com",
    projectId: "reactchatapp-f1653",
    storageBucket: "reactchatapp-f1653.appspot.com",
    messagingSenderId: "224512433270",
    appId: "1:224512433270:web:466a4ef30d34f31dec9357"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(); 
export const db = getFirestore();
export const storage = getStorage();