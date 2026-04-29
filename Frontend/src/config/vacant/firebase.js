import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase configuration using values from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyB91FKjjd5jzU2xU5ZG8CJkFBQk_3uuVYM",
    authDomain: "cinnamon-app-e8652.firebaseapp.com",
    projectId: "cinnamon-app-e8652",
    storageBucket: "cinnamon-app-e8652.firebasestorage.app",
    messagingSenderId: "899171933554",
    appId: "1:899171933554:android:07c980fd95401737ce11eb"
};

// Initialize Firebase
const app = getApps().find(a => a.options.projectId === firebaseConfig.projectId) ||
    (getApps().length === 0 ? initializeApp(firebaseConfig) : initializeApp(firebaseConfig, 'vacant-app'));

// Initialize Firebase Auth with Persistence
let auth;
if (getApps().length > 0) {
    auth = getAuth(app);
} else {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
