import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

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

const LoginPage: React.FC = () => {
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

  useEffect(() => {
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
              <h2 className="text-2xl font-bold">Você já está logado</h2>
              <p className="text-gray-600">
                Você já está autenticado como {user.displayName || user.email}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate("/protegida")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Ir para Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Login com Redes Sociais
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Escolha uma das opções abaixo para entrar
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="mt-8 flex flex-col items-center justify-center py-6">
                <Spinner size="medium" color="text-blue-600" />
                <p className="mt-3 text-sm text-gray-600">
                  Autenticando, por favor aguarde...
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <button
                  onClick={() => handleSocialLogin(providers.google)}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Entrar com Google
                </button>

                <button
                  onClick={() => handleSocialLogin(providers.github)}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Entrar com GitHub
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
