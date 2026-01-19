import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD_Vp2tCOYqzSYH9cfgLujjiXdEEAPaeIc',
  appId: '1:949985428005:web:f3a4b0dea1cff6394575cc',
  messagingSenderId: '949985428005',
  projectId: 'ceebee-prediction',
  authDomain: 'ceebee-prediction.firebaseapp.com',
  storageBucket: 'ceebee-prediction.firebasestorage.app',
  measurementId: 'G-1JN76ZK2P7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
