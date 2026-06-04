import "../styles/forms.css";
import axios from "../services/axiosConfig.js";
import { tieneAcceso } from "../config/permissions.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getAllExits, getExitById, createExit,
    updateExit, deleteExit
} from "../services/exitService.js";

function Exits () {
    const navigate = useNavigate();
    const userRole = localStorage.getItem("userRole") || "USUARIO";

    const userLogin = localStorage.getItem("userName") || localStorage.getItem("userEmail") || "";
    const isAdminOrSupport = ["ADMINISTRADOR", "ADMIN", "SOPORTE"].includes(userRole.toUpperCase());

    const [activeTab, setActiveTab] = useState(localStorage.getItem("activeExitTab") || "all");
    const [showWelcome, setShowWelcome] = useState(true);

    const [searchId, setSearchId] = useState("");
    const [exitById, setExitById] = useState(null);
    const [allExits, setAllExits] = useState([]);

    // Estados para las listas de los Datalists
    const [productsList, setProductsList] = useState([]);
    const [usersList, setUsersList] = useState([]);

    const [formData, setFormData] = useState({
        exitId: "", exitDate: "", quantity: "", productName: "",
        userName: userLogin
    });

    const [editSearchId, setEditSearchId] = useState("");

    // Controla los cambios en el sub menu de entradas
    useEffect(() => {
        localStorage.setItem("activeExitTab", "home");
        setActiveTab("home");
        setShowWelcome(true);

        const handleExitTabChange = () => {
            const tab = localStorage.getItem("activeExitTab") || "home";
            setActiveTab(tab);

            if (tab === "home") {
                setShowWelcome(true);
            } else if (tab === "all") {
                setShowWelcome(false);
                if (typeof loadExits === "function") {
                    loadExits();
                }
            } else if ( tab === "id" || tab === "create" || tab === "update" || tab === "delete") {
                setShowWelcome(false);
            } else {
                setShowWelcome(false);
            }
        };
        window.addEventListener("exitTabChanged", handleExitTabChange);

        return () => window.removeEventListener("exitTabChanged", handleExitTabChange);
    }, []);


    const loadDependencies = async () => {
        try {

            const promesas = [
               axios.get("http://192.168.1.60:8080/api/products"),
            ];

            if (isAdminOrSupport) {
                promesas.push(axios.get("http://192.168.1.60:8080/api/users"));
            }

            const resultados = await Promise.all(promesas);
            const productsActives = (resultados[0].data || []).filter(p => p.active === true || p.active === undefined);
            setProductsList(productsActives);

            if (isAdminOrSupport && resultados[1]) {
                setUsersList(resultados[1].data || []);
            }
        } catch (error) {
            console.error("Error al cargar dependencias en salidas:", error);
        }
    };


    const loadExits = async () => {
        try {
            const data = await getAllExits();
            setAllExits(data || []);
        } catch (error) {
            setAllExits([]);
        }
    };

    // Disparador inicial de datos estáticos
    useEffect(() => {
        loadDependencies();
    }, []);


    const handleSearchById = async (e) => {
        e.preventDefault();
        if (searchId.trim() === "") { setExitById(null); return; }
        try {
            const exit = await getExitById(searchId);
            if (!exit) {
                toast.error("La salida con ese ID no existe.");
                setExitById(null);
            } else {
                setExitById(exit);
            }
        } catch (error) {
            setExitById(null);
            toast.error("La salida con ese ID no existe.");
        }
    };

    // Manejador del cambio de inputs (Edición)
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleBlurId = async (e) => {
        const targetValue = (e && e.target) ? e.target.value : e;

        if (!targetValue || String(targetValue).trim() === "") {
            setFormData({
                exitId: "", exitDate: "", quantity: "", productName: "",
                userName: userLogin
            });
            return;
        }

        try {
            const exit = await getExitById(targetValue);

            if (exit) {
                const nombreProducto = exit.productName || (exit.product && exit.product.name);
                const isActive = productsList.some(p => p.name === nombreProducto || p.productName === nombreProducto);

                if (!isActive) {
                    toast.error("Esta salida pertenece a un producto eliminado y no puede modificarse.");
                    setFormData({
                        exitId: "", exitDate: "", quantity: "", productName: "",
                        userName: userLogin
                    });
                    return;
                }

                setFormData({
                    exitId:  exit.id ||  exit.entryId || targetValue,
                    exitDate:  exit.exitDate || "",
                    quantity:  exit.quantity || "",
                    productName: nombreProducto || "",
                    userName:  exit.userName || userLogin
                });
                toast.success("¡Salida cargada con éxito!");

            } else {
                setFormData({
                    exitId: targetValue,  exitDate: "", quantity: "",
                    productName: "", userName: userLogin
                });
                toast.error("No se encontró una salida con ese ID");
            }
        } catch (error) {
            setFormData({
                exitId: targetValue,  exitDate: "", quantity: "",
                productName: "", userName: userLogin
            });
            toast.error("No se encontró una salida con ese ID.");
        }
    };

    // Actualizar una entrada de un producto
    const handleUpdateSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!formData.exitId || String(formData. exitId).trim() === "") {
            toast.error("Por favor, carga una salida válida antes de actualizar.");
            return;
        }

        const productValid = productsList.find(p => p.name === formData.productName || p.productName === formData.productName);

        if (!productValid) {
            toast.error("No se puede actualizar: El producto asignado está inactivo o no existe.");
            return;
        }

        try {
            const entryCheck = await getExitById(formData.exitId);

            if (!entryCheck) {
                toast.error(`No se puede actualizar: La salida con ID ${formData.entryId} no existe.`);
                return;
            }

            const updatedData = {
                ...formData,
                userName: userLogin
            };

            await updateExit(formData.exitId, updatedData);
            toast.success("Salida actualizada correctamente");

            setFormData({
                exitId: "", exitDate: "", quantity: "", productName: "",
                userName: userLogin
            });

            setEditSearchId("");

            setTimeout(async () => {
                if (typeof loadExits === "function") {
                    await loadExits();
                }
            }, 300);

        } catch (error) {
            toast.error(`No se puede actualizar: La salida con ID ${formData.entryId} no existe.`);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const form = e.target;
            const pName = form.productName.value;
            const productValid = productsList.find(p => p.name === pName || p.productName === pName);

            if (!productValid) {
                toast.error("El producto seleccionado no existe. No se puede crear la salida.");
                return;
            }

            const newExit = {
                quantity: form.quantity.value,
                productName: form.productName.value,
                userName: userLogin
            };

            await createExit(newExit);
            toast.success("Salida creada con éxito");

            form.reset();

            setFormData({
                exitId: "",
                exitDate: "",
                quantity: "",
                productName: "",
                userName: userLogin
            });

            setTimeout(async () => {
                if (typeof loadEntries === "function") {
                    await loadEntries();
                }
            }, 300);
        } catch (error) {
            console.error("Error al crear la salida:", error);
            toast.error("Hubo un problema al registrar la salida.");
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

        {/* ALL EXITS */}
        {activeTab === "all" && (
        <div className="fb-results-grid fb-users-cards-margin">
        {Array.isArray(allExits) && allExits.length > 0 ? (
        allExits.map((exit) => (
        <div key={exit.id || exit.exitId} className="fb-user-display-card">
        <div className="fb-card-user-info">
        <h4 className="fb-card-user-title">
         {exit.productName}
          </h4>
          <span className="fb-card-user-id">ID: {exit.id || exit.exitId}</span>
           </div>
           <div className="fb-card-user-body">
            <p className="fb-card-user-detail">
              <i className="bi bi-calendar-event" /> fecha de registro: {exit.exitDate}
                </p>
                 <p className="fb-card-user-detail">
                 <i className="bi bi-layers" /> Cantidad: {exit.quantity}
                 </p>
               <p className="fb-card-user-detail">
              <i className="bi bi-person" /> Usuario que registro: {exit.userName || "Sin usuario"}
              </p>
            </div>
           </div>
           ))
           ) : (
         <div className="fb-empty fb-grid-full-width">
         <i className="bi bi-inbox" />
        <p>No hay salidas registradas</p>
       </div>
       )}
     </div>
    )}

     {/* SEARCH BY ID */}
     {activeTab === "id" && (
      <div className="fb-form-section">
         <div className="fb-form-card">
             <h3 className="fb-form-title"><i className="bi bi-search" /> Introduzca el ID de la salida</h3>
             <form onSubmit={handleSearchById} className="fb-search-form">
                <div className="fb-search-input-wrap">
                    <i className="bi bi-hash fb-search-icon" />
                    <input type="number" className="fb-search-input" placeholder="Ingrese ID de salida"
                    value={searchId} onChange={e => setSearchId(e.target.value)} />
                   </div>
                    <button type="submit" className="fb-search-btn">
                  <i className="bi bi-search" /> Buscar salida
                  </button>
                  </form>
                  </div>
                 {exitById && (
                 <div className="fb-results-grid">
                 <div className="fb-user-card">
                 <div>
              <p className="fb-user-card-name">{exitById.productName}</p>
             <p className="fb-user-card-detail"><i className="bi bi-calendar-event" /> Fecha de registro: {exitById.exitDate}</p>
            <p className="fb-user-card-detail"><i className="bi bi-layers" /> Cantidad: {exitById.quantity}</p>
            <p className="fb-user-card-detail"><i className="bi bi-person" /> Usuario que registro: {exitById.userName || "Sin usuario"}</p>
            </div>
          </div>
        </div>
        )}
    </div>
    )}

    {/* CREATE EXIT */}
    {activeTab === "create" && (
    <div className="fb-form-section fb-tab-create">
       <div className="fb-form-card">
          <h3 className="fb-form-title">
            <i className="bi bi-box-arrow-up" /> Introduzca los datos de la nueva salida
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
                   { label: "Cantidad", name: "quantity", icon: "bi-layers", type: "number", placeholder: "0" },
                   ].map((f) => (
                   <div key={f.name} className="fb-crud-field">
                   <label className="fb-crud-label">{f.label}</label>
                  <div className="fb-crud-input-wrap" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <i className={`bi ${f.icon} fb-crud-input-icon`} />
                   <input
                   type={f.type || "text"}
                   name={f.name}
                   className="fb-crud-input"
                   placeholder={f.placeholder}
                   required
                   step="1"
                   />
                 </div>
                </div>
               ))}
              <div className="fb-crud-field">
              <label className="fb-crud-label">Usuario que registra</label>
             <div className="fb-crud-input-wrap">
              <i className="bi bi-person fb-crud-input-icon" />
              <input
              type="text"
             name="userName"
             className="fb-crud-input"
             placeholder="Usuario que registra"
             value={userLogin}
             readOnly
             style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed", fontWeight: "bold" }}
            required
            autoComplete="off"
            />
           </div>
          </div>
        </div>
           <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)" }}>
           <i className="bi bi-check-circle-fill" /> Crear salida
       </button>
     </form>
    </div>
   </div>
   )}

      {/* UPDATE EXIT */}
      {activeTab === "update" && (
      <div className="fb-form-section fb-tab-update">
      <div className="fb-form-card">
       <h3 className="fb-form-title"><i className="bi bi-pencil-square" /> Actualice el dato o los datos de la salida</h3>
        <form onSubmit={handleUpdateSubmit} onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()} className="fb-crud-form">
         <div className="fb-crud-grid">
          <div className="fb-crud-field">
            <label className="fb-crud-label">ID salida</label>
             <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
               <div style={{ position: "relative", flex: 1 }}>
                 <i className="bi bi-hash fb-crud-input-icon" style={{ zIndex: 5 }} />
                  <input
                  type="number"
                  name="exitId"
                  className="fb-crud-input"
                  placeholder="ID de la salida"
                  value={formData.exitId || ""}
                  onChange={handleChange}
                  required
                 />
               </div>
              <button
             type="button"
            className="fb-search-btn"
            style={{ padding: "0 15px", whiteSpace: "nowrap", borderRadius: "8px" }}
             onClick={() => handleBlurId(formData.exitId)}
              >
              Cargar
          </button>
         </div>
        </div>

          {[
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
                 step="1"
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

             {/* Datalist Usuario */}
             <div className="fb-crud-field">
                 <label className="fb-crud-label">Usuario que registra</label>
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
                             <option key={u.id || idx} value={`${u.name || u.userName || ""} ${u.lastName || u.last_name || ""}`.trim()} />
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

     {/* DELETE EXIT */}
     {activeTab === "delete" && (
      <div className="fb-form-section">
      <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
       <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
        <i className="bi bi-trash3-fill" /> Introduzca el ID de la salida
         </h3>
           <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
            ⚠️ Al eliminar la salida se removerá permanentemente de su base de datos ⚠️
            </p>
           <form
          onSubmit={async (e) => {
           e.preventDefault();
          const form = e.target;
          const idValue = form.exitId.value;
           if (!idValue || String(idValue).trim() === "") {
          toast.error("Por favor, ingresa un ID válido.");
          return;
          }
           try {
           const exit = await getExitById(idValue);
           if (!exit) {
           toast.error(`No se puede eliminar la salida con ID ${idValue}.`);
           return;
           }
            const nombreProducto = exit.productName;
            const estaActivo = productsList.some((p) => p.name === nombreProducto || p.productName === nombreProducto);
            if (!estaActivo) {
            toast.error("No se puede eliminar esta salida, pertenece a un producto eliminado.");
             return;
            }
             toast((t) => (
               <div className="d-flex flex-column gap-2 text-center" style={{ minWidth: "250px" }}>
                <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                ¿Está seguro de que desea eliminar la salida con el ID <strong>{idValue}</strong>?
              </span>
              <div className="d-flex justify-content-center gap-2 mt-1">
             <button
           className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
           style={{ borderRadius: "12px", fontSize: "0.85rem" }}
           onClick={async () => {
          toast.dismiss(t.id);
         try {
           await deleteExit(idValue);
           toast.success(`Salida con ID ${idValue} eliminada correctamente.`);
            form.reset();
            if (typeof setFormData === "function") {
            setFormData({
              exitId: "",
              entryDate: "",
              quantity: "",
              productName: "",
              userName: usuarioLogueado
            });
            }
         setTimeout(async () => {
         if (typeof loadExits === "function") {
         await loadExits();
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
        toast.error(`No se encontró la salida con ID ${idValue}.`);
      }
      }}
     className="fb-search-form"
      >
       <div className="fb-search-input-wrap">
        <i className="bi bi-hash fb-search-icon" />
        <input
        type="number"
        name="exitId"
        className="fb-search-input"
        placeholder="ID de la salida a eliminar"
        required
        />
       </div>
       <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
        <i className="bi bi-trash3" /> Eliminar salida
      </button>
     </form>
    </div>
   </div>
   )}
  </div>
 );
}


export default Exits;



