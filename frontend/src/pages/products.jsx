import React, { useState } from "react";
import FormLayout from "../components/FormLayout.jsx";
import { useEntity } from "../hooks/useEntity.js";

function Products() {
  const userLogin = localStorage.getItem("userName") || localStorage.getItem("userEmail") || "";

  // Se cargan de manera global las dependencias
  const categories = useEntity("categories");
  const suppliers = useEntity("suppliers");

  // Carga las listas de categorías y proveedores
  const categoriesList = categories.list.data || [];
  const suppliersList = suppliers.list.data || [];

  const getProductFields = (isEditMode) => [
    {
      label: "Nombre del producto",
      name: "name",
      icon: "bi-box-seam",
      placeholder: "Ej: Carne de Res"
    },
    {
      label: "Precio",
      name: "price",
      icon: "bi-currency-dollar",
      type: "number",
      placeholder: "0.00",
      step: "0.01"
    },
    {
      label: "Stock inicial",
      name: "currentStock",
      icon: "bi-hash",
      type: "number",
      placeholder: "25"
    },
    {
      label: "URL de imagen",
      name: "imageUrl",
      icon: "bi-image",
      placeholder: "http://...jpg",
      required: false
    },
    {
      label: "Categoría del producto",
      name: "categoryName",
      icon: "bi-bookmark-star",
      placeholder: "Seleccione o escribe",
      list: "products-cats-options",
      options: categoriesList.map((c) => c.name || c.categoryName)
    },
    {
      label: "Proveedor del producto",
      name: "supplierName",
      icon: "bi-truck",
      placeholder: "Seleccione o escribe",
      list: "products-sups-options",
      options: suppliersList.map((s) => `${s.name || s.supplierName || ""} ${s.lastName || ""}`.trim())
    },
    {
      label: "Descripción del producto",
      name: "description",
      icon: "bi-justify-left",
      placeholder: "Detalles del producto"
    },
    {
      name: "minStock",
      label: "Stock mínimo requerido del producto",
      type: "number",
      placeholder: "Ej. 5",
      icon: "bi-exclamation-triangle",
      required: true,
      step: "1"
    },
    {
      label: isEditMode ? "Usuario que actualiza:" : "Usuario que registra:",
      name: "userName",
      icon: "bi-person-badge",
      defaultValue: userLogin,
      disabled: true
    }
  ];

  // Renderizador estético de tarjetas
  const renderProductCard = (p) => <ProductCard key={p.id || p.productId || p.products_id} p={p} />;

  return (
      <FormLayout
          resource="products"
          title="producto"
          article="el"
          icon="bi-box-seam-fill"
          searchField="name"
          fields={getProductFields}
          renderCard={renderProductCard}
      />
  );
}

// Subcomponente encapsulado
function ProductCard({ p }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const productId = p.id ?? p.productId ?? p.products_id;

  return (
      <div className="fb-user-display-card">
        <div className="fb-card-user-info">
          <h4 className="fb-card-user-title">{p.name || "Producto sin nombre"}</h4>
          <span className="fb-card-user-id">ID: {productId}</span>
        </div>

        {/* Imagen del producto con fallback de seguridad */}
        <div className="fb-product-card-image-wrap">
          {p.imageUrl ? (
              <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="fb-product-card-img-element"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://placehold.co/120x120?text=FreshBasket";
                  }}
              />
          ) : (
              <div className="fb-product-card-img-placeholder">
                <i className="bi bi-image" style={{ fontSize: "2.5rem", color: "#a3b8a3" }} />
              </div>
          )}
        </div>

        <div className="fb-card-user-body">
          {/* INFO SIEMPRE VISIBLE */}
          <p className="fb-card-user-detail">
            <i className="bi bi-currency-dollar" /> <strong>Precio:</strong> ${Number(p.price || 0).toFixed(2)}
          </p>
          <div className="fb-card-info-row">
            <i className="bi bi-justify-left" />
            <div className="fb-card-info-meta">
              <span className="fb-card-info-label">Descripción:</span>
              <span className="fb-card-info-value">{p.description || "Sin descripción"}</span>
            </div>
          </div>

          {/* INFO DESPLEGABLE */}
          {isExpanded && (
              <div className="fb-product-card-extra-info">
                <p className="fb-card-user-detail">
                  <i className="bi bi-hash" /> <strong>Stock actual:</strong> {p.currentStock ?? p.stockActual ?? p.stock ?? 0}
                </p>
                <p className="fb-card-user-detail">
                  <i className="bi bi-bookmark-star" /> <strong>Categoría:</strong> {p.categoryName || "Sin categoría"}
                </p>
                <div className="fb-card-info-row">
                  <i className="bi bi-truck" />
                  <div className="fb-card-info-meta">
                    <span className="fb-card-info-label">Proveedor:</span>
                    <span className="fb-card-info-value">{p.supplierName || "Sin proveedor"}</span>
                  </div>
                </div>
                <div className="fb-card-info-row">
                  <i className="bi bi-person" />
                  <div className="fb-card-info-meta">
                    <span className="fb-card-info-label">Registrado por:</span>
                    <span className="fb-card-info-value">{p.userName || "Sin usuario"}</span>
                  </div>
                </div>
              </div>
          )}

          {/* BOTÓN CON CLASES DINÁMICAS SEGÚN EL ESTADO */}
          <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`fb-product-card-toggle-btn ${isExpanded ? 'expanded' : 'collapsed'}`}
          >
            <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
            <span>{isExpanded ? "Ver menos detalles" : "Ver más detalles"}</span>
          </button>
        </div>
      </div>
  );
}

export default Products;