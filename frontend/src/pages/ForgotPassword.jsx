import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRecover = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error("Por favor ingrese su correo electrónico");
            return;
        }

        setLoading(true);
        try {
            // Hacemos la petición real al backend
            const response = await fetch("http://192.168.1.60:8080/api/auth/recover-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });

            if (response.ok) {
                toast.success("Enlace enviado. ¡Revisa tu correo electrónico!");


                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                let errorMessage = "Error al procesar la solicitud.";
                try {
                    const errorData = await response.json();
                    if (errorData?.message) errorMessage = errorData.message;
                } catch (e) {

                }
                toast.error(errorMessage);
            }
        } catch (error) {
            toast.error("Error de conexión con el servidor.");
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
             {/* Lado Izquierdo Azul */}
              <div className="col-md-5 bg-primary d-flex align-items-center justify-content-center">
               <div className="text-center text-white p-4">
                <h3 className="fw-bold">¿Problemas?</h3>
                 <p className="small">No te preocupes, te ayudaremos a recuperar tu cuenta.</p>
                  </div>
                   </div>
                    {/* Formulario Derecho */}
                    <div className="col-md-7">
                   <div className="card-body p-5">
                   <h2 className="text-center mb-2 text-primary fw-bold">Recuperar contraseña</h2>
                   <p className="text-center text-muted mb-4 small">Ingresa tu correo y te enviaremos instrucciones.</p>
                  <form onSubmit={handleRecover}>
                  <div className="mb-4">
                 <label className="form-label fw-semibold small">Correo electrónico</label>
                 <input
                 type="email"
                 className="form-control bg-light"
                 placeholder="correo@ejemplo.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
                 />
                </div>
               <div className="d-grid gap-2 mb-3">
               <button
              type="submit"
              className="btn btn-primary btn-lg"
             disabled={loading}
             >
            {loading ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
             ) : (
            "Enviar Enlace de Recuperación"
              )}
            </button>
            </div>
            </form>
            {/* Enlace para volver atrás */}
             <div className="text-center">
               <a
               href="#"
               onClick={(e) => { e.preventDefault(); navigate("/login"); }}
               className="text-primary fw-semibold text-decoration-none small"
               >
               <i className="bi bi-arrow-left me-1"></i> Volver al inicio de Sesión
               </a>
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

export default ForgotPassword;