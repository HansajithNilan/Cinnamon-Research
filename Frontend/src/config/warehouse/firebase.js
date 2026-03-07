import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration for Warehouse module
// Derived from the provided development JSON
const firebaseConfig = {
    apiKey: "AIzaSyAUmX7onHjOXXDifgJSxrYTFqqQkYoE-vI",
    authDomain: "cinnamon-warehouse.firebaseapp.com",
    databaseURL: "https://cinnamon-warehouse-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cinnamon-warehouse",
    storageBucket: "cinnamon-warehouse.firebasestorage.app",
    messagingSenderId: "833365560954",
    appId: "1:833365560954:android:037f1974ddf6667f0c35c3"
};

// Initialize Firebase with a unique name 'warehouse-app' to prevent conflicts
// specifically if other modules (soil, vacant) are already initialized.
const app = getApps().find(a => a.options.projectId === firebaseConfig.projectId) ||
    (getApps().length === 0 ? initializeApp(firebaseConfig) : initializeApp(firebaseConfig, 'warehouse-app'));

// Initialize Firebase Auth with Persistence for React Native
let auth;
try {
    auth = getAuth(app);
} catch (e) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

// Initialize Database and Firestore services
const database = getDatabase(app);
const db = getFirestore(app);

export { app, auth, database, db };
