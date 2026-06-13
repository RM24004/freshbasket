
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/axiosConfig.js";
import toast from "react-hot-toast";
import "../styles/register.css";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

  // Cargar la lista de países dinámicamente al montar el componente (Ruta Pública)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("/api/countries");
        setCountriesList(response.data || []);
      } catch (error) {
        console.error("No se pudo cargar la lista de países dinámicamente:", error);
      }
    };
    fetchCountries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const countryValue = formData.get("countryName")?.trim();

    if (!countryValue) {
      toast.error("Por favor, introduce o selecciona un país.");
      setLoading(false);
      return;
    }

    const newUser = {
      name: formData.get("name"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: "CLIENTE",
      countryName: countryValue
    };

    try {
      await axios.post("/api/auth/register", newUser);

      toast.success("¡Cuenta creada correctamente! Redirigiendo...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verifique los datos ingresados";
      toast.error("Error al registrarse: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light position-relative login-screen-container py-3">

        {/* Botón Inicio fijo en desktop */}
        <div className="position-absolute top-0 start-0 p-3 d-none d-md-block">
          <button
              onClick={() => navigate("/")}
              className="btn btn-outline-success shadow-sm px-3"
              style={{ borderRadius: "8px" }}
          >
            <i className="bi bi-house-door me-2"></i> Inicio
          </button>
        </div>

        {/* Botón Inicio integrado en mobile */}
        <div className="w-100 px-3 pb-2 d-block d-md-none">
          <button
              onClick={() => navigate("/")}
              className="btn btn-outline-success w-100"
              style={{ borderRadius: "8px" }}
          >
            <i className="bi bi-house-door me-2"></i> Inicio
          </button>
        </div>

        {/* Caja principal */}
        <div
            className="card shadow-lg border-0 overflow-hidden mx-3 mx-md-auto register-card"
            style={{
              borderRadius: "25px",
              maxWidth: "950px",
              width: "100%"
            }}
        >
          <div className="row g-0">

            {/* Panel lateral verde */}
            <div className="col-md-4 bg-success d-flex align-items-center justify-content-center p-3 text-white text-center register-side">
              <div>
                <i className="bi bi-person-plus display-4 mb-2 d-none d-md-block opacity-90"></i>
                <h3 className="fw-bold mb-1">UNIRSE</h3>
                <p className="small opacity-75 mb-0">Crea tu cuenta en FreshBasket y gestiona tu stock.</p>
              </div>
            </div>

            {/* Panel formulario */}
            <div className="col-md-8 bg-white register-form">
              <div className="card-body p-3 p-md-4">
                <h2 className="text-center mb-3 text-success fw-bold">Crear Cuenta</h2>
                <form onSubmit={handleSubmit}>
                  {/* Fila: Nombre y Apellido */}
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label fw-semibold small text-secondary mb-1">Nombre</label>
                      <input type="text" name="name" className="form-control bg-light py-2 rounded-3" placeholder="Ej: Juan" required />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label fw-semibold small text-secondary mb-1">Apellido</label>
                      <input type="text" name="lastName" className="form-control bg-light py-2 rounded-3" placeholder="Ej: Pérez" required />
                    </div>
                  </div>

                  {/* Fila: Teléfono y País */}
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="form-label fw-semibold small text-secondary mb-1">Teléfono</label>
                      <input type="text" name="phone" className="form-control bg-light py-2 rounded-3" placeholder="7777-7777" required />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="form-label fw-semibold small text-secondary mb-1">País</label>
                      <div>
                        <input
                            type="text"
                            name="countryName"
                            list={`countries-options-${countriesList.length}`}
                            className="form-control bg-light py-2 rounded-3"
                            placeholder="Selecciona o escribe un país"
                            required
                            autoComplete="off"
                        />
                        <datalist id={`countries-options-${countriesList.length}`}>
                          {Array.isArray(countriesList) && countriesList.map((c, idx) => (
                              <option key={c.id || c.countryId || c.country_id || idx} value={c.name || c.countryName} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="mb-2">
                    <label className="form-label fw-semibold small text-secondary mb-1">Correo Electrónico</label>
                    <input type="email" name="email" autocomplete="username" className="form-control bg-light py-2 rounded-3" placeholder="correo@ejemplo.com" required />
                  </div>

                  {/* Contraseña */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-secondary mb-1">Contraseña</label>
                    <input type="password" name="password" autocomplete="new-password" className="form-control bg-light py-2 rounded-3" placeholder="••••••••" required />
                  </div>

                  {/* Botón de Enviar */}
                  <div className="d-grid">
                    <button
                        type="submit"
                        className="btn btn-success btn-lg fw-bold py-2 shadow-sm"
                        style={{ borderRadius: "10px", fontSize: "1rem" }}
                        disabled={loading}
                    >
                      {loading ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : "Registrarme Ahora"}
                    </button>
                  </div>
                </form>

                {/* Enunciado de login */}
                <div className="text-center mt-3">
                  <p className="text-muted small mb-0">
                    ¿Ya tienes cuenta?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="btn btn-link text-success fw-bold text-decoration-none p-0"
                    >
                      Inicia sesión aquí
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Register;