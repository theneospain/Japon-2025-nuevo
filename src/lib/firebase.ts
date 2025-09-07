import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCHFt7zWcO5nfUErK-tkFAOwX2UdFmKF0",
  authDomain: "japon-2025-3b4d8.firebaseapp.com",
  projectId: "japon-2025-3b4d8",
  storageBucket: "japon-2025-3b4d8.appspot.com",
  messagingSenderId: "898143664884",
  appId: "1:898143664884:web:b17b3ee7a4e64a26343ca1",
  measurementId: "G-2E09ZPHX9P",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
