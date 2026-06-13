import React from "react";
import FormLayout from "../components/FormLayout.jsx";
import { useEntity } from "../hooks/useEntity.js";

function Users() {
  const countries = useEntity("countries");
  const countriesList = countries.list.data || [];

  // Campos del formulario
  const userFields = [
    {
      label: "Nombre",
      name: "name",
      icon: "bi-person",
      placeholder: "Nombre del usuario"
    },
    {
      label: "Apellido",
      name: "lastName",
      icon: "bi-person",
      placeholder: "Apellido del usuario"
    },
    {
      label: "Teléfono",
      name: "phone",
      icon: "bi-telephone",
      placeholder: "Ej: 7777-7777"
    },
    {
      label: "Email",
      name: "email",
      icon: "bi-envelope",
      type: "email",
      placeholder: "correo@ejemplo.com"
    },
    {
      label: "Rol",
      name: "role",
      icon: "bi-person-badge",
      placeholder: "Selecciona un rol de la lista",
      list: "users-roles-datalist",
      options: ["CLIENTE", "ADMINISTRADOR", "SOPORTE", "EMPLEADO"]
    },
    {
      label: "Contraseña",
      name: "password",
      icon: "bi-lock",
      type: "password",
      placeholder: "••••••••",
      disabledOnUpdate: true,
      requiredOnUpdate: false,
      classNameOnUpdate: "fb-hidden-password-field"
    },
    {
      label: "País",
      name: "countryName",
      icon: "bi-globe",
      placeholder: "Selecciona o escribe un país",
      list: "users-countries-datalist",
      options: countriesList.map(c => c.name || c.countryName).filter(Boolean)
    }
  ];

  // Renderizador estético de tarjetas
  const renderUserCard = (u2) => {
    // Blindaje de llaves primarias: Soporta variaciones del backend (id, userId, user_id)
    const userId = u2.id ?? u2.userId ?? u2.user_id ?? u2.users_id;

    // Extracción del nombre completo
    const lastNameStr = u2.lastName ?? u2.last_name ?? "";
    const fullName = `${u2.name || "Usuario sin nombre"} ${lastNameStr}`.trim();

    // Extracción del país
    const countryDisplay = u2.countryName ?? u2.country_name ?? u2.country?.name ?? "Sin país asignado";

    return (
        <div key={userId} className="fb-user-display-card">
          <div className="fb-card-user-info">
            <h4 className="fb-card-user-title">{fullName}</h4>
            <span className="fb-card-user-id">ID: {userId}</span>
          </div>
          <div className="fb-card-user-body">
            <p className="fb-card-user-detail">
              <i className="bi bi-envelope" /> {u2.email || "No disponible"}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-telephone" /> {u2.phone || "Sin teléfono registrado"}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-person-badge" /> <span className="fb-role-badge">{u2.role || "CLIENTE"}</span>
            </p>
            <p className="fb-card-user-detail">
              <i className="bi-globe" />   <span className="fb-country">{countryDisplay}</span>
            </p>
          </div>
        </div>
    );
  };

  return (
      <FormLayout
          resource="users"
          title="usuario"
          article="el"
          icon="bi-people-fill"
          searchField="name"
          fields={userFields}
          renderCard={renderUserCard}
          onBeforeSave={(formData, mode) => {
            if (mode === "update" && (!formData.password || formData.password.trim() === "")) {
            }
            return formData;
          }}
      />
  );
}

export default Users;