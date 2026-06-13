
import React from "react";
import FormLayout from "../components/FormLayout.jsx";
import { useEntity } from "../hooks/useEntity.js";

function Suppliers() {
  const countries = useEntity("countries");
  const countriesList = countries.list.data || [];

  // Definimos las variables estructurales del formulario
  const supplierFields = [
    {
      label: "Nombre comercial / Empresa",
      name: "name",
      icon: "bi-person",
      placeholder: "Nombre del proveedor"
    },
    {
      label: "Apellido (Opcional)",
      name: "lastName",
      icon: "bi-person",
      placeholder: "Apellido del contacto",
      required: false
    },
    {
      label: "Teléfono de contacto",
      name: "phone",
      icon: "bi-telephone",
      placeholder: "Ej: 7777-7777"
    },
    {
      label: "Correo electrónico",
      name: "email",
      type: "email",
      placeholder: "correo@ejemplo.com"
    },
    {
      label: "Dirección física",
      name: "address",
      icon: "bi-geo-alt",
      placeholder: "Dirección completa de oficinas o bodega"
    },
    {
      label: "País de origen",
      name: "countryName",
      icon: "bi-globe",
      placeholder: "Selecciona o escribe un país",
      list: "suppliers-countries-datalist",
      options: countriesList.map(c => c.name || c.countryName).filter(Boolean)
    }
  ];

  // Renderizador estético de tarjetas
  const renderSupplierCard = (sup) => {
    const supplierId = sup.id ?? sup.supplierId ?? sup.supplier_id ?? sup.suppliers_id;

    // Extracción segura del apellido
    const lastNameStr = sup.lastName ?? sup.last_name ?? "";
    const fullName = `${sup.name || "Proveedor sin nombre"} ${lastNameStr}`.trim();

    // Extracción segura del país
    const countryDisplay = sup.countryName ?? sup.country_name ?? sup.country?.name ?? "Sin país asignado";

    return (
        <div key={supplierId} className="fb-user-display-card">
          <div className="fb-card-user-info">
            <h4 className="fb-card-user-title">{fullName}</h4>
            <span className="fb-card-user-id">ID: {supplierId}</span>
          </div>
          <div className="fb-card-user-body">
            <p className="fb-card-user-detail">
              <i className="bi bi-envelope" /> {sup.email || "Sin correo electrónico"}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-telephone" /> {sup.phone || "Sin teléfono"}
            </p>
            <div className="fb-card-info-row">
              <i className="bi bi-geo-alt bi" />
              <div className="fb-card-info-meta">
                <span className="fb-card-info-label"></span>
                <span className="fb-card-info-value">{sup.address || "Sin descripción"}</span>
              </div>
            </div>
            <p className="fb-card-user-detail">
              <i className="bi-globe" />  <span className="fb-country">{countryDisplay}</span>
            </p>
          </div>
        </div>
    );
  };

  return (
      <FormLayout
          resource="suppliers"
          title="proveedor"
          article="el"
          icon="bi-truck"
          searchField="name"
          fields={supplierFields}
          renderCard={renderSupplierCard}
      />
  );
}

export default Suppliers;