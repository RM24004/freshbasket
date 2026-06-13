
import React from "react";
import FormLayout from "../components/FormLayout.jsx";
import { useEntity } from "../hooks/useEntity.js";

// Campos del formulario
export const getExitFields = (isEditMode, activeProducts = [], userLogin = "") => [
    {
        label: "Producto",
        name: "productName",
        icon: "bi-tag",
        placeholder: "Selecciona o escribe un producto",
        list: "exits-products-list",
        options: activeProducts.map((p) => p.name || p.productName)
    },
    {
        label: "Cantidad a retirar",
        name: "quantity",
        icon: "bi-layers",
        type: "number",
        placeholder: "Ej: 10",
        step: "1"
    },
    {
        label: isEditMode ? "Usuario que actualiza" : "Usuario que registra",
        name: "userName",
        icon: "bi-person",
        defaultValue: userLogin,
        readOnly: true
    }
];

function Exits() {
    const userLogin = localStorage.getItem("userName") || localStorage.getItem("userEmail") || "";

    // Carga el catálogo global de productos
    const products = useEntity("products");

    // Filtrado de los productos activos
    const activeProducts = (products.list.data || []).filter(
        (p) => p.active === true || p.active === undefined
    );

    const handleGetFields = (isEditMode) => {
        return getExitFields(isEditMode, activeProducts, userLogin);
    };

    // Renderizador estético de tarjetas
    const renderExitCard = (exit) => {
        const exitId = exit.id ?? exit.exitId ?? exit.exits_id;

        const formattedDate = exit.exitDate
            ? String(exit.exitDate).split("T")[0]
            : "No disponible";

        return (
            <div key={exitId} className="fb-user-display-card">
                <div className="fb-card-user-info">
                    <h4 className="fb-card-user-title">{exit.productName || "Producto desconocido"}</h4>
                    <span className="fb-card-user-id">ID: {exitId}</span>
                </div>
                <div className="fb-card-user-body">
                    <p className="fb-card-user-detail">
                        <i className="bi bi-calendar-event" /> <strong>Fecha registro:</strong> {formattedDate}
                    </p>
                    <p className="fb-card-user-detail">
                        <i className="bi bi-layers" /> <strong>Cantidad:</strong> {exit.quantity || 0}
                    </p>
                    <div className="fb-card-info-row">
                        <i className="bi bi-person" />
                        <div className="fb-card-info-meta">
                        <span className="fb-card-info-label">
                         Registrado por:
                          </span>
                            <span className="fb-card-info-value">
                             {exit.userName || "Sin usuario"}
                           </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <FormLayout
            resource="exits"
            title="salida"
            article="la"
            icon="bi-box-arrow-up"
            searchField="productName"
            fields={handleGetFields}
            renderCard={renderExitCard}
        />
    );
}

export default Exits;