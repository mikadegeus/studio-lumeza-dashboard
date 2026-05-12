import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDWyFZ7rTkD_s_uPFSjmeFOypFeSD7XY4s",
  authDomain: "studio-lumeza.firebaseapp.com",
  projectId: "studio-lumeza",
  storageBucket: "studio-lumeza.firebasestorage.app",
  messagingSenderId: "921285409716",
  appId: "1:921285409716:web:6551702c9c39ccf24a90e1",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
