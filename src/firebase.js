import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import getAuth

const firebaseConfig = {
    apiKey: "AIzaSyBbCIoEk20bqf0nf-ACN_QVduAqSWJuVss",
    authDomain: "exam-3cc34.firebaseapp.com",
    projectId: "exam-3cc34",
    storageBucket: "exam-3cc34.appspot.com",
    messagingSenderId: "959179371240",
    appId: "1:959179371240:web:2fef40cb14bbe305f48f5d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize auth

export { db, auth };

