import "../styles/forms.css";
import axios from "axios";
import { tieneAcceso } from "../config/permissions.js";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers, getUserById, createUser,
  updateUser, deleteUser, searchUsersByName
} from "../services/userService.js";

function Users() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "USUARIO";

  // Lee la opción elegida desde el menú desplegable de usuarios
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeUserTab") || "all");
  const [showWelcome, setShowWelcome] = useState(true);

  const [allUsers, setAllUsers] = useState([]);
  const [usersByName, setUsersByName] = useState([]);
  const [userById, setUserById] = useState(null);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [editSearchId, setEditSearchId] = useState("");

  const [countriesList, setCountriesList] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    countryName: "",
  });

   // Controla que mostrar en el sub menu de usuario
   useEffect(() => {
       localStorage.setItem("activeUserTab", "home");
       setActiveTab("home");
       setShowWelcome(true);

       const handleUserTabChange = () => {
         const tab = localStorage.getItem("activeUserTab") || "home";
         setActiveTab(tab);

         if (tab === "home") {
           setShowWelcome(true);
         } else if (tab === "all") {
           setShowWelcome(false);
           if (typeof loadUsers === "function") {
             loadUsers();
           }
         } else if (tab === "name" || tab === "id" || tab === "create" || tab === "update" || tab === "delete") {

           setShowWelcome(false);
         } else {
           setShowWelcome(false);
         }
       };
       window.addEventListener("userTabChanged", handleUserTabChange);

       return () => window.removeEventListener("userTabChanged", handleUserTabChange);
     }, []);


  // Carga dinámica de dependencias
  const loadDependencies = async () => {
    try {
      const token = localStorage.getItem("token");
      const authConfig = {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      };

      const [resCountry] = await Promise.all([
        axios.get("http://192.168.1.60:8080/api/countries", authConfig)
      ]);

      setCountriesList(resCountry.data || []);
    } catch (error) {
      console.error("Error al cargar las dependencias de usuarios:", error);
    }
  };

  // Carga todos los usuarios registrados
  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setAllUsers(data || []);
    } catch (error) {
      console.error("Error al cargar todos los usuarios:", error);
      setAllUsers([]);
    }
  };

  // Disparador inicial de datos estáticos de dependencias
  useEffect(() => {
    loadDependencies();
  }, []);

  // Controla cuando se realiza una bùsqueda por nombre
  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === "") { setUsersByName([]); return; }
    const data = await searchUsersByName(search);
    setUsersByName(data || []);
  };

  // Controla cuando se realiza una bùsqueda por ID
  const handleSearchById = async (e) => {
    e.preventDefault();
    if (searchId.trim() === "") { setUserById(null); return; }
    try {
      const user = await getUserById(searchId);
      setUserById(user || null);
    } catch {
      setUserById(null);
    }
  };

// Controla la creaciòn de un usuario
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newSupplier = Object.fromEntries(fd.entries());

    try {
      const token = localStorage.getItem("token");
      const authConfig = {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      };

      await createUser({
        ...newUser,
        countryName: newUser.countryName?.trim()
      }, authConfig);

      alert("¡Usuario creado con éxito!");
      e.target.reset();
      loadSuppliers();
    } catch (error) {
      console.error("Error completo:", error);
      alert("Error al crear usuario: " + (error.response?.data?.message || "No tienes permisos o verifique los datos"));
    }
  };

  // Controla la busqueda de un usuario por ID
  const updateUserById = async (id, payload) => {
    await updateUser(id, payload);
    loadUsers();
  };

  // Rellena automaticamente el formulario de UPDATE
  const handleChange = (e) => setFormData({
      ...formData, [e.target.name]: e.target.value });

  // Controla que se actualice uno o todos los campos de UPDATE
  const handleBlurId = async (e) => {
    const targetValue = (e && e.target) ? e.target.value : e;
    if (!targetValue || String(targetValue).trim() === "") {
      alert("Por favor, ingresa un ID válido antes de cargar.");
      return;
    }

    try {
      const user = await getUserById(targetValue);
      if (user) {
        const uId = user.id ?? user.user_id;
        const uLastName = user.lastName ?? user.last_name;
        const uCountryId = user.countryId ?? user.country_id ?? user.country?.id;
        const uCountryName = user.countryName ?? user.country_name ?? user.country?.name;

        const paisCorrespondiente = countriesList.find(
          (c) => (c.id === uCountryId || c.country_id === uCountryId || c.name === uCountryName)
        );

        setFormData({
          id: uId || "",
          name: user.name || "",
          lastName: uLastName || "",
          phone: user.phone || "",
          email: user.email || "",
          password: "",
          role: user.role || "",
          countryName: paisCorrespondiente ? paisCorrespondiente.name : (uCountryName || ""),
        });
        console.log("¡Usuario cargado con éxito!", user);
      } else {
        alert("No se encontró el usuario con ese ID");
      }
    } catch (error) {
      console.error(error);
      alert("Error al consultar usuario");
    }
  };

  // Controla que el formulario se envie correctamente
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const { id, name, lastName, phone, email, password, role, countryName } = formData;

    const payload = {
      name,
      lastName,
      phone,
      email,
      role,
      countryName: countryName?.trim()
    };

    if (password && password.trim() !== "") {
      payload.password = password;
    }

    try {
      await updateUserById(id, payload);
      alert("Usuario actualizado correctamente");
      await loadUsers();
    } catch (error) {
      alert("Error al actualizar: " + (error.response?.data?.message || "Revisa los datos"));
    }
  };

  // Redirección de seguridad si se cambia de rol o pestaña
  useEffect(() => {
    if (activeTab === "create" && !tieneAcceso(userRole, "crear")) setActiveTab("all");
    if (activeTab === "update" && !tieneAcceso(userRole, "actualizar")) setActiveTab("all");
    if (activeTab === "delete" && !tieneAcceso(userRole, "eliminar")) setActiveTab("all");
  }, [activeTab, userRole]);

  return (
    <div className="fb-form-container">
          {activeTab === "home" && showWelcome && (
              <div className="fb-photo-section">
              <img
              src="/logo1.png"
              alt="Foto principal FreshBasket"
              className="fb-photo"
          />
          </div>
         )}

          {/* ALL USERS */}
          {activeTab === "all" && (
            <div className="fb-form-section">
              <div className="fb-section-header">
                <h3 className="fb-table-title">
                  <i className="bi bi-people-fill" /> Mostrando todos los registros
                </h3>
                <span className="fb-badge">{allUsers.length} registros</span>
              </div>

              <div className="fb-results-grid fb-users-cards-margin">
                {Array.isArray(allUsers) && allUsers.length > 0 ? (
                  allUsers.map((u2) => (
                    <div key={u2.id} className="fb-user-display-card">
                      <div className="fb-card-user-info">
                        <h4 className="fb-card-user-title">
                          {u2.name} {u2.lastName}
                        </h4>
                        <span className="fb-card-user-id">ID: {u2.id}</span>
                      </div>
                      <div className="fb-card-user-body">
                        <p className="fb-card-user-detail">
                          <i className="bi bi-envelope" /> {u2.email}
                        </p>
                        <p className="fb-card-user-detail">
                          <i className="bi bi-telephone" /> {u2.phone}
                        </p>
                        <p className="fb-card-user-detail">
                            <i className="bi bi-telephone" /> {u2.role}
                        </p>
                        <p className="fb-card-user-detail">
                          <i className="bi bi-geo-alt" />
                          <span className="fb-country">
                            {u2.countryName || "Sin país"}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="fb-empty fb-grid-full-width">
                    <i className="bi bi-inbox" />
                    <p>No hay usuarios registrados</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEARCH BY NAME */}
          {activeTab === "name" && (
            <div className="fb-form-section">
              <div className="fb-form-card">
                <h3 className="fb-form-title"><i className="bi bi-search" /> Escriba un nombre del usuario</h3>
                <form onSubmit={handleSearch} className="fb-search-form">
                  <div className="fb-search-input-wrap">
                    <i className="bi bi-person fb-search-icon" />
                    <input type="text" className="fb-search-input" placeholder="Ej: Martin Antonio"
                      value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <button type="submit" className="fb-search-btn">
                    <i className="bi bi-search" /> Buscar usuario
                  </button>
                </form>
              </div>
              {usersByName.length > 0 && (
                <div className="fb-results-grid">
                  {usersByName.map(u2 => (
                    <div key={u2.id} className="fb-user-card">
                      <div>
                        <p className="fb-user-card-name">{u2.name} {u2.lastName}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-envelope" /> {u2.email}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-telephone" /> {u2.phone}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-telephone" /> {u2.role}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-globe" /> {u2.countryName || "Sin país"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {search.trim() !== "" && usersByName.length === 0 && (
                <div className="fb-empty"><i className="bi bi-search" style={{ fontSize: "2rem" }} /><p>No se encontraron usuarios con ese nombre</p></div>
              )}
            </div>
          )}

          {/* SEARCH BY ID */}
          {activeTab === "id" && (
            <div className="fb-form-section">
              <div className="fb-form-card">
                <h3 className="fb-form-title"><i className="bi bi-search" /> Introduzca el ID del usuario</h3>
                <form onSubmit={handleSearchById} className="fb-search-form">
                  <div className="fb-search-input-wrap">
                    <i className="bi bi-person fb-search-icon" />
                    <input type="number" className="fb-search-input" placeholder="Ingrese ID"
                      value={searchId} onChange={e => setSearchId(e.target.value)} />
                  </div>
                  <button type="submit" className="fb-search-btn">
                    <i className="bi bi-search" /> Buscar usuario
                  </button>
                </form>
              </div>
              {userById && (
                    <div className="fb-results-grid">
                      <div className="fb-user-card">
                        <div>
                          <p className="fb-user-card-name">{userById.name} {userById.lastName}</p>
                          <p className="fb-user-card-detail"><i className="bi bi-envelope" /> {userById.email}</p>
                          <p className="fb-user-card-detail"><i className="bi bi-telephone" /> {userById.phone}</p>
                          <p className="fb-user-card-detail"><i className="bi bi-person-badge" /> {userById.role}</p>
                          <p className="fb-user-card-detail"><i className="bi bi-globe" /> {userById.countryName || "Sin país"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!userById && searchId && (
                    <div className="fb-empty">
                      <i className="bi bi-search" style={{ fontSize: "2rem" }} />
                      <p>No se encontró usuario con ese ID</p>
                    </div>
                    )}
                </div>
              )}

          {/* CREATE USER */}
          {activeTab === "create" && (
            <div className="fb-form-section fb-tab-create">
              <div className="fb-form-card">
                <h3 className="fb-form-title">
                  <i className="bi bi-person-plus-fill" /> Introduzca los datos del nuevo usuario
                </h3>
                <form onSubmit={handleCreateSubmit} className="fb-crud-form">
                  <div className="fb-crud-grid">
                    {[
                      { label: "Nombre", name: "name", icon: "bi-person", placeholder: "Nombre" },
                      { label: "Apellido", name: "lastName", icon: "bi-person", placeholder: "Apellido" },
                      { label: "Teléfono", name: "phone", icon: "bi-telephone", placeholder: "7777-7777" },
                      { label: "Email", name: "email", icon: "bi-envelope", type: "email", placeholder: "correo@ejemplo.com" },
                      { label: "Credenciales", name: "role", icon: "bi-person", placeholder: "Credenciales de" },
                      { label: "Contraseña", name: "password", icon: "bi-lock", type: "password", placeholder: "••••••••" },
                    ].map((f) => (
                      <div key={f.name} className="fb-crud-field">
                        <label className="fb-crud-label">{f.label}</label>
                        <div className="fb-crud-input-wrap">
                          <i className={`bi ${f.icon} fb-crud-input-icon`} />
                          <input type={f.type || "text"} name={f.name} className="fb-crud-input" placeholder={f.placeholder} required />
                        </div>
                      </div>
                    ))}

                    <div className="fb-crud-field">
                      <label className="fb-crud-label">País</label>
                      <div className="fb-crud-input-wrap">
                        <i className="bi bi-globe fb-crud-input-icon" />
                        <input
                          type="text"
                          name="countryName"
                          list={`countries-options-${countriesList.length}`}
                          className="fb-crud-input"
                          placeholder="Selecciona o escribe un país"
                          required
                          autoComplete="off"
                        />
                        <datalist id={`countries-options-${countriesList.length}`}>
                          {Array.isArray(countriesList) && countriesList.map((c, idx) => (
                            <option key={c.id || c.country_id || idx} value={c.name} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)" }}>
                    <i className="bi bi-person-check-fill" /> Crear usuario
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* UPDATE USER */}
          {activeTab === "update" && (
            <div className="fb-form-section fb-tab-update">
              <div className="fb-form-card">
                <h3 className="fb-form-title"><i className="bi bi-pencil-square" /> Actualice el dato o los datos del usuario</h3>
                <form onSubmit={handleUpdateSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="fb-crud-form">
                  <div className="fb-crud-grid">
                    <div className="fb-crud-field">
                      <label className="fb-crud-label">ID usuario</label>
                      <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <i className="bi bi-hash fb-crud-input-icon" style={{ zIndex: 5 }} />
                          <input
                            type="number"
                            name="id"
                            className="fb-crud-input"
                            placeholder="ID del usuario"
                            value={formData.id || ""}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <button
                          type="button"
                          className="fb-search-btn"
                          style={{ padding: "0 15px", whiteSpace: "nowrap", borderRadius: "8px" }}
                          onClick={() => handleBlurId(formData.id)}
                        >
                          Cargar
                        </button>
                      </div>
                    </div>

                    {[
                      { label: "Nombre", name: "name", icon: "bi-person", placeholder: "Nombre" },
                      { label: "Apellido", name: "lastName", icon: "bi-person", placeholder: "Apellido" },
                      { label: "Teléfono", name: "phone", icon: "bi-telephone", placeholder: "Teléfono" },
                      { label: "Email", name: "email", icon: "bi-envelope", type: "email", placeholder: "Email" },
                      { label: "Contraseña", name: "password", icon: "bi-lock", type: "password" },
                      { label: "Credenciales", name: "role", icon: "bi-person" },
                    ].map((f) => (
                      <div key={f.name} className="fb-crud-field">
                        <label className="fb-crud-label">{f.label}</label>
                        <div className="fb-crud-input-wrap">
                          <i className={`bi ${f.icon} fb-crud-input-icon`} />
                          <input type={f.type || "text"} name={f.name} className="fb-crud-input"
                            placeholder={f.placeholder} value={formData[f.name] || ""}
                            onChange={handleChange} required={f.name !== "password"} />
                        </div>
                      </div>
                    ))}

                    <div className="fb-crud-field">
                      <label className="fb-crud-label">País</label>
                      <div className="fb-crud-input-wrap">
                        <i className="bi bi-globe fb-crud-input-icon" />
                        <input
                          type="text"
                          name="countryName"
                          list={`countries-update-options-${countriesList.length}`}
                          className="fb-crud-input"
                          placeholder="Selecciona o escribe un país"
                          value={formData.countryName || ""}
                          onChange={handleChange}
                          required
                          autoComplete="off"
                        />
                        <datalist id={`countries-update-options-${countriesList.length}`}>
                          {Array.isArray(countriesList) && countriesList.map((c, idx) => (
                            <option key={c.id || c.country_id || idx} value={c.name} />
                          ))}
                        </datalist>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#b45309,#fd7e14)", marginTop: "1.5rem" }}>
                    <i className="bi bi-check-circle-fill" /> Actualizar usuario
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* DELETE USER*/}
          {activeTab === "delete" && (
            <div className="fb-form-section">
              <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
                <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
                  <i className="bi bi-trash3-fill" /> Introduzca el ID del usuario
                </h3>
                <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                  ⚠️ Al eliminar el usuario se borrara permanentemente de su base de datos ⚠️
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const idValue = e.target.id.value;

                    const confirmDelete = window.confirm(
                      `¿Está seguro de que desea eliminar el usuario con ese ID ${idValue}?`
                    );

                    if (!confirmDelete) return;

                    try {
                      await deleteUserById(idValue);
                      alert("Usuario eliminado correctamente");
                      e.target.reset();
                      loadUsers();
                    } catch (error) {
                      alert("Error al eliminar usuario");
                    }
                  }}
                  className="fb-search-form"
                >
                  <div className="fb-search-input-wrap">
                    <i className="bi bi-hash fb-search-icon" />
                    <input
                      type="number"
                      name="id"
                      className="fb-search-input"
                      placeholder="ID del usuario a eliminar"
                      required
                    />
                  </div>
                  <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
                    <i className="bi bi-trash3" /> Eliminar usuario
                  </button>
                </form>
              </div>
            </div>
          )}

         </div>

   );
 }

 export default Users;