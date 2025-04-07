import useAuth from "../hooks/useAuth";
import { useEffect, useState } from "react";
// Removendo importação não utilizada que estava gerando warning

const Home: React.FC = () => {
  const { user, handleLogout } = useAuth();
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
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Área Protegida
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Sair"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 mt-16">
        <div className="bg-white rounded-lg shadow-md p-5">
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
                {user?.phoneNumber && (
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="text-gray-700 font-medium">
                      {user.phoneNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-base font-medium text-green-800 mb-3">
                Atividade
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Conta criada em</p>
                  <p className="text-gray-700 font-medium">
                    {creationTime || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Último login</p>
                  <p className="text-gray-700 font-medium">
                    {lastSignInTime || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Sessão atual iniciada às
                  </p>
                  <p className="text-gray-700 font-medium">{loginTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-green-600 font-medium">Ativa e segura</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
