import { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
} from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setError("");
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      setError("");
      await signInWithPopup(auth, provider);
    } catch (error) {
      let errorMessage = "Ocorreu um erro durante o login.";

      switch (error.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "Login cancelado. Por favor, tente novamente.";
          break;
        case "auth/account-exists-with-different-credential":
          errorMessage = "Esta conta já existe com um provedor diferente.";
          break;
        case "auth/cancelled-popup-request":
          errorMessage =
            "Apenas uma janela de login pode estar aberta por vez.";
          break;
        case "auth/popup-blocked":
          errorMessage =
            "O popup de login foi bloqueado. Por favor, permita popups para este site.";
          break;
        default:
          errorMessage = `Erro: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
    } catch (error) {
      setError("Erro ao fazer logout. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    error,
    loading,
    handleSocialLogin,
    handleLogout,
    providers: {
      google: googleProvider,
      facebook: facebookProvider,
      github: githubProvider,
    },
  };
};

export default useAuth;
