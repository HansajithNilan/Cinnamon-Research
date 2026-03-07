import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configurations
const firebaseConfig = {
  apiKey: "AIzaSyCOsyFMxS7IVkXDKzhwvDa6K21SVaYPIrk",
  authDomain: "cinnamon-soil.firebaseapp.com",
  databaseURL: "https://cinnamon-soil-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cinnamon-soil",
  storageBucket: "cinnamon-soil.appspot.com",
};

// Initialize Firebase with a unique name for this project to avoid conflict with other apps
const app = getApps().find(a => a.options.projectId === firebaseConfig.projectId) ||
  (getApps().length === 0 ? initializeApp(firebaseConfig) : initializeApp(firebaseConfig, 'soil-app'));

// Initialize Realtime Database
const database = getDatabase(app);

export { app, database };
