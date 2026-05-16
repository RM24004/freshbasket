import "../styles/home.css";
import { Link } from "react-router-dom";

function HomeScreen() {
  return (
    <div 
      className="home-container d-flex justify-content-center align-items-center vh-100 position-relative overflow-hidden"
      style={{
        backgroundColor: "#f8fdf9" // Fondo verde agua suave
      }}
    >
      {/* IMAGEN DE FONDO CONTROLADA */}
      <img 
        src="/logo1.png" 
        alt="Fondo FreshBasket"
        style={{
          position: "absolute",
          zIndex: 0, // Para que se quede detrás del texto
          // ---- AJUSTA ESTOS VALORES  ----
          width: "1524px",   // Ancho (puedes poner 400px, 800px, etc.)
          height: "1900px",  // Alto
          objectFit: "contain", // Evita que se deforme
          opacity: 0.95, // Bajar un poquito la opacidad para que el texto destaque más
        }}
      />

      {/* CAJITA DEL FORMULARIO (Se queda por encima de la imagen gracias al zIndex) */}
      <div 
        className="welcome-box shadow-lg p-5 text-center position-relative"
        style={{
          zIndex: 1, // Siempre mayor que el de la imagen
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          backdropFilter: "blur(5px)", 
          borderRadius: "20px",
          border: "2px solid #198754"
        }}
      >
        <h1 className="display-5 mb-3 fw-bold" style={{ color: "#198754" }}>FRESHBASKET</h1>
        <p className="lead text-muted">"Gestiona tu stock de productos"</p>
        <Link 
          to="/login" 
          className="btn btn-lg mt-4 px-5 fw-bold"
          style={{ 
            borderRadius: "50px", 
            backgroundColor: "#198754", 
            borderColor: "#146c43",
            color: "white"
          }}
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}

export default HomeScreen;