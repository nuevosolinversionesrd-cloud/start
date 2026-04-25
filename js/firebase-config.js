/* js/firebase-config.js */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMHuristbpJdUIFbGXYNSNq-DzXzoKbJw",
  authDomain: "nuevo-sol-inversiones-app.firebaseapp.com",
  projectId: "nuevo-sol-inversiones-app",
  storageBucket: "nuevo-sol-inversiones-app.firebasestorage.app",
  messagingSenderId: "468690027360",
  appId: "1:468690027360:web:160448f95e751392dc1405",
  measurementId: "G-6H1EZNKFMS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
