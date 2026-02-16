// c:\Users\SHAHID HUSSAIN\Desktop\cebee-admin-panel\src\config\firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD_Vp2tCOYqzSYH9cfgLujjiXdEEAPaeIc",
    authDomain: "ceebee-prediction.firebaseapp.com",
    projectId: "ceebee-prediction",
    storageBucket: "ceebee-prediction.firebasestorage.app",
    messagingSenderId: "949985428005",
    appId: "1:949985428005:web:f3a4b0dea1cff6394575cc",
    measurementId: "G-1JN76ZK2P7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;