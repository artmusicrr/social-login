import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

const ProtectedLayout = () => {
  return (
    <div>
      <Home />
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/protegida"
            element={
              <PrivateRoute>
                <ProtectedLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Home />} />
          </Route>
          <Route path="/" element={<Navigate to="/protegida" replace />} />
          <Route path="*" element={<Navigate to="/protegida" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
