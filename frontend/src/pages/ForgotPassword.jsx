import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
  { icon: "bi-envelope-paper-fill", label: "Ingresa tu correo" },
  { icon: "bi-send-fill", label: "Enviamos el enlace" },
  { icon: "bi-shield-lock-fill", label: "Recupera tu cuenta" },
];

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    if (!email) { alert("Por favor ingrese su correo electrónico"); return; }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setSent(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || "Error al procesar la solicitud.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* LEFT PANEL */}
        <div style={styles.left}>
          <div style={styles.leftInner}>
            {/* Brand */}
            <div style={styles.brand}>
              <i className="bi bi-basket3-fill" style={styles.brandIcon} />
              <span style={styles.brandName}>FreshBasket</span>
            </div>

            <div style={styles.leftBody}>
              <div style={styles.lockCircle}>
                <i className="bi bi-shield-lock-fill" style={{ fontSize: "2.2rem", color: "#fff" }} />
              </div>
              <h2 style={styles.leftTitle}>¿Problemas para<br />ingresar?</h2>
              <p style={styles.leftDesc}>No te preocupes, te ayudaremos a recuperar tu cuenta en simples pasos.</p>

              {/* Steps */}
              <div style={styles.steps}>
                {steps.map((s, i) => (
                  <div key={i} style={styles.step}>
                    <div style={styles.stepIcon}>
                      <i className={`bi ${s.icon}`} style={{ fontSize: "1rem" }} />
                    </div>
                    <span style={styles.stepLabel}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div style={styles.deco1} />
          <div style={styles.deco2} />
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.right}>
          {!sent ? (
            <>
              <div style={styles.rightTop}>
                <div style={styles.rightIcon}>
                  <i className="bi bi-key-fill" style={{ fontSize: "1.6rem", color: "#1a6b3a" }} />
                </div>
                <h1 style={styles.rightTitle}>Recuperar Contraseña</h1>
                <p style={styles.rightSub}>Ingresa tu correo y te enviaremos un enlace de recuperación.</p>
              </div>

              <form onSubmit={handleRecover} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Correo Electrónico</label>
                  <div style={styles.inputWrap}>
                    <i className="bi bi-envelope" style={styles.inputIcon} />
                    <input
                      type="email"
                      style={styles.input}
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      onFocus={e => e.target.style.borderColor = "#2ecc71"}
                      onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                    />
                  </div>
                </div>

                <button type="submit" style={styles.btn} disabled={loading}>
                  {loading ? (
                    <><span style={styles.spinner} /> Enviando...</>
                  ) : (
                    <><i className="bi bi-send-fill" /> Enviar Enlace de Recuperación</>
                  )}
                </button>
              </form>

              <div style={styles.backWrap}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); navigate("/login"); }}
                  style={styles.backLink}
                >
                  <i className="bi bi-arrow-left-short" />
                  Volver al Inicio de Sesión
                </a>
              </div>
            </>
          ) : (
            /* Success state */
            <div style={styles.successWrap}>
              <div style={styles.successIcon}>
                <i className="bi bi-check-circle-fill" style={{ fontSize: "3rem", color: "#2ecc71" }} />
              </div>
              <h2 style={styles.successTitle}>¡Correo enviado!</h2>
              <p style={styles.successDesc}>
                Hemos enviado las instrucciones a <strong>{email}</strong>. Revisa tu bandeja de entrada.
              </p>
              <button
                style={styles.btn}
                onClick={() => navigate("/login")}
              >
                <i className="bi bi-box-arrow-in-right" /> Volver al Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0faf4 0%, #e8f5e9 100%)",
    fontFamily: "'Nunito', sans-serif",
    padding: "1.5rem",
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "fixed", top: "-120px", right: "-120px",
    width: "400px", height: "400px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(46,204,113,0.15), transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed", bottom: "-100px", left: "-100px",
    width: "350px", height: "350px", borderRadius: "50%",
    background: "radial-gradient(circle, rgba(26,107,58,0.12), transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    display: "flex",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
    maxWidth: "820px",
    width: "100%",
    position: "relative",
    zIndex: 1,
  },
  /* LEFT */
  left: {
    flex: 1,
    background: "linear-gradient(145deg, #1a6b3a 0%, #2ecc71 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2.5rem 2rem",
    position: "relative",
    overflow: "hidden",
    minWidth: "260px",
  },
  leftInner: { position: "relative", zIndex: 2, color: "#fff", textAlign: "center" },
  brand: { display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem" },
  brandIcon: { fontSize: "1.8rem" },
  brandName: { fontFamily: "'Poppins', sans-serif", fontSize: "1.4rem", fontWeight: 700 },
  leftBody: {},
  lockCircle: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 1.2rem",
    border: "2px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(4px)",
  },
  leftTitle: { fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.7rem", lineHeight: 1.3 },
  leftDesc: { fontSize: "0.88rem", opacity: 0.88, lineHeight: 1.6, marginBottom: "1.8rem", maxWidth: "220px", margin: "0 auto 1.8rem" },
  steps: { display: "flex", flexDirection: "column", gap: "0.7rem", textAlign: "left" },
  step: { display: "flex", alignItems: "center", gap: "0.7rem" },
  stepIcon: {
    width: "34px", height: "34px", borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  stepLabel: { fontSize: "0.88rem", fontWeight: 600 },
  deco1: {
    position: "absolute", top: "-60px", left: "-60px",
    width: "200px", height: "200px", borderRadius: "50%",
    background: "rgba(255,255,255,0.07)",
  },
  deco2: {
    position: "absolute", bottom: "-40px", right: "-40px",
    width: "160px", height: "160px", borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
  },
  /* RIGHT */
  right: {
    flex: "1.2",
    background: "#fff",
    padding: "2.5rem 2.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  rightTop: { marginBottom: "1.8rem" },
  rightIcon: {
    width: "56px", height: "56px", borderRadius: "14px",
    background: "rgba(46,204,113,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "1rem",
  },
  rightTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1.6rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "0.4rem" },
  rightSub: { color: "#7a8694", fontSize: "0.92rem", lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.4rem" },
  label: { fontSize: "0.85rem", fontWeight: 700, color: "#374151" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: { position: "absolute", left: "14px", color: "#9ca3af", fontSize: "1rem", pointerEvents: "none" },
  input: {
    width: "100%", padding: "0.75rem 1rem 0.75rem 2.6rem",
    border: "2px solid #e5e7eb", borderRadius: "10px",
    fontSize: "0.95rem", fontFamily: "'Nunito', sans-serif",
    color: "#1a1a2e", background: "#f9fafb",
    outline: "none", transition: "border-color 0.25s",
  },
  btn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    width: "100%", padding: "0.85rem",
    background: "linear-gradient(135deg, #1a6b3a, #2ecc71)",
    color: "#fff", border: "none", borderRadius: "10px",
    fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 4px 15px rgba(46,204,113,0.35)",
    marginTop: "0.4rem",
  },
  spinner: {
    width: "16px", height: "16px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff", borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  backWrap: { textAlign: "center", marginTop: "1.2rem" },
  backLink: { color: "#1a6b3a", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none" },
  /* Success */
  successWrap: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "1rem" },
  successIcon: {
    width: "80px", height: "80px", borderRadius: "50%",
    background: "rgba(46,204,113,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1.5rem", fontWeight: 700, color: "#1a1a2e" },
  successDesc: { color: "#7a8694", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: "280px" },
};

export default ForgotPassword;
