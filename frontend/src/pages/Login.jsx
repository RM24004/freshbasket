import "../styles/login.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Gestiona tu inventario",
    desc: "Controla el stock de tus productos en tiempo real con FreshBasket.",
    bg: "linear-gradient(135deg, #1a6b3a 0%, #2ecc71 100%)",
    icon: "bi-box-seam-fill",
  },
  {
    title: "Proveedores al instante",
    desc: "Conecta con tus proveedores y actualiza entradas de forma rapida.",
    bg: "linear-gradient(135deg, #145a32 0%, #27ae60 100%)",
    icon: "bi-truck",
  },
  {
    title: "Reportes en tiempo real",
    desc: "Visualiza el rendimiento de tu negocio con graficas y estadisticas.",
    bg: "linear-gradient(135deg, #0e3d22 0%, #1e8449 100%)",
    icon: "bi-bar-chart-fill",
  },
];

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login correcto");
        window.location.href = "/users";
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error: El servidor no responde. Revisa si el backend esta encendido.");
    } finally {
      setLoading(false);
    }
  };

  const slide = slides[current];

  return (
    <div className="fb-login-root">
      <div className="fb-slider" style={{ background: slide.bg }}>
        <div className="fb-circle fb-circle-1" />
        <div className="fb-circle fb-circle-2" />
        <div className="fb-circle fb-circle-3" />
        <div className="fb-slider-content">
          <div className="fb-brand">
            <i className="bi bi-basket3-fill fb-brand-icon" />
            <span className="fb-brand-name">FreshBasket</span>
          </div>
          <div className="fb-slide-body" key={current}>
            <div className="fb-slide-icon">
              <i className={"bi " + slide.icon} />
            </div>
            <h2 className="fb-slide-title">{slide.title}</h2>
            <p className="fb-slide-desc">{slide.desc}</p>
          </div>
          <div className="fb-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={"fb-dot" + (i === current ? " fb-dot-active" : "")}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="fb-form-panel">
        <div className="fb-form-card">
          <div className="fb-mobile-brand">
            <i className="bi bi-basket3-fill" />
            <span>FreshBasket</span>
          </div>
          <h1 className="fb-form-title">Bienvenido</h1>
          <p className="fb-form-sub">Inicia sesión para continuar</p>
          <form onSubmit={handleLogin} className="fb-form">
            <div className="fb-field">
              <label className="fb-label">Correo Electronico</label>
              <div className="fb-input-wrap">
                <i className="bi bi-envelope fb-input-icon" />
                <input
                  type="email"
                  className="fb-input"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="fb-field">
              <label className="fb-label">Contraseña</label>
              <div className="fb-input-wrap">
                <i className="bi bi-lock fb-input-icon" />
                <input
                  type={showPass ? "text" : "password"}
                  className="fb-input"
                  placeholder="........"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="fb-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  <i className={"bi " + (showPass ? "bi-eye-slash" : "bi-eye")} />
                </button>
              </div>
            </div>
            <div className="fb-forgot">
              <button
                type="button"
                className="fb-link"
                onClick={() => navigate("/forgot-password")}
                style={{background:"none",border:"none",cursor:"pointer",padding:0,font:"inherit"}}
              >
                Olvidaste tu contraseña?
              </button>
            </div>
            <button type="submit" className="fb-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="fb-spinner" />
                  Ingresando...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
          <p className="fb-register-text">
            No tienes cuenta?{" "}
            <button
              type="button"
              className="fb-link fb-link-bold"
              onClick={() => navigate("/register")}
              style={{background:"none",border:"none",cursor:"pointer",padding:0,font:"inherit"}}
            >
              Registrate aqui
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
