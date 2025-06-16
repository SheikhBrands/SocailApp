import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js';
// import { getStorage } from 'firebase/storage';

// Firebase configuration - Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDNZqEh19OhNdxNldzY-1HAxGUKARRLcvQ",
    authDomain: "socialapp-279e3.firebaseapp.com",
    projectId: "socialapp-279e3",
    storageBucket: "socialapp-279e3.firebasestorage.app",
    messagingSenderId: "100757093775",
    appId: "1:100757093775:web:51d1d5ae1a2937baa31ffa",
    measurementId: "G-P5QMSGWTY7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app);

export default app;