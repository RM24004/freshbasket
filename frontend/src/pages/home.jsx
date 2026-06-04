import "../styles/home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-container">
      {/* Imagen de fondo */}
      <img
        src="/logo1.png"
        alt="Fondo FreshBasket"
        className="home-background"
      />

      {/* Contenedor overlay para el botón */}
      <div className="overlay-content">
        <Link to="/login" className="btn-home">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}

export default Home;
