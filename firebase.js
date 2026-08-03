// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";

// Firebase Configuration

const firebaseConfig = {

apiKey: "AIzaSyATwGdZ1jR9PkHEiL9dxngtmeeKew8VVDI",

authDomain: "globalearn-3987f.firebaseapp.com",

projectId: "globalearn-3987f",

storageBucket: "globalearn-3987f.firebasestorage.app",

messagingSenderId: "742085449332",

appId: "1:742085449332:web:d2a9fac72d5764fd312321"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

// Export Services

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);
