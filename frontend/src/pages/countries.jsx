import "../styles/forms.css";
import axios from "../services/axiosConfig.js";
import { tieneAcceso } from "../Config/permissions";
import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getAllCountries, getCountryById, createCountry,
    updateCountry, deleteCountry, searchCountriesByName
} from "../services/countryService.js";

function Countries() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole") || "CLIENTE";

    const [activeTab, setActiveTab] = useState(localStorage.getItem("activeCountryTab") || "all");
    const [showWelcome, setShowWelcome] = useState(true);

    const [allCountries, setAllCountries] = useState([]);
    const [countriesByName, setCountriesByName] = useState([]);
    const [countryById, setCountryById] = useState(null);
    const [search, setSearch] = useState("");
    const [searchId, setSearchId] = useState("");
    const [editSearchId, setEditSearchId] = useState("");

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
    });

    const loadCountries = async () => {
        try {
            const data = await getAllCountries();
            setAllCountries(data || []);
        } catch (error) {
            setAllCountries([]);
        }
    };

    // Controla los cambios en el sub menú de países
    useEffect(() => {
        localStorage.setItem("activeCountryTab", "home");
        setActiveTab("home");
        setShowWelcome(true);

        const handleCountryTabChange = () => {
            const tab = localStorage.getItem("activeCountryTab") || "home";
            setActiveTab(tab);

            if (tab === "home") {
                setShowWelcome(true);
            } else if (tab === "all") {
                setShowWelcome(false);
                if (typeof loadCountries === "function") {
                    loadCountries();
                }
            } else if (tab === "name" || tab === "id" || tab === "create" || tab === "update" || tab === "delete") {
                setShowWelcome(false);
            } else {
                setShowWelcome(false);
            }
        };
        window.addEventListener("countryTabChanged", handleCountryTabChange);

        return () => window.removeEventListener("countryTabChanged", handleCountryTabChange);
    }, []);

    // Se busca un país por nombre
    const handleSearch = async (e) => {
        e.preventDefault();
        if (search.trim() === "") {
            setCountriesByName([]);
            return;
        }
        try {
            const data = await searchCountriesByName(search);
            if (!data || !Array.isArray(data) || data.length === 0) {
                toast.error("No se encontró ningún país con ese nombre.");
                setCountriesByName([]);
            } else {
                setCountriesByName(data);
            }
        } catch (error) {
            setCountriesByName([]);
        }
    };

    // Se busca un país por ID
    const handleSearchById = async (e) => {
        e.preventDefault();

        if (searchId.trim() === "") {
            setCountryById(null);
            return;
        }
        try {
            const country = await getCountryById(searchId);
            if (!country) {
                toast.error("El país con ese ID no existe.");
                setCountryById(null);
            } else {
                setCountryById(country);
            }
        } catch (error) {
            setCountryById(null);
            toast.error("No se encontró el país con ese ID.");
        }
    };

    // Permite crear un nuevo registro de un país
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newCountry = Object.fromEntries(fd.entries());
        const payload = {
            name: newCountry.name,
            description: newCountry.description,
        };
        try {
            await createCountry(payload);
            toast.success("¡País creado con éxito!");
            e.target.reset();
            setTimeout(async () => {
                await loadCountries();
            }, 300);
        } catch (error) {
        }
    };

    // Actualiza un país
    const updateCountryById = async (id, payload) => {
        await updateCountry(id, payload);
        loadCountries();
    };

    const handleChange = (e) => setFormData({
        ...formData, [e.target.name]: e.target.value });

    // Controla la carga automática del formulario de actualización de país
    const handleBlurId = async (e) => {
        const targetValue = (e && e.target) ? e.target.value : e;
        if (!targetValue || String(targetValue).trim() === "") {
            toast.error("Por favor, ingresa un ID válido antes de cargar.");
            return;
        }
        try {
            const country = await getCountryById(targetValue);
            if (country) {
                const uId = country.id ?? country.country_id;
                const uDescription = country.description ??
                    country.country_description ?? country.description_field;
                setFormData({
                    id: uId || "",
                    name: country.name || "",
                    description: uDescription || "",
                });
                toast.success("¡País cargado con éxito!");
            } else {
                toast.error("No se encontró el país con ese ID");
            }
        } catch (error) {
            toast.error("No se encontró el país con ese ID.");
        }
    };

    // Permite que el formulario de actualización se envíe
    const handleUpdateSubmit = async (e) => {
        if (e) e.preventDefault();
        const formElements = e.target.elements;
        const countryId = formElements.id?.value || formData.id;
        if (!countryId || String(countryId).trim() === "") {
            toast.error("Error: El ID del país no puede estar vacío.");
            return;
        }
        const payload = {
            name: formData.name,
            description: formData.description,
        };
        try {
            await updateCountry(countryId, payload);
            toast.success("¡País actualizado correctamente!");
            setFormData({
                id: "",
                name: "",
                description: "",
            });
            setEditSearchId("");
            setTimeout(async () => {
                await loadCountries();
            }, 300);
        } catch (error) {
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

        {/* ALL COUNTRIES */}
        {activeTab === "all" && !showWelcome && (
          <div className="fb-form-section">
            <div className="fb-section-header">
               <h3 className="fb-table-title">
                <i className="bi bi-globe-americas" /> Mostrando todos los registros
                 </h3>
                  <span className="fb-badge">{allCountries.length} registros</span>
                  </div>
                   <div className="fb-results-grid fb-users-cards-margin">
                   {Array.isArray(allCountries) && allCountries.length > 0 ? (
                    allCountries.map((co) => {
                     return (
                    <div key={co.id || co.country_id} className="fb-user-display-card">
                   <div className="fb-card-user-info">
                  <h4 className="fb-card-user-title">{co.name}</h4>
                 <span className="fb-card-user-id">ID: {co.id || co.country_id}</span>
                </div>
                                    <div className="fb-card-user-body">
                                        <p className="fb-card-user-detail">
                                            <i className="bi bi-justify-left" /> {co.description || "Sin descripción"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="fb-empty fb-grid-full-width">
                            <i className="bi bi-inbox" />
                            <p>No hay países registrados</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* SEARCH BY NAME */}
        {activeTab === "name" && !showWelcome && (
            <div className="fb-form-section">
                <div className="fb-form-card">
                    <h3 className="fb-form-title">
                        <i className="bi bi-search" /> Escriba un nombre del país
                    </h3>
                    <form onSubmit={handleSearch} className="fb-search-form">
                        <div className="fb-search-input-wrap">
                            <i className="bi bi-globe fb-search-icon" />
                            <input
                                type="text"
                                className="fb-search-input"
                                placeholder="Ej: El Salvador"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="fb-search-btn">
                            <i className="bi bi-search" /> Buscar país
                        </button>
                    </form>
                </div>

                {countriesByName.length > 0 && (
                    <div className="fb-results-grid">
                        {countriesByName.map((co) => {
                            return (
                                <div key={co.id || co.country_id} className="fb-user-display-card">
                                    <div className="fb-card-user-info">
                                        <h4 className="fb-card-user-title">{co.name}</h4>
                                        <span className="fb-card-user-id">ID: {co.id || co.country_id}</span>
                                    </div>
                                    <div className="fb-card-user-body">
                                        <p className="fb-card-user-detail">
                                            <i className="bi bi-justify-left" /> {co.description || "Sin descripción"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}

        {/* SEARCH BY ID */}
        {activeTab === "id" && !showWelcome && (
            <div className="fb-form-section">
                <div className="fb-form-card">
                    <h3 className="fb-form-title">
                        <i className="bi bi-search" /> Introduzca el ID del país
                    </h3>
                    <form onSubmit={handleSearchById} className="fb-search-form">
                        <div className="fb-search-input-wrap">
                            <i className="bi bi-hash fb-search-icon" />
                            <input
                                type="number"
                                className="fb-search-input"
                                placeholder="Ingrese ID"
                                value={searchId}
                                onChange={e => setSearchId(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="fb-search-btn">
                            <i className="bi bi-search" /> Buscar país
                        </button>
                    </form>
                </div>

                {countryById && (
                    <div className="fb-results-grid">
                        <div className="fb-user-display-card">
                            <div className="fb-card-user-info">
                                <h4 className="fb-card-user-title">{countryById.name}</h4>
                                <span className="fb-card-user-id">
                    ID: {countryById.id || countryById.country_id}
                  </span>
                            </div>
                            <div className="fb-card-user-body">
                                <p className="fb-card-user-detail">
                                    <i className="bi bi-justify-left" /> {countryById.description || "Sin descripción"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* CREATE COUNTRY */}
        {activeTab === "create" && !showWelcome && (
            <div className="fb-form-section fb-tab-create">
                <div className="fb-form-card">
                    <h3 className="fb-form-title">
                        <i className="bi bi-globe-central-south-america" /> Introduzca los datos del nuevo país
                    </h3>
                    <form onSubmit={handleCreateSubmit} className="fb-crud-form">
                        <div className="fb-crud-grid">
                            {[
                                { label: "Nombre", name: "name", icon: "bi-globe", placeholder: "Nombre del país" },
                                { label: "Descripción", name: "description", icon: "bi-justify-left", placeholder: "Breve descripción" },
                            ].map((f) => (
                                <div key={f.name} className="fb-crud-field">
                                    <label className="fb-crud-label">{f.label}</label>
                                    <div className="fb-crud-input-wrap">
                                        <i className={`bi ${f.icon} fb-crud-input-icon`} />
                                        <input type="text" name={f.name} className="fb-crud-input" placeholder={f.placeholder} required />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)" }}>
                            <i className="bi bi-check-circle-fill" /> Crear país
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* UPDATE COUNTRY */}
        {activeTab === "update" && !showWelcome && (
            <div className="fb-form-section fb-tab-update">
                <div className="fb-form-card">
                    <h3 className="fb-form-title">
                        <i className="bi bi-pencil-square" /> Actualice el dato o los datos del país
                    </h3>
                    <form onSubmit={handleUpdateSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="fb-crud-form">
                        <div className="fb-crud-grid">
                            <div className="fb-crud-field">
                                <label className="fb-crud-label">ID país</label>
                                <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
                                    <div style={{ position: "relative", flex: 1 }}>
                                        <i className="bi bi-hash fb-crud-input-icon" style={{ zIndex: 5 }} />
                                        <input
                                            type="number"
                                            name="id"
                                            className="fb-crud-input"
                                            placeholder="ID del país"
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
                                { label: "Nombre", name: "name", icon: "bi-globe", placeholder: "Nombre del país" },
                                { label: "Descripción", name: "description", icon: "bi-justify-left", placeholder: "Breve descripción" },
                            ].map((f) => (
                                <div key={f.name} className="fb-crud-field">
                                    <label className="fb-crud-label">{f.label}</label>
                                    <div className="fb-crud-input-wrap">
                                        <i className={`bi ${f.icon} fb-crud-input-icon`} />
                                        <input
                                            type="text"
                                            name={f.name}
                                            className="fb-crud-input"
                                            placeholder={f.placeholder}
                                            value={formData[f.name] || ""}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#b45309,#fd7e14)", marginTop: "1.5rem" }}>
                            <i className="bi bi-check-circle-fill" /> Actualizar país
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* DELETE COUNTRY */}
        {activeTab === "delete" && !showWelcome && (
            <div className="fb-form-section">
                <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
                    <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
                        <i className="bi bi-trash3-fill" /> Introduzca el ID del país
                    </h3>
                    <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                        ⚠️ Al eliminar el país se borrará permanentemente de su base de datos ⚠️
                    </p>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target;
                            const idValue = form.id.value;
                            if (!idValue || String(idValue).trim() === "") {
                                toast.error("Por favor, ingresa un ID válido.");
                                return;
                            }
                            try {
                                const country = await getCountryById(idValue);
                                if (!country) {
                                    toast.error(`No se puede eliminar el país con ID ${idValue}.`);
                                    return;
                                }
                                toast((t) => (
                                    <div className="d-flex flex-column gap-2 text-center" style={{ minWidth: "250px" }}>
                      <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                        ¿Está seguro de que desea eliminar el país <strong>{country?.name || idValue}</strong>?
                      </span>
                                        <div className="d-flex justify-content-center gap-2 mt-1">
                                            <button
                                                className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
                                                style={{ borderRadius: "12px", fontSize: "0.85rem" }}
                                                onClick={async () => {
                                                    toast.dismiss(t.id);
                                                    try {
                                                        await deleteCountry(idValue);
                                                        toast.success(`País con ID ${idValue} eliminado correctamente.`);
                                                        form.reset();
                                                        setTimeout(async () => {
                                                            await loadCountries();
                                                        }, 300);
                                                    } catch (error) {
                                                        toast.error("Hubo un problema al ejecutar la eliminación.");
                                                    }
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                            <button
                                                className="btn btn-light btn-sm px-3 border shadow-sm"
                                                style={{ borderRadius: "12px", fontSize: "0.85rem" }}
                                                onClick={() => toast.dismiss(t.id)}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ), {
                                    duration: Infinity,
                                    position: "top-center"
                                });
                            } catch (error) {
                                toast.error(`No se encontró el país con ID ${idValue}.`);
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
                                placeholder="ID del país a eliminar"
                                required
                            />
                        </div>
                        <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
                            <i className="bi bi-trash3" /> Eliminar país
                        </button>
                    </form>
                </div>
            </div>
        )}

    </div>
);
}

export default Countries;