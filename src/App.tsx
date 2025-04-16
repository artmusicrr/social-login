import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import YouTubeDownloader from "./pages/youtube-downloader";
import PrivateRoute from "./components/PrivateRoute";
import { AuthContextProvider } from "./contexts/AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

interface ProtectedLayoutProps {}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Outlet />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthContextProvider>
      <Router>
        <div className="App ">
          <header className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-900">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">Meu Projeto</h1>
            <ThemeToggle />
          </header>
          <Routes>
            <Route path="/login" element={<LoginPage />} />            <Route
              path="/protegida"
              element={
                <PrivateRoute>
                  <ProtectedLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="youtube" element={<YouTubeDownloader />} />
            </Route>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Navigate to="/protegida/dashboard" replace />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthContextProvider>
  );
};

export default App;
