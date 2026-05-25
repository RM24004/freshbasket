import "../styles/forms.css";
import axios from "axios";
import { tieneAcceso } from "../config/permissions.js";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllSuppliers, getSupplierById, createSupplier,
  updateSupplier, deleteSupplier, searchSuppliersByName
} from "../services/supplierService.js";

function Suppliers() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "USUARIO";

  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeSupplierTab") || "all");
  const [showWelcome, setShowWelcome] = useState(true);


  const [allSuppliers, setAllSuppliers] = useState([]);
  const [suppliersByName, setSuppliersByName] = useState([]);
  const [supplierById, setSupplierById] = useState(null);
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
    address: "",
    countryName: "",
  });


  const loadSuppliers = async () => {
    try {
      const data = await getAllSuppliers();
      setAllSuppliers(data || []);
    } catch (error) {
      console.error("Error al cargar todos los proveedores:", error);
      setAllSuppliers([]);
    }
  };

 // Controla los cambios en el sub menu de productos
 useEffect(() => {
   localStorage.setItem("activeSupplierTab", "home");
   setActiveTab("home");
   setShowWelcome(true);

   const handleSupplierTabChange = () => {
     const tab = localStorage.getItem("activeSupplierTab") || "home";
     setActiveTab(tab);

     if (tab === "home") {
       setShowWelcome(true);
     } else if (tab === "all") {
       setShowWelcome(false);
       if (typeof loadSuppliers === "function") {
         loadSuppliers();
       }
     } else if (tab === "name" || tab === "id" || tab === "create" || tab === "update" || tab === "delete") {

       setShowWelcome(false);
     } else {
       setShowWelcome(false);
     }
   };
   window.addEventListener("supplierTabChanged", handleSupplierTabChange);

   return () => window.removeEventListener("supplierTabChanged", handleSupplierTabChange);
 }, []);

  // Carga las dependencias del proveedor (pais)
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
      console.error("Error al cargar las dependencias de proveedores:", error);
    }
  };


  useEffect(() => {
    loadDependencies();
  }, []);

  // Se busca un proveedor por nombre
  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === "") { setSuppliersByName([]); return; }
    const data = await searchSuppliersByName(search);
    setSuppliersByName(data || []);
  };

  // Se busca un proveedor por ID
  const handleSearchById = async (e) => {
    e.preventDefault();
    if (searchId.trim() === "") { setSupplierById(null); return; }
    try {
      const supplier = await getSupplierById(searchId);
      setSupplierById(supplier || null);
    } catch {
      setSupplierById(null);
    }
  };

  // Permite crear un nuevo registro de un proveedor
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newSupplier = Object.fromEntries(fd.entries());

    const countryFound = countriesList.find(
      (c) => c.name.toLowerCase() === newSupplier.countryName?.trim().toLowerCase()
    );

    if (!countryFound) {
      alert("Por favor, selecciona un país válido de la lista.");
      return;
    }

    const payload = {
      name: newSupplier.name,
      lastName: newSupplier.lastName,
      phone: newSupplier.phone,
      email: newSupplier.email,
      address: newSupplier.address,
      countryId: countryFound.id || countryFound.country_id
    };

    try {
      const token = localStorage.getItem("token");
      const authConfig = {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      };

      await createSupplier(payload, authConfig);

      alert("¡Proveedor creado con éxito!");
      e.target.reset();
      loadSuppliers();
    } catch (error) {
      console.error("Error en la petición:", error.response?.data);
      alert("Error al crear proveedor: " + (error.response?.data?.message || "Revisa los campos"));
    }
  };

  // Actualiza un proveedor
  const updateSupplierById = async (id, payload) => {
    await updateSupplier(id, payload);
    loadSuppliers();
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Controla la carga automatica del formulario de actualización
  const handleBlurId = async (e) => {
    const targetValue = (e && e.target) ? e.target.value : e;
    if (!targetValue || String(targetValue).trim() === "") {
      alert("Por favor, ingresa un ID válido antes de cargar.");
      return;
    }

    try {
      const supplier = await getSupplierById(targetValue);
      if (supplier) {
        const uId = supplier.id ?? supplier.supplier_id;
        const uLastName = supplier.lastName ?? supplier.last_name;
        const uCountryId = supplier.countryId ?? supplier.country_id ?? supplier.country?.id;
        const uCountryName = supplier.countryName ?? supplier.country_name ?? supplier.country?.name;

        const countryCorrespondiente = countriesList.find(
          (c) => (c.id === uCountryId || c.country_id === uCountryId || c.name === uCountryName)
        );

        setFormData({
          id: uId || "",
          name: supplier.name || "",
          lastName: uLastName || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          address: supplier.address || "",
          countryName: countryCorrespondiente ? countryCorrespondiente.name : (uCountryName || ""),
        });
        console.log("¡proveedor cargado con éxito!", supplier);
      } else {
        alert("No se encontró el proveedor con ese ID");
      }
    } catch (error) {
      console.error(error);
      alert("Error al consultar el proveedor");
    }
  };

  // Permite que el formulario de actualización se envie
  const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();

  const formElements = e.target.elements;
  const supplierId = formElements.id?.value || formData.id || formData.productId;

    if (!supplierId || String(supplierId).trim() === "") {
      alert("Error: El ID del proveedor no puede estar vacío. Por favor, cargue un proveedor válido.");
      return;
    }

  const countryFound = Array.isArray(countriesList) && countriesList.find(
      (c) => c.name?.toLowerCase() === formData.countryName?.trim().toLowerCase()
    );

    if (!countryFound) {
      alert("Por favor, selecciona un país válido de la lista antes de actualizar.");
      return;
    }

  const payload = {
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      countryId: countryFound.id || countryFound.country_id
    };

    try {
      await updateSupplier(supplierId, payload);

      alert("¡Proveedor actualizado correctamente!");
      loadSuppliers();

      } catch (error){
      console.error("Error completo en la consola:", error.response?.data);
      alert("Error al actualizar: " + (error.response?.data?.message || "Revisa los datos"));
    }
  };

  useEffect(() => {
    if (activeTab === "create" && typeof tieneAcceso === "function" && !tieneAcceso(userRole, "crear")) setActiveTab("all");
    if (activeTab === "update" && typeof tieneAcceso === "function" && !tieneAcceso(userRole, "actualizar")) setActiveTab("all");
    if (activeTab === "delete" && typeof tieneAcceso === "function" && !tieneAcceso(userRole, "eliminar")) setActiveTab("all");
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

      {/* ALL SUPPLIERS */}
      {activeTab === "all" && !showWelcome && (
        <div className="fb-form-section">
          <div className="fb-section-header">
            <h3 className="fb-table-title">
              <i className="bi bi-truck" /> Mostrando todos los registros
            </h3>
            <span className="fb-badge">{allSuppliers.length} registros</span>
          </div>

          <div className="fb-results-grid fb-users-cards-margin">
            {Array.isArray(allSuppliers) && allSuppliers.length > 0 ? (
              allSuppliers.map((sup) => {
                const countryCorrespondiente = Array.isArray(countriesList) && countriesList.find(
                  (c) => (c.id === sup.countryId || c.country_id === sup.countryId)
                );

                return (
                  <div key={sup.id || sup.supplier_id} className="fb-user-display-card">
                    <div className="fb-card-user-info">
                      <h4 className="fb-card-user-title">
                        {sup.name} {sup.lastName || sup.last_name}
                      </h4>
                      <span className="fb-card-user-id">ID: {sup.id || sup.supplier_id}</span>
                    </div>
                    <div className="fb-card-user-body">
                      <p className="fb-card-user-detail">
                        <i className="bi bi-envelope" /> {sup.email}
                      </p>
                      <p className="fb-card-user-detail">
                        <i className="bi bi-telephone" /> {sup.phone}
                      </p>
                      <p className="fb-card-user-detail">
                        <i className="bi bi-geo-alt" /> {sup.address || "Sin dirección"}
                      </p>
                      <p className="fb-card-user-detail">
                        <i className="bi bi-globe" />
                        <span className="fb-country">
                          {countryCorrespondiente ? countryCorrespondiente.name : "Sin país"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="fb-empty fb-grid-full-width">
                <i className="bi bi-inbox" />
                <p>No hay proveedores registrados</p>
              </div>
            )}
          </div>
        </div>
      )}

        {/* SEARCH BY NAME */}
        {activeTab === "name" && !showWelcome && (
          <div className="fb-form-section">
            <div className="fb-form-card">
              <h3 className="fb-form-title"><i className="bi bi-search" /> Escriba un nombre del proveedor</h3>
              <form onSubmit={handleSearch} className="fb-search-form">
                <div className="fb-search-input-wrap">
                  <i className="bi bi-person fb-search-icon" />
                  <input type="text" className="fb-search-input" placeholder="Ej: Martin Antonio"
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button type="submit" className="fb-search-btn">
                  <i className="bi bi-search" /> Buscar proveedor
                </button>
              </form>
            </div>

            {suppliersByName.length > 0 && (
              <div className="fb-results-grid">
                {suppliersByName.map(sup => {
                  const countryCorrespondiente = Array.isArray(countriesList) && countriesList.find(
                    (c) => (c.id === sup.countryId || c.country_id === sup.countryId)
                  );

                  return (
                    <div key={sup.id || sup.supplier_id} className="fb-user-card">
                      <div>
                        <p className="fb-user-card-name">{sup.name} {sup.lastName || sup.last_name}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-envelope" /> {sup.email}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-telephone" /> {sup.phone}</p>
                        <p className="fb-user-card-detail"><i className="bi bi-geo-alt" /> {sup.address || "Sin dirección"}</p>
                        <p className="fb-user-card-detail">
                          <i className="bi bi-globe" />
                          {countryCorrespondiente ? countryCorrespondiente.name : "Sin país"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {search.trim() !== "" && suppliersByName.length === 0 && (
              <div className="fb-empty">
                <i className="bi bi-search" style={{ fontSize: "2rem" }} />
                <p>No se encontraron proveedores con ese nombre</p>
              </div>
            )}
          </div>
        )}

        {/* SEARCH BY ID */}
        {activeTab === "id" && !showWelcome && (
          <div className="fb-form-section">
            <div className="fb-form-card">
              <h3 className="fb-form-title"><i className="bi bi-search" /> Introduzca el ID del proveedor</h3>
              <form onSubmit={handleSearchById} className="fb-search-form">
                <div className="fb-search-input-wrap">
                  <i className="bi bi-person fb-search-icon" />
                  <input type="number" className="fb-search-input" placeholder="Ingrese ID"
                    value={searchId} onChange={e => setSearchId(e.target.value)} />
                </div>
                <button type="submit" className="fb-search-btn">
                  <i className="bi bi-search" /> Buscar proveedor
                </button>
              </form>
            </div>

            {supplierById && (() => {
              const countryCorrespondiente = Array.isArray(countriesList) && countriesList.find(
                (c) => (c.id === supplierById.countryId || c.country_id === supplierById.countryId)
              );

              return (
                <div className="fb-results-grid">
                  <div className="fb-user-card">
                    <div>
                      <p className="fb-user-card-name">
                        {supplierById?.name} {supplierById?.lastName || supplierById?.last_name}
                      </p>
                      <p className="fb-user-card-detail">
                        <i className="bi bi-envelope" /> {supplierById?.email}
                      </p>
                      <p className="fb-user-card-detail">
                        <i className="bi bi-telephone" /> {supplierById?.phone}
                      </p>
                      <p className="fb-user-card-detail">
                        <i className="bi bi-geo-alt" /> {supplierById?.address || "Sin dirección"}
                      </p>
                      <p className="fb-user-card-detail">
                        <i className="bi bi-globe" />{" "}
                        {countryCorrespondiente ? countryCorrespondiente.name : "Sin país"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {!supplierById && searchId && (
              <div className="fb-empty">
                <i className="bi bi-search" style={{ fontSize: "2rem" }} />
                <p>No se encontró proveedor con ese ID</p>
              </div>
            )}
          </div>
        )}

        {/* CREATE SUPPLIER */}
        {activeTab === "create" && !showWelcome && (
          <div className="fb-form-section fb-tab-create">
            <div className="fb-form-card">
              <h3 className="fb-form-title">
                <i className="bi bi-person-plus-fill" /> Introduzca los datos del nuevo proveedor
              </h3>
              <form onSubmit={handleCreateSubmit} className="fb-crud-form">
                <div className="fb-crud-grid">
                  {[
                    { label: "Nombre", name: "name", icon: "bi-person", placeholder: "Nombre" },
                    { label: "Apellido", name: "lastName", icon: "bi-person", placeholder: "Apellido" },
                    { label: "Teléfono", name: "phone", icon: "bi-telephone", placeholder: "7777-7777" },
                    { label: "Email", name: "email", icon: "bi-envelope", type: "email", placeholder: "correo@ejemplo.com" },
                    { label: "Dirección", name: "address", icon: "bi-geo-alt", placeholder: "Dirección completa" },
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
                  <i className="bi bi-person-check-fill" /> Crear proveedor
                </button>
              </form>
            </div>
          </div>
        )}

        {/* UPDATE SUPPLIER */}
        {activeTab === "update" && !showWelcome && (
          <div className="fb-form-section fb-tab-update">
            <div className="fb-form-card">
              <h3 className="fb-form-title"><i className="bi bi-pencil-square" /> Actualice el dato o los datos del proveedor</h3>
              <form onSubmit={handleUpdateSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="fb-crud-form">
                <div className="fb-crud-grid">
                  <div className="fb-crud-field">
                    <label className="fb-crud-label">ID proveedor</label>
                    <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
                      <div style={{ position: "relative", flex: 1 }}>
                        <i className="bi bi-hash fb-crud-input-icon" style={{ zIndex: 5 }} />
                        <input
                          type="number"
                          name="id"
                          className="fb-crud-input"
                          placeholder="ID del proveedor"
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
                    { label: "Dirección", name: "address", icon: "bi-geo-alt", placeholder: "Dirección" },
                  ].map((f) => (
                    <div key={f.name} className="fb-crud-field">
                      <label className="fb-crud-label">{f.label}</label>
                      <div className="fb-crud-input-wrap">
                        <i className={`bi ${f.icon} fb-crud-input-icon`} />
                        <input type={f.type || "text"} name={f.name} className="fb-crud-input"
                          placeholder={f.placeholder} value={formData[f.name] || ""}
                          onChange={handleChange} required />
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
                  <i className="bi bi-check-circle-fill" /> Actualizar proveedor
                </button>
              </form>
            </div>
          </div>
        )}

    {/* DELETE SUPPLIER */}
    {activeTab === "delete" && !showWelcome && (
      <div className="fb-form-section">
        <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
          <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
            <i className="bi bi-trash3-fill" /> Introduzca el ID del proveedor
          </h3>
          <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
            ⚠️ Al eliminar el proveedor se borrará permanentemente de su base de datos ⚠️
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const idValue = e.target.id.value;

              const confirmDelete = window.confirm(
                `¿Está seguro de que desea eliminar el proveedor con el ID ${idValue}?`
              );

              if (!confirmDelete) return;

              try {
                await deleteSupplier(idValue);
                alert("Proveedor eliminado correctamente");
                e.target.reset();
                loadSuppliers();
              } catch (error) {
                alert("Error al eliminar proveedor");
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
                placeholder="ID del proveedor a eliminar"
                required
              />
            </div>
            <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
              <i className="bi bi-trash3" /> Eliminar proveedor
            </button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}

export default Suppliers;