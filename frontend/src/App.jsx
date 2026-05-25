import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomeScreen from "./pages/home";
import LoginScreen from "./pages/Login";
import Freshbasket from "./pages/freshbasket";
import Register from './pages/register';
import ForgotPassword from './pages/ForgotPassword';

import Products from "./pages/products";
import Suppliers from "./pages/suppliers";
import Users from "./pages/users";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="app-container">
        <nav className="menu-grid"></nav>


        <Routes>

           {/* Rutas publicas, cualquier persona puede ingresar */}
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

           {/* Rutas privadas, el usuario tiene que loguearse */}
          <Route
            path="/freshbasket"
            element={isAuthenticated ? <Freshbasket /> : <Navigate to="/login" />}
          >
            <Route path="productos" element={<Products />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="proveedores" element={<Suppliers />} />
          </Route>


          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;