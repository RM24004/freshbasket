import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/userService.js";

function RegisterScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1); // 2 steps for better UX

  const [form, setForm] = useState({
    name: "", lastName: "", phone: "", countryId: "",
    email: "", password: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const newUser = {
      name: form.name,
      last_name: form.lastName,
      phone: form.phone,
      email: form.email,
      password: form.password,
      countryId: Number(form.countryId),
    };
    try {
      await createUser(newUser);
      alert("¡Cuenta creada correctamente!");
      navigate("/login");
    } catch (error) {
      console.error("Error en registro:", error.response?.data || error.message);
      alert("Error al registrarse: " + (error.response?.data?.message || "Error de conexión"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.blob1} /><div style={s.blob2} />

      <div style={s.card}>
        {/* LEFT */}
        <div style={s.left}>
          <div style={s.deco1} /><div style={s.deco2} />
          <div style={s.leftInner}>
            <div style={s.brand}>
              <i className="bi bi-basket3-fill" style={s.brandIcon} />
              <span style={s.brandName}>FreshBasket</span>
            </div>
            <div style={s.avatarCircle}>
              <i className="bi bi-person-plus-fill" style={{ fontSize: "2.2rem", color: "#fff" }} />
            </div>
            <h2 style={s.leftTitle}>Únete a<br />FreshBasket</h2>
            <p style={s.leftDesc}>Crea tu cuenta y comienza a gestionar tu stock de productos de forma eficiente.</p>
            <div style={s.features}>
              {[
                { icon: "bi-box-seam-fill", text: "Control de inventario" },
                { icon: "bi-graph-up-arrow", text: "Reportes en tiempo real" },
                { icon: "bi-truck", text: "Gestión de proveedores" },
              ].map((f, i) => (
                <div key={i} style={s.feature}>
                  <div style={s.featureIcon}><i className={`bi ${f.icon}`} /></div>
                  <span style={s.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={s.right}>
          <div style={s.rightTop}>
            <div style={s.rightIconBox}>
              <i className="bi bi-person-badge-fill" style={{ fontSize: "1.5rem", color: "#1a6b3a" }} />
            </div>
            <h1 style={s.rightTitle}>Crear Cuenta</h1>
            <p style={s.rightSub}>Completa los datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row2}>
              <Field label="Nombre" icon="bi-person" name="name" placeholder="Ej: Juan" value={form.name} onChange={handleChange} />
              <Field label="Apellido" icon="bi-person" name="lastName" placeholder="Ej: Pérez" value={form.lastName} onChange={handleChange} />
            </div>
            <div style={s.row2}>
              <Field label="Teléfono" icon="bi-telephone" name="phone" placeholder="7777-7777" value={form.phone} onChange={handleChange} />
              <Field label="ID de País" icon="bi-globe" name="countryId" type="number" placeholder="Ej: 1" value={form.countryId} onChange={handleChange} />
            </div>
            <Field label="Correo Electrónico" icon="bi-envelope" name="email" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={handleChange} full />
            
            {/* Password with toggle */}
            <div style={s.field}>
              <label style={s.label}>Contraseña</label>
              <div style={s.inputWrap}>
                <i className="bi bi-lock" style={s.inputIcon} />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  style={s.input}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  onFocus={e => e.target.style.borderColor = "#2ecc71"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <button type="submit" style={s.btn} disabled={loading}>
              {loading
                ? <><span style={s.spinner} /> Creando cuenta...</>
                : <><i className="bi bi-person-check-fill" /> Registrarme Ahora</>
              }
            </button>
          </form>

          <p style={s.loginText}>
            ¿Ya tienes cuenta?{" "}
            <a href="#" onClick={e => { e.preventDefault(); navigate("/login"); }} style={s.link}>
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable field component
function Field({ label, icon, name, type = "text", placeholder, value, onChange, full }) {
  return (
    <div style={{ ...s.field, ...(full ? { gridColumn: "1 / -1" } : {}) }}>
      <label style={s.label}>{label}</label>
      <div style={s.inputWrap}>
        <i className={`bi ${icon}`} style={s.inputIcon} />
        <input
          type={type} name={name} style={s.input}
          placeholder={placeholder} value={value}
          onChange={onChange} required
          onFocus={e => e.target.style.borderColor = "#2ecc71"}
          onBlur={e => e.target.style.borderColor = "#e5e7eb"}
        />
      </div>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", fontFamily: "'Nunito', sans-serif",
    background: "linear-gradient(135deg, #f0faf4 0%, #e8f5e9 100%)",
    padding: "1.5rem", position: "relative", overflow: "hidden",
  },
  blob1: {
    position: "fixed", top: "-100px", right: "-100px",
    width: "350px", height: "350px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46,204,113,0.15), transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-80px", left: "-80px",
    width: "300px", height: "300px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(26,107,58,0.12), transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    display: "flex", borderRadius: "20px", overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    maxWidth: "860px", width: "100%", position: "relative", zIndex: 1,
  },
  left: {
    width: "280px", minWidth: "220px",
    background: "linear-gradient(145deg, #1a6b3a 0%, #2ecc71 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "2.5rem 1.8rem", position: "relative", overflow: "hidden",
  },
  deco1: {
    position: "absolute", top: "-60px", left: "-60px",
    width: "180px", height: "180px", borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
  },
  deco2: {
    position: "absolute", bottom: "-40px", right: "-40px",
    width: "140px", height: "140px", borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
  },
  leftInner: { position: "relative", zIndex: 2, color: "#fff", textAlign: "center" },
  brand: { display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginBottom: "1.8rem" },
  brandIcon: { fontSize: "1.6rem" },
  brandName: { fontFamily: "'Poppins', sans-serif", fontSize: "1.3rem", fontWeight: 700 },
  avatarCircle: {
    width: "75px", height: "75px", borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1.2rem",
    border: "2px solid rgba(255,255,255,0.25)",
  },
  leftTitle: { fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.7rem", lineHeight: 1.3 },
  leftDesc: { fontSize: "0.85rem", opacity: 0.88, lineHeight: 1.6, marginBottom: "1.5rem" },
  features: { display: "flex", flexDirection: "column", gap: "0.6rem", textAlign: "left" },
  feature: { display: "flex", alignItems: "center", gap: "0.6rem" },
  featureIcon: {
    width: "30px", height: "30px", borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.85rem", flexShrink: 0,
  },
  featureText: { fontSize: "0.83rem", fontWeight: 600 },
  right: {
    flex: 1, background: "#fff",
    padding: "2rem 2.5rem", overflowY: "auto",
  },
  rightTop: { marginBottom: "1.5rem" },
  rightIconBox: {
    width: "52px", height: "52px", borderRadius: "14px",
    background: "rgba(46,204,113,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "0.8rem",
  },
  rightTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.3rem" },
  rightSub: { color: "#7a8694", fontSize: "0.9rem" },
  form: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  row2: { display: "contents" },
  field: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.82rem", fontWeight: 700, color: "#374151" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "12px", color: "#9ca3af", fontSize: "0.9rem", pointerEvents: "none" },
  input: {
    width: "100%", padding: "0.65rem 1rem 0.65rem 2.4rem",
    border: "2px solid #e5e7eb", borderRadius: "9px",
    fontSize: "0.88rem", fontFamily: "'Nunito', sans-serif",
    color: "#1a1a2e", background: "#f9fafb", outline: "none",
    transition: "border-color 0.25s",
  },
  eyeBtn: {
    position: "absolute", right: "10px", background: "none",
    border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "0.95rem",
  },
  btn: {
    gridColumn: "1 / -1",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    width: "100%", padding: "0.8rem",
    background: "linear-gradient(135deg, #1a6b3a, #2ecc71)",
    color: "#fff", border: "none", borderRadius: "10px",
    fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 4px 15px rgba(46,204,113,0.35)",
    marginTop: "0.3rem",
  },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff", borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  loginText: { textAlign: "center", marginTop: "1.2rem", fontSize: "0.88rem", color: "#7a8694" },
  link: { color: "#1a6b3a", fontWeight: 700, textDecoration: "none" },
};

export default RegisterScreen;
