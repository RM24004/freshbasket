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
                localStorage.setItem("userRole", data.role ? data.role.toUpperCase() : "CLIENTE");

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
            if (error.response) {
                const status = error.response.status;

                if (status === 401 || status === 400 || status === 403) {
                    toast.error("Correo electrónico o contraseña incorrectos. Por favor intenta de nuevo.");
                } else {
                    toast.error("Ocurrió un error en el servidor. Intenta más tarde.");
                }
            } else {
                toast.error("No se pudo conectar con el servidor.");
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
              style={{ top: "15px", left: "15px", zIndex: 1000 }}
          >
              <a
                  href="/"
                  className="btn btn-outline-primary shadow-sm px-3 d-flex align-items-center"
                  style={{ borderRadius: "10px" }}
              >
                  <i className="bi bi-house-door me-2"></i>
                  Inicio
              </a>
          </div>
            <div className="container">
             <div className="row justify-content-center">
              <div className="col-md-10 col-lg-8 col-xl-7">
                {/* Card Principal */}
                 <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: "30px" }}>
                   <div className="row g-0">
                     {/* PANEL IZQUIERDO (Gris / Logo) */}
                       <div className="col-md-5 bg-light d-flex align-items-center justify-content-center p-4 text-center">
                         <div>
                          <img src="/logo1.png" alt="FreshBasket Logo" className="img-fluid" style={{ maxHeight: "150px" }} />
                            </div>
                            </div>
                            {/* PANEL DERECHO (Formulario) */}
                            <div className="col-md-7 bg-white">
                            <div className="card-body p-4 p-md-5">
                            <h2 className="text-center mb-4 fw-bold" style={{ color: "#116237" }}>
                           Iniciar Sesión
                           </h2>
                          <form onSubmit={handleLogin}>
                          {/* Campo Correo */}
                         <div className="custom-input-group mb-3">
                        <label htmlFor="email">Correo electrónico</label>
                        <input
                        id="email"
                        type="email"
                        className="form-control"
                        placeholder="correo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                      </div>
                      {/* Campo Contraseña */}
                      <div className="custom-input-group mb-3">
                     <label htmlFor="password">Contraseña</label>
                    <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    />
                   </div>
                    {/* Enlace de recuperar contraseña */}
                    <div className="text-end mb-4">
                   <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        navigate("/forgot-password");
                    }}
                    className="fw-bold text-decoration-none small"
                    style={{ color: "#116237" }}
                   >
                       ¿Olvidaste tu contraseña?
                   </a>
                    </div>
                     {/* Botón de enviar */}
                      <div className="d-grid">
                      <button
                      type="submit"
                      className="btn btn-success btn-lg fw-bold py-2 shadow-sm"
                      style={{ borderRadius: "12px", fontSize: "1rem" }}
                      disabled={loading}
                      >
                     {loading ? (
                     <span className="spinner-border spinner-border-sm me-2"></span>
                     ) : (
                    "Iniciar sesión"
                     )}
                      </button>
                      </div>
                    </form>
                    {/* Enlace de Registro */}
                     <div className="text-center mt-4">
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