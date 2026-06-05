import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import Home from "./pages/home";
import Login from "./pages/Login";
import Freshbasket from "./pages/freshbasket";
import Register from './pages/register';
import Profile from "./pages/profile.jsx";
import ForgotPassword from './pages/ForgotPassword';

import Products from "./pages/products";
import Suppliers from "./pages/suppliers";
import Users from "./pages/users";
import Entries from "./pages/entries";
import Exits from "./pages/exits";
import Categories from "./pages/categories";
import Countries from "./pages/countries";


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
        <Toaster position="top-center" reverseOrder={false} />

        <div className="app-container">
          <nav className="menu-grid"></nav>

          <Routes>
            {/* Rutas públicas, cualquier persona puede ingresar */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
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
              <Route path="entradas" element={<Entries />} />
              <Route path="salidas" element={<Exits />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="paises" element={<Countries />} />


              <Route
                  path="my-profile"
                  element={
                    <Profile
                        loggedInUser={{
                          id: localStorage.getItem("userId"),
                          name: localStorage.getItem("userName"),
                          lastName: localStorage.getItem("userLastName") || "",
                          email: localStorage.getItem("userEmail") || "",
                          role: localStorage.getItem("userRole") || "",
                          countryName: localStorage.getItem("userCountry") || ""
                        }}
                    />
                  }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
  );
}

export default App;