import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Si quieres usar Analytics en producción SPA, debes inicializarlo
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
	apiKey: "AIzaSyAK2TxzhhVglzRoosx7ml64t3pa4YLz36A",
	authDomain: "djangoexpress-69d8b.firebaseapp.com",
	projectId: "djangoexpress-69d8b",
	storageBucket: "djangoexpress-69d8b.firebasestorage.app",
	messagingSenderId: "1058452741343",
	appId: "1:1058452741343:web:c92dc1bf2f37adf200dd6a",
	measurementId: "G-VVJ4XDL9QV",
};

const app = initializeApp(firebaseConfig);

// Si quieres analytics en navegador:
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
