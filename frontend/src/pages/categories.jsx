import "../styles/forms.css";
import axios from "../services/axiosConfig.js";
import { tieneAcceso } from "../Config/permissions";
import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getAllCategories, getCategoryById, createCategory,
    updateCategory, deleteCategory, searchCategoriesByName
} from "../services/categoryService.js";

function Categories() {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole") || "CLIENTE";

    const [activeTab, setActiveTab] = useState(localStorage.getItem("activeCategoryTab") || "all");
    const [showWelcome, setShowWelcome] = useState(true);

    const [allCategories, setAllCategories] = useState([]);
    const [categoriesByName, setCategoriesByName] = useState([]);
    const [categoryById, setCategoryById] = useState(null);
    const [search, setSearch] = useState("");
    const [searchId, setSearchId] = useState("");
    const [editSearchId, setEditSearchId] = useState("");

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
    });

    const loadCategories = async () => {
        try {
            const data = await getAllCategories();
            setAllCategories(data || []);
        } catch (error) {
            setAllCategories([]);
        }
    };

    // Controla los cambios en el sub menú de categorías
    useEffect(() => {
        localStorage.setItem("activeCategoryTab", "home");
        setActiveTab("home");
        setShowWelcome(true);

        const handleCategoryTabChange = () => {
            const tab = localStorage.getItem("activeCategoryTab") || "home";
            setActiveTab(tab);

            if (tab === "home") {
                setShowWelcome(true);
            } else if (tab === "all") {
                setShowWelcome(false);
                if (typeof loadCategories === "function") {
                    loadCategories();
                }
            } else if (tab === "name" || tab === "id" || tab === "create" || tab === "update" || tab === "delete") {
                setShowWelcome(false);
            } else {
                setShowWelcome(false);
            }
        };
        window.addEventListener("categoryTabChanged", handleCategoryTabChange);

        return () => window.removeEventListener("categoryTabChanged", handleCategoryTabChange);
    }, []);

    // Se busca una categoría por nombre
    const handleSearch = async (e) => {
        e.preventDefault();

        if (search.trim() === "") {
            setCategoriesByName([]);
            return;
        }

        try {
            const data = await searchCategoriesByName(search);

            if (!data || !Array.isArray(data) || data.length === 0) {
                toast.error("No se encontró ninguna categoría con ese nombre.");
                setCategoriesByName([]);
            } else {
                setCategoriesByName(data);
            }
        } catch (error) {
            setCategoriesByName([]);
        }
    };

    // Se busca una categoría por ID
    const handleSearchById = async (e) => {
        e.preventDefault();

        if (searchId.trim() === "") {
            setCategoryById(null);
            return;
        }
        try {
            const category = await getCategoryById(searchId);

            if (!category) {
                toast.error("La categoría con ese ID no existe.");
                setCategoryById(null);
            } else {
                setCategoryById(category);
            }
        } catch (error) {
            setCategoryById(null);
            toast.error("No se encontró la categoría con ese ID.");
        }
    };

    // Permite crear un nuevo registro de una categoría
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const newCategory = Object.fromEntries(fd.entries());

        const payload = {
            name: newCategory.name,
            description: newCategory.description,
        };

        try {
            await createCategory(payload);
            toast.success("¡Categoría creada con éxito!");
            e.target.reset();

            setTimeout(async () => {
                await loadCategories();
            }, 300);
        } catch (error) {
        }
    };

    // Actualiza una categoría
    const updateCategoryById = async (id, payload) => {
        await updateCategory(id, payload);
        loadCategories();
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // Controla la carga automática del formulario de actualización de categoría
    const handleBlurId = async (e) => {
        const targetValue = (e && e.target) ? e.target.value : e;
        if (!targetValue || String(targetValue).trim() === "") {
            toast.error("Por favor, ingresa un ID válido antes de cargar.");
            return;
        }

        try {
            const category = await getCategoryById(targetValue);

            if (category) {
                const uId = category.id ?? category.category_id;
                const uDescription = category.description ?? category.description_field;

                setFormData({
                    id: uId || "",
                    name: category.name || "",
                    description: uDescription || "",
                });
                toast.success("¡Categoría cargada con éxito!");
            } else {
                toast.error("No se encontró la categoría con ese ID");
            }
        } catch (error) {
            toast.error("No se encontró la categoría con ese ID.");
        }
    };

    // Permite que el formulario de actualización se envíe
    const handleUpdateSubmit = async (e) => {
        if (e) e.preventDefault();

        const formElements = e.target.elements;
        const categoryId = formElements.id?.value || formData.id;

        if (!categoryId || String(categoryId).trim() === "") {
            toast.error("Error: El ID de la categoría no puede estar vacío.");
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
        };

        try {
            await updateCategory(categoryId, payload);
            toast.success("¡Categoría actualizada correctamente!");

            setFormData({
                id: "",
                name: "",
                description: "",
            });

            setEditSearchId("");

            setTimeout(async () => {
                await loadCategories();
            }, 300);
        } catch (error) {
        }
    }

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

            {/* ALL CATEGORIES */}
            {activeTab === "all" && !showWelcome && (
              <div className="fb-form-section">
                <div className="fb-section-header">
                 <h3 className="fb-table-title">
                  <i className="bi bi-tags" /> Mostrando todos los registros
                    </h3>
                    <span className="fb-badge">{allCategories.length} registros</span>
                   </div>
                   <div className="fb-results-grid fb-users-cards-margin">
                  {Array.isArray(allCategories) && allCategories.length > 0 ? (
                  allCategories.map((cat) => {
                 return (
                  <div key={cat.id || cat.category_id} className="fb-user-display-card">
                   <div className="fb-card-user-info">
                     <h4 className="fb-card-user-title">
                       {cat.name}
                        </h4>
                         <span className="fb-card-user-id">ID: {cat.id || cat.category_id}</span>
                           </div>
                          <div className="fb-card-user-body">
                         <p className="fb-card-user-detail">
                        <i className="bi bi-justify-left" /> {cat.description || "Sin descripción"}
                      </p>
                     </div>
                    </div>
                  );
                 })
               ) : (
                <div className="fb-empty fb-grid-full-width">
                <i className="bi bi-inbox" />
                 <p>No hay categorías registradas</p>
                 </div>
                 )}
               </div>
             </div>
            )}

            {/* SEARCH BY NAME */}
            {activeTab === "name" && !showWelcome && (
             <div className="fb-form-section">
               <div className="fb-form-card">
                 <h3 className="fb-form-title"><i className="bi bi-search" /> Escriba un nombre de la categoría</h3>
                  <form onSubmit={handleSearch} className="fb-search-form">
                   <div className="fb-search-input-wrap">
                    <i className="bi bi-tag fb-search-icon" />
                     <input type="text" className="fb-search-input" placeholder="Ej: Frutas "
                      value={search} onChange={e => setSearch(e.target.value)} />
                       </div>
                        <button type="submit" className="fb-search-btn">
                          <i className="bi bi-search" /> Buscar categoría
                          </button>
                        </form>
                    </div>
                    {categoriesByName.length > 0 && (
                      <div className="fb-results-grid">
                       {categoriesByName.map(cat => {
                        return (
                         <div key={cat.id || cat.category_id} className="fb-user-display-card">
                          <div className="fb-card-user-info">
                           <h4 className="fb-card-user-title">
                           {cat.name}
                           </h4>
                           <span className="fb-card-user-id">ID: {cat.id || cat.category_id}</span>
                           </div>
                          <div className="fb-card-user-body">
                        <p className="fb-card-user-detail">
                      <i className="bi bi-justify-left" /> {cat.description || "Sin descripción"}
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
               <h3 className="fb-form-title"><i className="bi bi-search" /> Introduzca el ID de la categoría</h3>
                <form onSubmit={handleSearchById} className="fb-search-form">
                 <div className="fb-search-input-wrap">
                  <i className="bi bi-hash fb-search-icon" />
                   <input type="number" className="fb-search-input" placeholder="Ingrese ID"
                    value={searchId} onChange={e => setSearchId(e.target.value)} />
                   </div>
                  <button type="submit" className="fb-search-btn">
                  <i className="bi bi-search" /> Buscar categoría
                  </button>
                  </form>
                  </div>
                 {categoryById && (
                   <div className="fb-results-grid">
                     <div className="fb-user-display-card">
                        <div className="fb-card-user-info">
                         <h4 className="fb-card-user-title">
                        {categoryById.name}
                        </h4>
                       <span className="fb-card-user-id">
                      ID: {categoryById.id || categoryById.category_id}
                     </span>
                    </div>
                   <div className="fb-card-user-body">
                  <p className="fb-card-user-detail">
                 <i className="bi bi-justify-left" /> {categoryById.description || "Sin descripción"}
               </p>
              </div>
             </div>
            </div>
           )}
         </div>
       )}

            {/* CREATE CATEGORY */}
            {activeTab === "create" && !showWelcome && (
                <div className="fb-form-section fb-tab-create">
                    <div className="fb-form-card">
                      <h3 className="fb-form-title">
                       <i className="bi bi-tag-fill" /> Introduzca los datos de la nueva categoría
                       </h3>
                       <form onSubmit={handleCreateSubmit} className="fb-crud-form">
                        <div className="fb-crud-grid">
                        {[
                         { label: "Nombre", name: "name", icon: "bi-tag", placeholder: "Nombre de la categoría" },
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
                  <i className="bi bi-check-circle-fill" /> Crear categoría
                 </button>
                </form>
               </div>
             </div>
            )}

            {/* UPDATE CATEGORY */}
            {activeTab === "update" && !showWelcome && (
              <div className="fb-form-section fb-tab-update">
               <div className="fb-form-card">
                <h3 className="fb-form-title"><i className="bi bi-pencil-square" /> Actualice el dato o los datos de la categoría</h3>
                 <form onSubmit={handleUpdateSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="fb-crud-form">
                   <div className="fb-crud-grid">
                     <div className="fb-crud-field">
                      <label className="fb-crud-label">ID categoría</label>
                        <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
                         <div style={{ position: "relative", flex: 1 }}>
                           <i className="bi bi-hash fb-crud-input-icon" style={{ zIndex: 5 }} />
                             <input
                             type="number"
                              name="id"
                              className="fb-crud-input"
                              placeholder="ID de la categoría"
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
                     { label: "Nombre", name: "name", icon: "bi-tag", placeholder: "Nombre de la categoría" },
                    { label: "Descripción", name: "description", icon: "bi-justify-left", placeholder: "Breve descripción" },
                     ].map((f) => (
                     <div key={f.name} className="fb-crud-field">
                     <label className="fb-crud-label">{f.label}</label>
                      <div className="fb-crud-input-wrap">
                       <i className={`bi ${f.icon} fb-crud-input-icon`} />
                      <input type="text" name={f.name} className="fb-crud-input"
                      placeholder={f.placeholder} value={formData[f.name] || ""}
                     onChange={handleChange} required />
                     </div>
                   </div>
                  ))}
                  </div>
                 <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#b45309,#fd7e14)", marginTop: "1.5rem" }}>
                 <i className="bi bi-check-circle-fill" /> Actualizar categoría
                 </button>
                </form>
               </div>
             </div>
            )}

            {/* DELETE CATEGORY */}
            {activeTab === "delete" && !showWelcome && (
                <div className="fb-form-section">
                  <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
                  <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
                 <i className="bi bi-trash3-fill" /> Introduzca el ID de la categoría
               </h3>
               <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                ⚠️ Al eliminar la categoría se borrará permanentemente de su base de datos ⚠️
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
                      const category = await getCategoryById(idValue);
                      if (!category) {
                       toast.error(`No se puede eliminar la categoría con ID ${idValue}.`);
                       return;
                       }
                     toast((t) => (
                   <div className="d-flex flex-column gap-2 text-center" style={{ minWidth: "250px" }}>
                 <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                  ¿Está seguro de que desea eliminar la categoría de <strong>{category?.name || idValue}</strong>?
                   </span>
                     <div className="d-flex justify-content-center gap-2 mt-1">
                      <button
                      className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
                       style={{ borderRadius: "12px", fontSize: "0.85rem" }}
                        onClick={async () => {
                         toast.dismiss(t.id);
                          try {
                          await deleteCategory(idValue);
                           toast.success(`Categoría con ID ${idValue} eliminada correctamente.`);
                          form.reset();
                         setTimeout(async () => {
                        await loadCategories();
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
                      toast.error(`No se encontró la categoría con ID ${idValue}.`);
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
                    placeholder="ID de la categoría a eliminar"
                    required
                    />
                  </div>
                <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
               <i className="bi bi-trash3" /> Eliminar categoría
              </button>
           </form>
         </div>
       </div>
      )}
  </div>
 );
}

export default Categories;