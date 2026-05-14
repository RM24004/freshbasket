import "../styles/login.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

   try {
     const response = await fetch("http://localhost:8080/api/auth/login", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ email, password }),
     });

     const data = await response.json(); // Movemos esto arriba para leer el error si lo hay

     if (response.ok) {
       localStorage.setItem("token", data.token);
       alert("Login correcto");
       window.location.href = "/users";
     } else {
       alert(data.message || "Credenciales incorrectas");
     }
   } catch (error) {
     console.error("Error detallado:", error);
     alert("Error: El servidor no responde. Revisa si el backend está encendido.");
   } finally {
     setLoading(false);
   }
 };

  return (
<div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative p-3">

  {/* Botón Inicio: Separado de los bordes y de la caja */}
  <div
    className="position-absolute"
    style={{
      top: '10px',   // Más espacio desde arriba
      left: '5px',  // Más espacio desde la izquierda
      zIndex: 1000
    }}
  >
    <a
      href="/"
      className="btn btn-outline-primary shadow-sm bg-white px-4"
      style={{ borderRadius: '8px' }}
    >
      <i className="bi bi-house-door me-2"></i>
      Inicio
    </a>
  </div>

  <div className="container">
    <div className="row justify-content-center">
      <div className="col-md-10 col-lg-8 col-xl-7">

        {/* Card Principal con bordes redondeados y sombra suave */}
        <div className="card shadow-lg border-0 overflow-hidden" style={{ borderRadius: '45px' }}>
          <div className="row g-0">

            {/* Panel Azul */}
            <div className="col-md-5 bg-primary d-flex align-items-center justify-content-center p-3 text-white text-center">
              <div>
                <i className="bi bi-box-seam display-1 mb-3 d-none d-md-block"></i>
                <h3 className="fw-bold m-0">FRESHBASKET</h3>
                <p className="small opacity-75 mt-0">Gestiona tu stock de productos</p>
              </div>
            </div>

            {/* Panel Formulario */}
            <div className="col-md-7">
              <div className="card-body p-4 p-md-5">
                <h2 className="text-center mb-4 text-primary fw-bold">
                  Iniciar Sesión
                </h2>

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Correo Electrónico</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-label fw-semibold small"
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
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        className="form-label fw-semibold small"
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
                      className="btn btn-primary btn-lg fw-bold py-3"
                      style={{ borderRadius: '10px' }}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted small mb-0">
                    ¿No tienes cuenta?{" "}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/register");
                      }}
                      className="text-primary fw-bold text-decoration-none"
                    >
                      Regístrate aquí
                    </a>
                  </p>
                </div>
              </div>
            </div>
            {/* Fin formulario */}
            </div>
            </div>
          </div>
        </div>
        {/* Footer */}
      </div>
    </div>
  );
}

export default Login;
