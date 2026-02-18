import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configurations
const firebaseConfig = {
  apiKey: "AIzaSyCOsyFMxS7IVkXDKzhwvDa6K21SVaYPIrk",
  authDomain: "cinnamon-soil.firebaseapp.com",
  databaseURL: "https://cinnamon-soil-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "cinnamon-soil",
  storageBucket: "cinnamon-soil.appspot.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { app, database };
