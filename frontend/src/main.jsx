import React from "react";
import ReactDOM from "react-dom/client";
import "./services/axiosConfig";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "./index.css";


// Montar la aplicación en el div con ID="root" de index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
