// Pagina de registro, en el caso que un usuario no tenga cuenta.

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/register.css";
import { registerUserPublic } from "../services/userService.js";

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countriesList, setCountriesList] = useState([]);

  // Cargar la lista de países dinámicamente al montar el componente (Ruta Pública)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("http://192.168.1.60:8080/api/countries");
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

    // Estructuramos el JSON exactamente como lo espera tu AuthController en el backend
    const newUser = {
      name: formData.get("name"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: "USUARIO",
      countryName: countryValue
    };

    try {
      await axios.post("http://192.168.1.60:8080/api/auth/register", newUser);

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
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light position-relative login-screen-container">

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
      <div className="w-100 p-3 d-block d-md-none">
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
          maxWidth: "700px",
          width: "100%",
          height: window.innerWidth >= 992 ? "90vh" : "auto",
          overflowY: window.innerWidth >= 992 ? "auto" : "visible"
        }}
      >
        <div className="row g-0 h-100">

          {/* Panel lateral verde */}
          <div className="col-md-4 bg-success d-flex align-items-center justify-content-center p-4 text-white text-center register-side">
            <div>
              <i className="bi bi-person-plus display-1 mb-0 d-none d-md-block"></i>
              <h3 className="fw-bold m-0">UNIRSE</h3>
              <p className="small opacity-75">Crea tu cuenta en FreshBasket y gestiona tu stock.</p>
            </div>
          </div>

          {/* Panel formulario */}
          <div className="col-md-8 bg-white register-form">
            <div className="card-body p-4 p-md-5">
              <h2 className="text-center mb-3 text-success fw-bold">Crear Cuenta</h2>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label className="form-label fw-semibold small">Nombre</label>
                    <input type="text" name="name" className="form-control bg-light" placeholder="Ej: Juan" required />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label fw-semibold small">Apellido</label>
                    <input type="text" name="lastName" className="form-control bg-light" placeholder="Ej: Pérez" required />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label className="form-label fw-semibold small">Teléfono</label>
                    <input type="text" name="phone" className="form-control bg-light" placeholder="7777-7777" required />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label className="form-label fw-semibold small">País</label>
                    <div className="fb-crud-input-wrap">
                      <i className="bi bi-globe fb-crud-input-icon" />
                      <input
                        type="text"
                        name="countryName"
                        list={`countries-options-${countriesList.length}`}
                        className="fb-crud-input"
                        placeholder="Selecciona o escribe un país"
                        required
                        autoComplete="off"
                      />
                      <datalist id={`countries-options-${countriesList.length}`}>
                        {Array.isArray(countriesList) && countriesList.map((c, idx) => (
                          <option key={c.id || c.country_id || idx} value={c.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Correo Electrónico</label>
                  <input type="email" name="email" className="form-control bg-light" placeholder="correo@ejemplo.com" required />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Contraseña</label>
                  <input type="password" name="password" className="form-control bg-light" placeholder="••••••••" required />
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-success btn-lg fw-bold py-2"
                    style={{ borderRadius: "10px" }}
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