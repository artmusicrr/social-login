import { initializeApp, FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  Auth,
} from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCnCRWy9fOCzSzKI4DQTNX4GTATH61-UZg",
  authDomain: "first-project-login-bddd5.firebaseapp.com",
  projectId: "first-project-login-bddd5",
  storageBucket: "first-project-login-bddd5.firebasestorage.app",
  messagingSenderId: "105591447415",
  appId: "1:105591447415:web:8ef026c94071b963edcb72",
  measurementId: "G-ERH5P9FEC0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configurando os provedores de autenticação
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Configurando escopos adicionais para o Facebook
facebookProvider.addScope("email");
facebookProvider.addScope("public_profile");

// Configurando escopos adicionais para o GitHub
githubProvider.addScope("user:email");
