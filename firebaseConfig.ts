import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// TODO: Substitua pelos dados do seu projeto no Firebase Console
// Vá em Project Settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBKa4Ko2Vo0jDypBks4O9LozErb-qn9-8",
  authDomain: "torelli-agendamentos.firebaseapp.com",
  projectId: "torelli-agendamentos",
  storageBucket: "torelli-agendamentos.firebasestorage.app",
  messagingSenderId: "949374332528",
  appId: "1:949374332528:web:ef7fb639e6503e0feaceb5",
  measurementId: "G-C9EKGCN6Z3"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();