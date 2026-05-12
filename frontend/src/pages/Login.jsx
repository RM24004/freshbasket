import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Por favor complete todos los campos");
            return;
        }

        setLoading(true);
        try {
            const data = await login(email, password);
            const decoded = jwtDecode(data.token);

            localStorage.setItem("token", data.token);
            localStorage.setItem("email", decoded.sub);
            localStorage.setItem("userId", decoded.userId);

            alert("Login exitoso");
            navigate("/index");
        } catch (error) {
            console.error(error);
            alert("Error en login. Verifique sus credenciales.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-lg">
                            <div className="row g-0">
                                {/* Imagen */}
                                <div className="col-md-5 bg-primary d-flex align-items-center justify-content-center">
                                    <div className="text-center text-white p-4">
                                        <i className="bi bi-box-seam display-1 mb-3"></i>
                                        <h3 className="fw-bold">Sistema de Inventario</h3>
                                        <p>Gestiona tu stock de productos</p>
                                    </div>
                                </div>

                                {/* Formulario */}
                                <div className="col-md-7">
                                    <div className="card-body p-5">
                                        <h2 className="text-center mb-4 text-primary fw-bold">Iniciar Sesión</h2>
                                        
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">Correo Electrónico</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <i className="bi bi-envelope"></i>
                                                </span>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="correo@ejemplo.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">Contraseña</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light">
                                                    <i className="bi bi-lock"></i>
                                                </span>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="d-grid gap-2">
                                            <button
                                                className="btn btn-primary btn-lg"
                                                onClick={handleLogin}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                ) : (
                                                    "Iniciar Sesión"
                                                )}
                                            </button>
                                        </div>

                                        <div className="text-center mt-4">
                                            <p className="text-muted">
                                                ¿No tienes cuenta?{' '}
                                                <a 
                                                    href="#" 
                                                    onClick={(e) => { e.preventDefault(); navigate("/register"); }}
                                                    className="text-primary fw-semibold text-decoration-none"
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