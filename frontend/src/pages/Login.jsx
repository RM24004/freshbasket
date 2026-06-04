import "../styles/login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../services/axiosConfig.js";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const BACKEND_URL = "http://localhost:8080/api/auth/login";

    try {
      const response = await axios.post(BACKEND_URL, { email, password });

      if (response.data) {
        const data = response.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.email || email);
        localStorage.setItem("userRole", data.role ? data.role.toUpperCase() : "USUARIO");

        const nombreCompleto = data.name
            ? `${data.name} ${data.lastName || ""}`.trim()
            : (data.email || email);

        localStorage.setItem("userName", nombreCompleto);

        toast.success(`¡Bienvenido ${nombreCompleto}!`);
        setTimeout(() => {
          window.location.href = "/freshbasket";
        }, 1500);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 400) {
        toast.error("Credenciales inválidas. Por favor intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative p-3">
        {/* Botón inicio */}
        <div
            className="position-absolute"
            style={{ top: "10px", left: "10px", zIndex: 1000, }}
        ><a href="/"
        className="btn btn-outline-primary shadow-sm bg-light px-3 text:align"
        style={{ borderRadius: "23px" }}
          >
          <i className="bi bi-house-door me-1"></i>
         Inicio
         </a>
       </div>
       <div className="container">
        <div className="row justify-content-center">
         <div className="col-md-10 col-lg-8 col-xl-7">
          {/* Card Principal */}
           <div className="card shadow-lg border-3 overflow-hidden" style={{ borderRadius: "50px" }}>
            <div className="row g-1">
             {/* Panel gris*/}
             <div className="col-md-5 bg-light d-flex align-items-center justify-content-center p-7 text-white text-center">
             <div>
             <img src="/logo1.png" alt="logo1.png" className="img-fluid mb-3" />
            </div>
            </div>
             {/* Panel Formulario */}
               <div className="col-md-7">
                <div className="card-body p-5 p-md-5">
                <h2 className="text-center mb-4 fw-bold" style={{ color: "#116237" }}></h2>
                 <form onSubmit={handleLogin}>
                  <div className="mb-4">
                   <label className="form-label fw-semibold small">Correo electrónico</label>
                   <div className="input-group">
                  <input
                  type="email"
                  className="form-control fw-semibold small"
                 placeholder="correo@ejemplo.com"
                value={email}
               onChange={(e) => setEmail(e.target.value)}
              required
              />
             </div>
            </div>
           <div className="mb-4">
            <label className="form-label fw-semibold small">Contraseña</label>
             <div className="input-group">
              <input
               type="password"
               className="form-control fw-semibold small"
               placeholder="••••••••"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               />
              </div>
             </div>
            <div className="d-grid">
           <button
           type="submit"
           className="btn btn-primary btn-lg fw-bold py-1"
          style={{ borderRadius: "20px" }}
         disabled={loading}
         >
        {loading ? (
         <span className="spinner-border spinner-border-sm me-2"></span>
         ) : (
        "Iniciar Sesión"
         )}
        </button>
         </div>
         {/* --- ENLACE DE RECUPERAR CONTRASEÑA --- */}
          <div className="text-end mt-3 mb-2">
            <a
             href="#"
            onClick={(e) => {
              e.preventDefault();
               navigate("/forgot-password");
               }}
              className="fw-bold text-decoration-none"
               style={{ color: "#116237", fontSize: "0.85rem" }}
               >
              ¿Olvidaste tu contraseña?
              </a>
             </div>
            </form>
           <div className="text-center mt-3">
           <p className="text-muted small mb-0">
           ¿No tienes cuenta?{" "}
          <a
          href="#"
          onClick={(e) => {
         e.preventDefault();
          navigate("/register");
          }}
         className="fw-bold text-decoration-none"
          style={{ color: "#116237" }}
           >
          Regístrate aquí
          </a>
          </p>
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 </div>
 );
}

export default Login;