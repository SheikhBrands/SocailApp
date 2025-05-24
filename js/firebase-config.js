// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Cloudinary configuration
const cloudinaryConfig = {
  cloudName: 'YOUR_CLOUD_NAME',
  uploadPreset: 'YOUR_UPLOAD_PRESET'
};