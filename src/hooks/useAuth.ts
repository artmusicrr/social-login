import { useState, useEffect } from "react";
import { auth, googleProvider, githubProvider } from "../services/firebase";
import { AuthError, onAuthStateChanged } from "firebase/auth";
import { UseAuthReturn, User, AuthProvider } from "../types/auth";
import { authService } from "../services/auth";

const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitialized(true);
      setLoading(false);
      if (user) {
        setError("");
      }
    }) || (() => {}); // Garantir que unsubscribe seja uma função válida

    return () => unsubscribe();
  }, []);

  const handleSocialLogin = async (provider: AuthProvider) => {
    try {
      setLoading(true);
      setError("");
      await authService.loginWithSocialProvider(provider);
    } catch (err) {
      const error = err as AuthError;
      setError(authService.getFormattedError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authService.logout();
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
      github: githubProvider,
    },
  };
};

export default useAuth;
