
import React from "react";
import FormLayout from "../components/FormLayout.jsx";

function Categories() {
    const title = "categoría";
    const resource = "categories";

    // Campos del formulario
    const categoryFields = [
        {
            label: "Nombre de la categoría",
            name: "name",
            icon: "bi-tag",
            type: "text",
            placeholder: "Ej: Frutas y Verduras"
        },
        {
            label: "Descripción de la categoría",
            name: "description",
            icon: "bi-justify-left",
            type: "text",
            placeholder: "Breve descripción del tipo de productos"
        }
    ];

    // Renderizador estético reutilizable de tarjetas
    const renderCategoryCard = (cat) => {
        const categoryId = cat.id ?? cat.categoryId ?? cat.category_id ?? cat.categories_id;

        return (
            <div key={categoryId} className="fb-user-display-card">
                <div className="fb-card-user-info">
                    <h4 className="fb-card-user-title">{cat.name}</h4>
                    <span className="fb-card-user-id">ID: {categoryId}</span>
                </div>
                <div className="fb-card-info-row">
                    <i className="bi bi-justify-left" />
                    <div className="fb-card-info-meta">
                        <span className="fb-card-info-label">Descripción:</span>
                        <span className="fb-card-info-value">{cat.description || "Sin descripción"}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <FormLayout
            resource={resource}
            title={title}
            article="la"
            icon="bi-tags"
            searchField="name"
            fields={categoryFields}
            renderCard={renderCategoryCard}
        />
    );
}

export default Categories;