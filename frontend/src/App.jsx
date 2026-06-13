import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
// Importación de TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Importación de ruta de cada entidad
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

// Creación del cliente global de Queries y silenciador de errores cuando un usuario no tiene permisos
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 1,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (error?.response?.status === 502 || error?.status === 502) {
                    return false;
                }
                return failureCount < 2;
            },
        },
    },
});

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("token")
    );

    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);
            if (!token) {
                queryClient.clear();
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Toaster position="top-center" reverseOrder={false} />

                <div className="app-container">
                    <nav className="menu-grid"></nav>

                    <Routes>

                        {/* Rutas públicas */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />

                        {/* Rutas privadas */}
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
        </QueryClientProvider>
    );
}

export default App;