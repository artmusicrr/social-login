import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import ThemeToggle from "../components/ThemeToggle";

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
  const navigate = useNavigate();  const {
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
  
  // Adiciona a classe no-scroll ao body quando o componente de login é montado
  useEffect(() => {
    document.body.classList.add('no-scroll');
    
    // Remove a classe quando o componente é desmontado
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);return (
    <div className="h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">Login</h1>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex items-center justify-center h-full">
        <div className="max-w-md w-full mx-auto space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg mt-[-40px]">
          {user ? (
            <div className="text-center">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Você já está logado</h2>
                <p className="text-gray-600 dark:text-gray-400">
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
          ) : (            <>
              <div className="text-center" >
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-200">
                  Login com Redes Sociais
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Escolha uma das opções abaixo para entrar
                </p>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mt-4">
                  {error}
                </div>
              )}              {loading ? (
                <div className="mt-8 flex flex-col items-center justify-center py-6">
                  <Spinner size="medium" color="text-blue-600 dark:text-blue-400" />
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Autenticando, por favor aguarde...
                  </p>
                </div>
              ) : (                <div className="mt-8 space-y-4">
                  <button
                    onClick={() => handleSocialLogin(providers.google)}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Entrar com Google
                  </button>

                  <button
                    onClick={() => handleSocialLogin(providers.github)}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Entrar com GitHub
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
