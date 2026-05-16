import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import HomeScreen from "./pages/home";
import LoginScreen from "./pages/Login";
import UsersScreen from "./pages/UsersScreen";
import Register from './pages/register';
import ForgotPassword from './pages/ForgotPassword'; 


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") // si hay token, está logueado
  );

  return (
    <Router>
      <div className="app-container">
        {/* Menú de navegación */}
        <nav className="menu-grid">
        </nav>

        {/* Definición de rutas */}
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register />} />
          
          {/* --- RUTA QUE FALTABA --- */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {isAuthenticated && <Route path="/users" element={<UsersScreen />} />}
        </Routes>
      </div>
    </Router>
  );
}

export default App;