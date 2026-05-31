import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD81qS_T-EG0Dd2r83TE9lnECeDW_B4f8Y",
  authDomain: "safeword-96097.firebaseapp.com",
  projectId: "safeword-96097",
  storageBucket: "safeword-96097.firebasestorage.app",
  messagingSenderId: "42542104536",
  appId: "1:42542104536:web:cd91b6ff57b25ca0c03cad",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);