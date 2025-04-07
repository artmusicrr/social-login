import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

interface AuthProviders {
  google: any;
  facebook: any;
  github: any;
}

interface AuthHook {
  user: AuthUser | null;
  error: string;
  loading: boolean;
  initialized: boolean;
  handleSocialLogin: (provider: any) => Promise<void>;
  handleLogout: () => Promise<void>;
  providers: AuthProviders;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    error,
    loading,
    handleSocialLogin,
    handleLogout,
    providers,
    initialized,
  } = useAuth();

  React.useEffect(() => {
    if (initialized && user) {
      navigate("/protegida");
    }
  }, [user, navigate, initialized]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        {user ? (
          <div className="text-center">
            <div className="mb-4">
              <img
                src={user.photoURL || "/default-avatar.png"}
                alt={user.displayName || "Usuário"}
                className="h-24 w-24 rounded-full mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo, {user.displayName}!
            </h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sair
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
              Faça login na sua conta
            </h2>
            <div className="space-y-4">
              <button
                onClick={() => handleSocialLogin(providers.google)}
                disabled={loading}
                className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
              >
                {loading ? "Carregando..." : "Entrar com Google"}
              </button>

              <button
                onClick={() => handleSocialLogin(providers.github)}
                disabled={loading}
                className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}
              >
                {loading ? "Carregando..." : "Entrar com GitHub"}
              </button>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-600 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
};

export default Login;
