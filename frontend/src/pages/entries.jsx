

import React from "react";
import FormLayout from "../components/FormLayout.jsx";
import { useEntity } from "../hooks/useEntity.js";

// Campos del formulario
export const getEntryFields = (isEditMode, activeProducts = [], suppliersList = [], userLogin = "") => [
  {
    label: "Producto",
    name: "productName",
    icon: "bi-tag",
    placeholder: "Selecciona o escribe un producto",
    list: "entries-products-list",
    options: activeProducts.map(p => p.name || p.productName)
  },
  {
    label: "Costo unitario",
    name: "unitCost",
    icon: "bi-currency-dollar",
    type: "number",
    placeholder: "0.00",
    step: "0.01"
  },
  {
    label: "Cantidad ingresada",
    name: "quantity",
    icon: "bi-layers",
    type: "number",
    placeholder: "Ej: 100",
    step: "1"
  },
  {
    label: "Proveedor",
    name: "supplierName",
    icon: "bi-building",
    placeholder: "Selecciona o escribe un proveedor",
    list: "entries-suppliers-list",
    options: suppliersList.map(s => `${s.name || s.supplierName || ""} ${s.lastName || ""}`.trim())
  },
  {
    label: isEditMode ? "Usuario que actualiza:" : "Usuario que registra:",
    name: "userName",
    icon: "bi-person",
    defaultValue: userLogin,
    readOnly: true
  }
];

function Entries() {
  const userLogin = localStorage.getItem("userName") || localStorage.getItem("userEmail") || "";

  // Descarga dinámica de catálogos
  const products = useEntity("products");
  const suppliers = useEntity("suppliers");


  const activeProducts = (products.list.data || []).filter(p => p.active === true || p.active === undefined);
  const suppliersList = suppliers.list.data || [];

  const handleGetFields = (isEditMode) => {
    return getEntryFields(isEditMode, activeProducts, suppliersList, userLogin);
  };

  // Renderizador estético de tarjetas
  const renderEntryCard = (entry) => {
    const entryId = entry.id ?? entry.entryId ?? entry.entries_id;

    const formattedDate = entry.entryDate
        ? String(entry.entryDate).split("T")[0]
        : "No disponible";

    return (
        <div key={entryId} className="fb-user-display-card">
          <div className="fb-card-user-info">
            <h4 className="fb-card-user-title">{entry.productName || "Producto desconocido"}</h4>
            <span className="fb-card-user-id">ID: {entryId}</span>
          </div>
          <div className="fb-card-user-body">
            <p className="fb-card-user-detail">
              <i className="bi bi-calendar-event" /> <strong>Fecha registro:</strong> {formattedDate}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-currency-dollar" /> <strong>Costo unitario:</strong> ${Number(entry.unitCost || 0).toFixed(2)}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-layers" /> <strong>Cantidad:</strong> {entry.quantity || 0}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-building" /> <strong>Proveedor:</strong> {entry.supplierName || "Sin proveedor asignado"}
            </p>
            <div className="fb-card-info-row">
              <i className="bi bi-person" />
              <div className="fb-card-info-meta">
               <span className="fb-card-info-label">
                Registrado por:
                 </span>
                <span className="fb-card-info-value">
                 {entry.userName || "Sin usuario"}
                </span>
              </div>
            </div>
          </div>
        </div>
    );
  };

  return (
      <FormLayout
          resource="entries"
          title="entrada"
          article="la"
          icon="bi-box-seam-fill"
          fields={handleGetFields}
          renderCard={renderEntryCard}
          userLogin={userLogin}
      />
  );
}

export default Entries;