import "../styles/home.css";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div className="home-container">
            <img
                src="/logo1.png"
                alt="Logotipo de FreshBasket"
                className="home-background"
                draggable="false"
                loading="eager"
            />
            {/* Contenedor overlay para las acciones */}
            <div className="overlay-content">
                <Link to="/login" className="btn-home">
                    Iniciar Sesión
                </Link>
            </div>
        </div>
    );
}

export default Home;
