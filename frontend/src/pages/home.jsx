import "../styles/home.css";
import { Link } from "react-router-dom";

function HomeScreen() {
  return (
    <div className="home-container d-flex justify-content-center align-items-center vh-100">
      <div className="welcome-box">
        <h1 className="display-5 mb-3">FRESHBASKET</h1>
        <p className="lead">"Gestiona tu stock de productos"</p>
        <Link to="/login" className="btn btn-primary btn-lg mt-4">
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}


export default HomeScreen;

