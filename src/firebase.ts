import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIUsihtQFrrF2C30Zc9N0Hwd1kgfCJh7Q",
  authDomain: "yeonhee-leave.firebaseapp.com",
  projectId: "yeonhee-leave",
  storageBucket: "yeonhee-leave.firebasestorage.app",
  messagingSenderId: "425020057261",
  appId: "1:425020057261:web:9bd35fc999f000895e0824"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
