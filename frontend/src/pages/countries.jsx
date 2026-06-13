
import React from "react";
import FormLayout from "../components/FormLayout.jsx";

function Countries() {

    // Campos del formulario
    const countryFields = [
        {
            label: "Nombre del país",
            name: "name",
            icon: "bi-globe",
            placeholder: "Ej: El Salvador"
        },
        {
            label: "Descripción",
            name: "description",
            icon: "bi-justify-left",
            placeholder: "Ej: Región Centroamérica - Proveedor de perecederos"
        },
    ];

    // Renderizador estético de tarjetas
    const renderCountryCard = (co) => {
        const countryId = co.id ?? co.countryId ?? co.country_id ?? co.countries_id;

        return (
            <div key={countryId} className="fb-user-display-card">
                <div className="fb-card-user-info">
                    <h4 className="fb-card-user-title">{co.name}</h4>
                    <span className="fb-card-user-id">ID: {countryId}</span>
                </div>
                <div className="fb-card-info-row">
                    <i className="bi bi-justify-left" />
                    <div className="fb-card-info-meta">
                        <span className="fb-card-info-label">Descripción:</span>
                        <span className="fb-card-info-value">{co.description || "Sin descripción"}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <FormLayout
            resource="countries"
            title="país"
            article="el"
            icon="bi-globe-americas"
            searchField="name"
            fields={countryFields}
            renderCard={renderCountryCard}
        />
    );
}

export default Countries;