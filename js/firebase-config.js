// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsCIyQ6JcjFUecOJKY6MY3uzgffRSTR98",
  authDomain: "yahakeem-b9349.firebaseapp.com",
  projectId: "yahakeem-b9349",
  storageBucket: "yahakeem-b9349.firebasestorage.app",
  messagingSenderId: "533411259533",
  appId: "1:533411259533:web:2262a1c29d40882a326ec4",
  measurementId: "G-C4QJSSFP3E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
