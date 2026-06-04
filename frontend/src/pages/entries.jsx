
import "../styles/forms.css";
import axios from "../services/axiosConfig.js";
import { tieneAcceso } from "../config/permissions.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllEntries, getEntryById, createEntry,
  updateEntry, deleteEntry
} from "../services/entryService.js";

function Entries () {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "USUARIO";

  const userLogin = localStorage.getItem("userName") || localStorage.getItem("userEmail") || "";
  const isAdminOrSupport = ["ADMINISTRADOR", "ADMIN", "SOPORTE"].includes(userRole.toUpperCase());

  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeEntryTab") || "all");
  const [showWelcome, setShowWelcome] = useState(true);

  const [searchId, setSearchId] = useState("");
  const [entryById, setEntryById] = useState(null);
  const [allEntries, setAllEntries] = useState([]);

  // Estados para las listas de los Datalists
  const [productsList, setProductsList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [formData, setFormData] = useState({
    entryId: "", entryDate: "", unitCost: "", quantity: "", productName: "",
    supplierName: "", userName: userLogin
  });

  const [editSearchId, setEditSearchId] = useState("");

  // Controla los cambios en el sub menu de entradas
  useEffect(() => {
    localStorage.setItem("activeEntryTab", "home");
    setActiveTab("home");
    setShowWelcome(true);

    const handleEntryTabChange = () => {
      const tab = localStorage.getItem("activeEntryTab") || "home";
      setActiveTab(tab);

      if (tab === "home") {
        setShowWelcome(true);
      } else if (tab === "all") {
        setShowWelcome(false);
        if (typeof loadEntries === "function") {
          loadEntries();
        }
      } else if ( tab === "id" || tab === "create" || tab === "update" || tab === "delete") {
        setShowWelcome(false);
      } else {
        setShowWelcome(false);
      }
    };
    window.addEventListener("entryTabChanged", handleEntryTabChange);

    return () => window.removeEventListener("entryTabChanged", handleEntryTabChange);
  }, []);


  const loadDependencies = async () => {
    try {

      const promesas = [
        axios.get("http://192.168.1.60:8080/api/products"),
        axios.get("http://192.168.1.60:8080/api/suppliers")
      ];

      if (isAdminOrSupport) {
        promesas.push(axios.get("http://192.168.1.60:8080/api/users"));
      }

      const resultados = await Promise.all(promesas);

      const productsActives = (resultados[0].data || []).filter(p => p.active === true || p.active === undefined);

      setProductsList(productsActives);
      setSuppliersList(resultados[1].data || []);

      if (isAdminOrSupport && resultados[2]) {
        setUsersList(resultados[2].data || []);
      }
    } catch (error) {
      console.error("Error al cargar dependencias en entradas:", error);
    }
  };


  const loadEntries = async () => {
    try {
      const data = await getAllEntries();
      setAllEntries(data || []);
    } catch (error) {
      setAllEntries([]);
    }
  };

  // Disparador inicial de datos estáticos
  useEffect(() => {
    loadDependencies();
  }, []);


  const handleSearchById = async (e) => {
    e.preventDefault();
    if (searchId.trim() === "") { setEntryById(null); return; }
    try {
      const entry = await getEntryById(searchId);
      if (!entry) {
        toast.error("La entrada con ese ID no existe.");
        setEntryById(null);
      } else {
        setEntryById(entry);
      }
    } catch (error) {
      setEntryById(null);
      toast.error("La entrada con ese ID no existe.");
    }
  };

  // Manejador del cambio de inputs (Edición)
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBlurId = async (e) => {
    const targetValue = (e && e.target) ? e.target.value : e;

    if (!targetValue || String(targetValue).trim() === "") {
      setFormData({
        entryId: "", entryDate: "", unitCost: "", quantity: "", productName: "",
        supplierName: "", userName: userLogin
      });
      return;
    }

    try {
      const entry = await getEntryById(targetValue);

      if (entry) {
        const nombreProducto = entry.productName || (entry.product && entry.product.name);
        const isActive = productsList.some(p => p.name === nombreProducto || p.productName === nombreProducto);

        if (!isActive) {
          toast.error("Esta entrada pertenece a un producto eliminado y no puede modificarse.");
          setFormData({
            entryId: "", entryDate: "", unitCost: "", quantity: "", productName: "",
            supplierName: "", userName: userLogin
          });
          return;
        }

        setFormData({
          entryId: entry.id || entry.entryId || targetValue,
          entryDate: entry.entryDate || "",
          unitCost: entry.unitCost || "",
          quantity: entry.quantity || "",
          productName: nombreProducto || "",
          supplierName: entry.supplierName || "",
          userName: entry.userName || userLogin
        });
        toast.success("¡Entrada cargada con éxito!");

      } else {
        setFormData({
          entryId: targetValue, entryDate: "", unitCost: "", quantity: "",
          productName: "", supplierName: "", userName: userLogin
        });
        toast.error("No se encontró una entrada con ese ID");
      }
    } catch (error) {
      setFormData({
        entryId: targetValue, entryDate: "", unitCost: "", quantity: "",
        productName: "", supplierName: "", userName: userLogin
      });
      toast.error("No se encontró una entrada con ese ID.");
    }
  };

  // Actualizar una entrada de un producto
  const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.entryId || String(formData.entryId).trim() === "") {
      toast.error("Por favor, carga una entrada válida antes de actualizar.");
      return;
    }

    const productValid = productsList.find(p => p.name === formData.productName || p.productName === formData.productName);

    if (!productValid) {
      toast.error("No se puede actualizar: El producto asignado está inactivo o no existe.");
      return;
    }

    try {
      const entryCheck = await getEntryById(formData.entryId);

      if (!entryCheck) {
        toast.error(`No se puede actualizar: La entrada con ID ${formData.entryId} no existe.`);
        return;
      }

      const updatedData = {
        ...formData,
        userName: userLogin
      };

      await updateEntry(formData.entryId, updatedData);
      toast.success("Entrada actualizada correctamente");

      setFormData({
        entryId: "", entryDate: "", unitCost: "", quantity: "", productName: "",
        supplierName: "", userName: userLogin
      });

      setEditSearchId("");

      setTimeout(async () => {
        if (typeof loadEntries === "function") {
          await loadEntries();
        }
      }, 300);

    } catch (error) {
      toast.error(`No se puede actualizar: La entrada con ID ${formData.entryId} no existe.`);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = e.target;
      const pName = form.productName.value;
      const productValid = productsList.find(p => p.name === pName || p.productName === pName);

      if (!productValid) {
        toast.error("El producto seleccionado no existe. No se puede crear la entrada.");
        return;
      }
      
      const newEntry = {
        unitCost: form.unitCost.value,
        quantity: form.quantity.value,
        productName: form.productName.value,
        supplierName: form.supplierName.value,
        userName: userLogin
      };

      await createEntry(newEntry);
      toast.success("Entrada creada con éxito");

      form.reset();

      setFormData({
        entryId: "",
        entryDate: "",
        unitCost: "",
        quantity: "",
        productName: "",
        supplierName: "",
        userName: userLogin
      });

      setTimeout(async () => {
        if (typeof loadEntries === "function") {
          await loadEntries();
        }
      }, 300);

    } catch (error) {
      console.error("Error al crear la entrada:", error);
      toast.error("Hubo un problema al registrar la entrada.");
    }
  };


  // Redirección de seguridad si cambiamos de rol o pestaña
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

       {/* ALL ENTRIES */}
       {activeTab === "all" && (
         <div className="fb-form-section">
           <div className="fb-section-header">
             <h3 className="fb-table-title">
               <i className="bi bi-box-seam-fill" /> Mostrando todos los registros
             </h3>
             <span className="fb-badge">{allEntries.length} registros</span>
           </div>
           <div className="fb-results-grid fb-users-cards-margin">
             {Array.isArray(allEntries) && allEntries.length > 0 ? (
               allEntries.map((entry) => (
                 <div key={entry.id || entry.entryId} className="fb-user-display-card">
                   <div className="fb-card-user-info">
                     <h4 className="fb-card-user-title">
                       {entry.productName}
                     </h4>
                     <span className="fb-card-user-id">ID: {entry.id || entry.entryId}</span>
                   </div>
                   <div className="fb-card-user-body">
                     <p className="fb-card-user-detail">
                       <i className="bi bi-calendar-event" /> fecha registrada: {entry.entryDate}
                     </p>
                     <p className="fb-card-user-detail">
                       <i className="bi bi-currency-dollar" /> Costo Unitario: $ {entry.unitCost}
                     </p>
                     <p className="fb-card-user-detail">
                       <i className="bi bi-layers" /> Cantidad: {entry.quantity}
                     </p>
                     <p className="fb-card-user-detail">
                       <i className="bi bi-building" /> Proveedor: {entry.supplierName || "Sin proveedor"}
                     </p>
                     <p className="fb-card-user-detail">
                       <i className="bi bi-person" /> Usuario: {entry.userName || "Sin usuario"}
                     </p>
                   </div>
                 </div>
               ))
             ) : (
               <div className="fb-empty fb-grid-full-width">
                 <i className="bi bi-inbox" />
                 <p>No hay entradas registradas</p>
               </div>
             )}
           </div>
         </div>
       )}

       {/* SEARCH BY ID */}
       {activeTab === "id" && (
         <div className="fb-form-section">
           <div className="fb-form-card">
             <h3 className="fb-form-title"><i className="bi bi-search" /> Introduzca el ID de la entrada</h3>
             <form onSubmit={handleSearchById} className="fb-search-form">
               <div className="fb-search-input-wrap">
                 <i className="bi bi-hash fb-search-icon" />
                 <input type="number" className="fb-search-input" placeholder="Ingrese ID de entrada"
                   value={searchId} onChange={e => setSearchId(e.target.value)} />
               </div>
               <button type="submit" className="fb-search-btn">
                 <i className="bi bi-search" /> Buscar entrada
               </button>
             </form>
           </div>
           {entryById && (
                 <div className="fb-results-grid">
                   <div className="fb-user-card">
                     <div>
                       <p className="fb-user-card-name">{entryById.productName}</p>
                       <p className="fb-user-card-detail"><i className="bi bi-calendar-event" /> Fecha registrada: {entryById.entryDate}</p>
                       <p className="fb-user-card-detail"><i className="bi bi-currency-dollar" /> Costo Unitario: ${entryById.unitCost}</p>
                       <p className="fb-user-card-detail"><i className="bi bi-layers" /> Cantidad: {entryById.quantity}</p>
                       <p className="fb-user-card-detail"><i className="bi bi-building" /> Proveedor: {entryById.supplierName || "Sin proveedor"}</p>
                       <p className="fb-user-card-detail"><i className="bi bi-person" /> Usuario: {entryById.userName || "Sin usuario"}</p>
                     </div>
                   </div>
                 </div>
               )}
             </div>
           )}

       {/* CREATE ENTRY */}
        {activeTab === "create" && (
         <div className="fb-form-section fb-tab-create">
           <div className="fb-form-card">
             <h3 className="fb-form-title">
               <i className="bi bi-box-seam-fill" /> Introduzca los datos de la nueva entrada
             </h3>
             <form onSubmit={handleCreateSubmit} className="fb-crud-form">
               <div className="fb-crud-grid">
                   {/* Datalist Producto */}
                   <div className="fb-crud-field">
                    <label className="fb-crud-label">Producto</label>
                    <div className="fb-crud-input-wrap">
                    <i className="bi bi-tag fb-crud-input-icon" />
                   <input
                    type="text"
                    name="productName"
                    list={`products-options-${productsList.length}`}
                    className="fb-crud-input"
                    placeholder="Selecciona o escribe un producto"
                    required
                    autoComplete="off"
                    />
                   <datalist id={`products-options-${productsList.length}`}>
                  {Array.isArray(productsList) && productsList.map((p, idx) => (
                 <option key={p.id || idx} value={p.name || p.productName} />
                ))}
               </datalist>
              </div>
             </div>
             {[
             { label: "Costo unitario", name: "unitCost", icon: "bi-currency-dollar", type: "number", placeholder: "0.00" },
                   { label: "Cantidad", name: "quantity", icon: "bi-layers", type: "number", placeholder: "0" },
                 ].map((f) => (
                 <div key={f.name} className="fb-crud-field">
                   <label className="fb-crud-label">{f.label}</label>
                   <div className="fb-crud-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>

                     {f.name === "unitCost" ? (
                         <span
                             className="fb-crud-input-icon-text"
                             style={{
                               position: "absolute", left: "14px", color: "#6c757d", fontWeight: "600", fontSize: "0.85rem", pointerEvents: "none"}}>$</span>
                     ) : (
                         <i className={`bi ${f.icon} fb-crud-input-icon`} />
                     )}
                     <input type={f.type || "text"} name={f.name} className="fb-crud-input" placeholder={f.placeholder} required step={f.name === "unitCost" ? "0.01" : "1"}
                         style={{paddingLeft: f.name === "unitCost" ? "30px" : ""}}/>
                   </div>
                 </div>
                 ))}

                 {/* Datalist Proveedor */}
                 <div className="fb-crud-field">
                   <label className="fb-crud-label">Proveedor</label>
                   <div className="fb-crud-input-wrap">
                     <i className="bi bi-building fb-crud-input-icon" />
                     <input
                       type="text"
                       name="supplierName"
                       list={`suppliers-options-${suppliersList.length}`}
                       className="fb-crud-input"
                       placeholder="Selecciona o escribe un proveedor"
                       required
                       autoComplete="off"
                     />
                     <datalist id={`suppliers-options-${suppliersList.length}`}>
                       {Array.isArray(suppliersList) && suppliersList.map((s, idx) => (
                         <option key={s.id || idx}
                         value={`${s.name || s.supplierName || ""} ${s.lastName || ""}`.trim()} />
                       ))}
                     </datalist>
                   </div>
                 </div>

                 {/* Campo de Usuario */}
                 <div className="fb-crud-field">
                   <label className="fb-crud-label">Usuario que registra</label>
                   <div className="fb-crud-input-wrap">
                     <i className="bi bi-person fb-crud-input-icon" />
                     <input
                         type="text"
                         name="userName"
                         className="fb-crud-input"
                         placeholder="Usuario que registra"
                         defaultValue={userLogin}
                         readOnly
                         style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed", fontWeight: "bold" }}
                         required
                         autoComplete="off"
                     />
                   </div>
                 </div>
               </div>

               <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)" }}>
                 <i className="bi bi-check-circle-fill" /> Crear entrada
               </button>
             </form>
           </div>
         </div>
       )}

       {/* UPDATE ENTRY */}
       {activeTab === "update" && (
         <div className="fb-form-section fb-tab-update">
           <div className="fb-form-card">
             <h3 className="fb-form-title"><i className="bi bi-pencil-square" /> Actualice el dato o los datos de la entrada</h3>
             <form onSubmit={handleUpdateSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="fb-crud-form">
               <div className="fb-crud-grid">
                 <div className="fb-crud-field">
                   <label className="fb-crud-label">ID entrada</label>
                   <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
                     <div style={{ position: "relative", flex: 1 }}>
                       <i className="bi bi-hash fb-crud-input-icon" style={{ zIndex: 5 }} />
                       <input
                         type="number"
                         name="entryId"
                         className="fb-crud-input"
                         placeholder="ID de la entrada"
                         value={formData.entryId || ""}
                         onChange={handleChange}
                         required
                       />
                     </div>
                     <button
                       type="button"
                       className="fb-search-btn"
                       style={{ padding: "0 15px", whiteSpace: "nowrap", borderRadius: "8px" }}
                       onClick={() => handleBlurId(formData.entryId)}
                     >
                       Cargar
                     </button>
                   </div>
                 </div>

                 {[
                   { label: "Costo unitario", name: "unitCost", icon: "bi-currency-dollar", type: "number", placeholder: "0.00" },
                   { label: "Cantidad", name: "quantity", icon: "bi-layers", type: "number", placeholder: "0" },
                 ].map((f) => (
                   <div key={f.name} className="fb-crud-field">
                     <label className="fb-crud-label">{f.label}</label>
                     <div className="fb-crud-input-wrap">
                       <i className={`bi ${f.icon} fb-crud-input-icon`} />
                       <input
                         type={f.type || "text"}
                         name={f.name}
                         className="fb-crud-input"
                         placeholder={f.placeholder}
                         value={formData[f.name] || ""}
                         onChange={handleChange}
                         required
                         step={f.name === "unitCost" ? "0.01" : "1"}
                       />
                     </div>
                   </div>
                 ))}

                 {/* Datalist Producto */}
                 <div className="fb-crud-field">
                   <label className="fb-crud-label">Producto</label>
                   <div className="fb-crud-input-wrap">
                     <i className="bi bi-tag fb-crud-input-icon" />
                     <input
                       type="text"
                       name="productName"
                       list={`products-update-options-${productsList.length}`}
                       className="fb-crud-input"
                       placeholder="Selecciona o escribe un producto"
                       value={formData.productName || ""}
                       onChange={handleChange}
                       required
                       autoComplete="off"
                     />
                     <datalist id={`products-update-options-${productsList.length}`}>
                       {Array.isArray(productsList) && productsList.map((p, idx) => (
                         <option key={p.id || idx} value={p.name || p.productName} />
                       ))}
                     </datalist>
                   </div>
                 </div>

                 {/* Datalist Proveedor */}
                 <div className="fb-crud-field">
                   <label className="fb-crud-label">Proveedor</label>
                   <div className="fb-crud-input-wrap">
                     <i className="bi bi-building fb-crud-input-icon" />
                     <input
                       type="text"
                       name="supplierName"
                       list={`suppliers-update-options-${suppliersList.length}`}
                       className="fb-crud-input"
                       placeholder="Selecciona o escribe un proveedor"
                       value={formData.supplierName || ""}
                       onChange={handleChange}
                       required
                       autoComplete="off"
                     />
                     <datalist id={`suppliers-update-options-${suppliersList.length}`}>
                       {Array.isArray(suppliersList) && suppliersList.map((s, idx) => (
                         <option key={s.id || idx} value={`${s.name || s.supplierName || ""} ${s.lastName || s.last_name || ""}`.trim()} />
                       ))}
                     </datalist>
                   </div>
                 </div>

                 {/* Datalist Usuario */}
                 <div className="fb-crud-field">
                   <label className="fb-crud-label">Usuario Responsable</label>
                   <div className="fb-crud-input-wrap">
                     <i className="bi bi-person fb-crud-input-icon" />
                     <input
                       type="text"
                       name="userName"
                       list={`users-update-options-${usersList.length}`}
                       className="fb-crud-input"
                       placeholder="Selecciona o escribe el usuario"
                       value={formData.userName || ""}
                       onChange={handleChange}
                       required
                       autoComplete="off"
                     />
                     <datalist id={`users-update-options-${usersList.length}`}>
                       {Array.isArray(usersList) && usersList.map((u, idx) => (
                         <option key={u.id || idx} value={`${u.name || u.supplierName || ""} ${u.lastName || u.last_name || ""}`.trim()} />
                       ))}
                     </datalist>
                   </div>
                 </div>
               </div>

               <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#b45309,#fd7e14)", marginTop: "1.5rem" }}>
                 <i className="bi bi-check-circle-fill" /> Actualizar entrada
               </button>
             </form>
           </div>
         </div>
       )}

        {/* DELETE ENTRY */}
      {activeTab === "delete" && (
      <div className="fb-form-section">
        <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
            <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
                <i className="bi bi-trash3-fill" /> Introduzca el ID de la entrada
            </h3>
            <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                ⚠️ Al eliminar la entrada se removerá permanentemente de su base de datos ⚠️
            </p>
            <form
             onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target;
              const idValue = form.entryId.value;
               if (!idValue || String(idValue).trim() === "") {
               toast.error("Por favor, ingresa un ID válido.");
               return;
               }
               try {
                const entry = await getEntryById(idValue);
                 if (!entry) {
                 toast.error(`No se puede eliminar la entrada con ID ${idValue}.`);
                  return;
                   }
                   const nombreProducto = entry.productName;
                   const estaActivo = productsList.some((p) => p.name === nombreProducto);
                    if (!estaActivo) {
                     toast.error("No se puede eliminar esta entrada, pertenece a un producto eliminado.");
                      return;
                      }
                      toast((t) => (
                       <div className="d-flex flex-column gap-2 text-center" style={{ minWidth: "250px" }}>
                        <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                         ¿Está seguro de que desea eliminar la entrada con el ID <strong>{idValue}</strong>?
                          </span>
                            <div className="d-flex justify-content-center gap-2 mt-1">
                              <button
                                className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
                                 style={{ borderRadius: "12px", fontSize: "0.85rem" }}
                                  onClick={async () => {
                                   toast.dismiss(t.id);
                                   try {
                                  await deleteEntry(idValue);
                                  toast.success(`Entrada con ID ${idValue} eliminada correctamente.`);
                                 form.reset();
                                if (typeof setFormData === "function") {
                               setFormData({
                               entryId: "", entryDate: "", unitCost: "", quantity: "",
                               productName: "", supplierName: "", userName: ""
                              });
                              }
                             setTimeout(async () => {
                            if (typeof loadEntries === "function") {
                           await loadEntries();
                           }
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
                   toast.error(`No se encontró la entrada con ID ${idValue}.`);
                   }
                }}
                className="fb-search-form"
            >
                <div className="fb-search-input-wrap">
                    <i className="bi bi-hash fb-search-icon" />
                    <input
                    type="number"
                    name="entryId"
                    className="fb-search-input"
                    placeholder="ID de la entrada a eliminar"
                    required
                    />
                </div>
                <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
                    <i className="bi bi-trash3" /> Eliminar entrada
                </button>
            </form>
        </div>
    </div>
)}
</div>
);
}

export default Entries;




