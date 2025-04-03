import { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  facebookProvider,
  githubProvider,
} from "../firebase";
import { signInWithPopup, signOut, AuthError } from "firebase/auth";
import {
  AuthState,
  AuthProviders,
  UseAuthReturn,
  User,
  AuthProvider,
} from "../types/auth";

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setInitialized(true);
      setLoading(false);
      if (user) {
        setError("");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSocialLogin = async (provider: AuthProvider) => {
    try {
      setLoading(true);
      setError("");
      await signInWithPopup(auth, provider);
    } catch (err) {
      const error = err as AuthError;
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
          errorMessage = `Erro: ${error.message || "Erro desconhecido"}`;
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
    initialized,
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
