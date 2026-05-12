import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWCv3nTwwxYd3QHnHefgthXo2kPlGNNvw",
  authDomain: "traveler-map-c681a.firebaseapp.com",
  projectId: "traveler-map-c681a",
  storageBucket: "traveler-map-c681a.firebasestorage.app",
  messagingSenderId: "621146976694",
  appId: "1:621146976694:web:c53d99a6f25426fa95d117",
  measurementId: "G-YWH5JX1LCQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
