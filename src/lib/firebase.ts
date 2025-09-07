import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = { /* …tus keys… */ };

const app = initializeApp(firebaseConfig);

// Firestore con caché persistente (v12)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
