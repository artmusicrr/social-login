import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";

const DashboardPage: React.FC = () => {
  const { user, handleLogout, loading } = useAuth();
  const [loginTime, setLoginTime] = useState("");
  const [creationTime, setCreationTime] = useState("");
  const [lastSignInTime, setLastSignInTime] = useState("");
  const [providerName, setProviderName] = useState("");

  useEffect(() => {
    const now = new Date();
    setLoginTime(now.toLocaleTimeString());

    if (user) {
      // Extrair informações de metadata
      if (user.metadata) {
        const createdAt = user.metadata.creationTime;
        const lastSignIn = user.metadata.lastSignInTime;

        if (createdAt) {
          setCreationTime(new Date(createdAt).toLocaleString());
        }

        if (lastSignIn) {
          setLastSignInTime(new Date(lastSignIn).toLocaleString());
        }
      }

      // Extrair informação do provedor
      if (user.providerData && user.providerData.length > 0) {
        const provider = user.providerData[0].providerId;
        switch (provider) {
          case "google.com":
            setProviderName("Google");
            break;
          case "github.com":
            setProviderName("GitHub");
            break;
          default:
            setProviderName(provider);
        }
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner size="small" className="mr-2" />
                <span>Saindo...</span>
              </>
            ) : (
              "Sair"
            )}
          </button>
        </div>
      </header>

      <main className="pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-5">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Dashboard
            </h2>

            {user && (
              <div className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Foto de perfil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-lg font-semibold">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : user.email
                          ? user.email.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {user.displayName || "Usuário"}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {providerName && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Login via {providerName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-base font-medium text-blue-800 mb-3">
                  Informações da Conta
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">ID do Usuário</p>
                    <p className="text-gray-700 font-medium break-all">
                      {user?.uid || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-700 font-medium">
                      {user?.email || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Verificado</p>
                    <p className="text-gray-700 font-medium">
                      {user?.emailVerified ? (
                        <span className="text-green-600">Sim</span>
                      ) : (
                        <span className="text-red-600">Não</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-base font-medium text-blue-800 mb-3">
                  Histórico de Login
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Conta criada em</p>
                    <p className="text-gray-700 font-medium">
                      {creationTime || "Não disponível"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Último login em</p>
                    <p className="text-gray-700 font-medium">
                      {lastSignInTime || "Não disponível"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Login atual em</p>
                    <p className="text-gray-700 font-medium">{loginTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
