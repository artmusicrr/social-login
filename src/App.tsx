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
import PrivateRoute from "./components/PrivateRoute";
import { AuthContextProvider } from "./contexts/AuthContext";
import "./App.css";

interface ProtectedLayoutProps {}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthContextProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/protegida"
              element={
                <PrivateRoute>
                  <ProtectedLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
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
