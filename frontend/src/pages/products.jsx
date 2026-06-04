import "../styles/forms.css";
import axios from "../services/axiosConfig.js";
import { tieneAcceso } from "../config/permissions.js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, searchProductsByName
} from "../services/productService.js";

function Products() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "CLIENTE";

  const userLogin = localStorage.getItem("userName") || localStorage.getItem("userEmail") || "";

  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeProductTab") || "all");
  const [showWelcome, setShowWelcome] = useState(true);

  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [productsByName, setProductsByName] = useState([]);
  const [productById, setProductById] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Estados para las listas de los Datalists
  const [categoriesList, setCategoriesList] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [usersList, setUsersList] = useState([]);


  const [formData, setFormData] = useState({
    productId: "", name: "", price: "", currentStock: "", description: "", imageUrl: "",
    categoryName: "", supplierName: "", userName: userLogin
  });

  const [editSearchId, setEditSearchId] = useState("");

  // Controla los cambios en el sub menu de productos
  useEffect(() => {
    localStorage.setItem("activeProductTab", "home");
    setActiveTab("home");
    setShowWelcome(true);

    const handleProductTabChange = () => {
      const tab = localStorage.getItem("activeProductTab") || "home";
      setActiveTab(tab);

      if (tab === "home") {
        setShowWelcome(true);
      } else if (tab === "all") {
        setShowWelcome(false);
        if (typeof loadProducts === "function") {
          loadProducts();
        }
      } else if (tab === "name" || tab === "id" || tab === "create" || tab === "update" || tab === "delete") {
        setShowWelcome(false);
      } else {
        setShowWelcome(false);
      }
    };
    window.addEventListener("productTabChanged", handleProductTabChange);

    return () => window.removeEventListener("productTabChanged", handleProductTabChange);
  }, []);


  const loadDependencies = async () => {
    try {

      const esAdminOSoporte = ["ADMINISTRADOR", "ADMIN", "SOPORTE"].includes(userRole.toUpperCase());

      // Lanzamos en paralelo solo Categorías y Proveedores
      const promesas = [
        axios.get("http://192.168.1.60:8080/api/categories"),
        axios.get("http://192.168.1.60:8080/api/suppliers")
      ];

      // Si tiene permisos, agregamos la petición de usuarios a la cola
      if (esAdminOSoporte) {
        promesas.push(axios.get("http://192.168.1.60:8080/api/users"));
      }

      const resultados = await Promise.all(promesas);

      setCategoriesList(resultados[0].data || []);
      setSuppliersList(resultados[1].data || []);

      if (esAdminOSoporte && resultados[2]) {
        setUsersList(resultados[2].data || []);
      }
    } catch (error) {
      console.error("Error al cargar dependencias:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      setAllProducts(data || []);
    } catch (error) {
      setAllProducts([]);
    }
  };

  // Disparador inicial de datos estáticos
  useEffect(() => {
    loadDependencies();
  }, []);

  // Busqueda de un producto por Nombre
  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === "") {
      setProductsByName([]);
      return;
    }
    try {
      const data = await searchProductsByName(search);
      if (!data || !Array.isArray(data) || data.length === 0) {
        toast.error("No se encontró ningún producto con ese nombre.");
        setProductsByName([]);
      } else {
        setProductsByName(data); // Éxito silencioso
      }
    } catch (error) {
      setProductsByName([]);
      toast.error("Hubo un problema al buscar el producto por nombre.");
    }
  };

  // Busqueda de un producto por ID
  const handleSearchById = async (e) => {
    e.preventDefault();
    if (searchId.trim() === "") {
      setProductById(null);
      return;
    }
    try {
      const prod = await getProductById(searchId);
      if (!prod) {
        toast.error("El producto con ese ID no existe.");
        setProductById(null);
      } else {
        setProductById(prod);
      }
    } catch (error) {
      setProductById(null);
      toast.error("El producto con ese ID no existe.");
    }
  };

  // Manejador del cambio de inputs (Edición)
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Busqueda de un producto por su ID en el campo de actualizar
  const handleBlurId = async (e) => {
    const targetValue = (e && e.target) ? e.target.value : e;
    if (!targetValue || String(targetValue).trim() === "") {
      toast.error("Por favor, ingresa un ID válido antes de cargar.");
      return;
    }

    try {
      const prod = await getProductById(targetValue);

      if (prod) {
        setFormData({
          productId: prod.id || prod.productId || targetValue,
          name: prod.name || "",
          price: prod.price || "",
          currentStock: prod.currentStock || prod.stock || "",
          description: prod.description || "",
          imageUrl: prod.imageUrl || "",
          categoryName: prod.categoryName || "",
          supplierName: prod.supplierName || "",
          userName: prod.userName || userLogin
        });
        toast.success("¡Producto cargado con éxito!");
      } else {
        setFormData({
          productId: targetValue, name: "", price: "", currentStock: "",
          description: "", imageUrl: "", categoryName: "", supplierName: "", userName: userLogin
        });
        toast.error("No se encontró el producto con ese ID");
      }
    } catch (error) {
      setFormData({
        productId: targetValue, name: "", price: "", currentStock: "",
        description: "", imageUrl: "", categoryName: "", supplierName: "", userName: userLogin
      });
      toast.error("No se encontró el producto con ese ID.");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = e.target;

      const newProduct = {
        name: form.name.value,
        price: form.price.value ? parseFloat(form.price.value) : 0.0,
        currentStock: form.currentStock.value ? parseInt(form.currentStock.value, 10) : 0,
        description: form.description.value,
        imageUrl: form.imageUrl.value,
        categoryName: form.categoryName.value,
        supplierName: form.supplierName.value,
        userName: userLogin
      };

      await createProduct(newProduct);
      toast.success("¡Producto creado con éxito!");

      form.reset();

      setFormData({
        productId: "", name: "", price: "", currentStock: "",
        description: "", imageUrl: "", categoryName: "", supplierName: "", userName: userLogin
      });

      setTimeout(async () => {
        await loadProducts();
      }, 300);

    } catch (error) {
      console.error("Error al registrar el producto:", error);
    }
  };

  // Función para actualizar un producto existente
  const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.productId || String(formData.productId).trim() === "") {
      toast.error("Por favor, carga un producto válido antes de actualizar.");
      return;
    }

    try {
      const productCheck = await getProductById(formData.productId);

      if (!productCheck) {
        toast.error(`No se puede actualizar: El producto con ID ${formData.productId} no existe.`);
        return;
      }

      const updatedData = {
        ...formData,
        userName: userLogin,
        price: formData.price ? parseFloat(formData.price) : 0.0,
        currentStock: formData.currentStock ? parseInt(formData.currentStock, 10) : 0
      };

      await updateProduct(formData.productId, updatedData);
      toast.success("Producto actualizado correctamente");

      setFormData({
        productId: "", name: "", price: "", currentStock: "", description: "",
        imageUrl: "", categoryName: "", supplierName: "", userName: userLogin
      });

      setEditSearchId("");
      setTimeout(async () => {
        if (typeof loadProducts === "function") {
          await loadProducts();
        }
      }, 300);

    } catch (error) {
      toast.error(`No se pudo actualizar: El producto con ID ${formData.productId}.`);
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

      {/* ALL PRODUCTS */}
      {activeTab === "all" && !showWelcome && (
        <div className="fb-form-section">
          <div className="fb-section-header">
            <h3 className="fb-table-title">
              <i className="bi bi-box-seam-fill" /> Productos registrados
            </h3>
            <span className="fb-badge">{allProducts.length} productos</span>
          </div>
          <div className="fb-results-grid fb-users-cards-margin">
            {allProducts.length > 0 ? (
              allProducts.map((p) => (
                <ProductCard key={p.id || p.productId} p={p} />
              ))
            ) : (
              <div className="fb-empty fb-grid-full-width">
                <i className="bi bi-inbox" />
                <p>No hay productos registrados en inventario</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEARCH BY NAME */}
      {activeTab === "name" && tieneAcceso(userRole, "verTabsConsulta") && (
        <div className="fb-form-section">
          <div className="fb-form-card">
            <h3 className="fb-form-title"><i className="bi bi-search" /> Escriba el nombre del producto</h3>
            <form onSubmit={handleSearch} className="fb-search-form">
              <div className="fb-search-input-wrap">
                <i className="bi bi-box-seam fb-search-icon" />
                <input type="text" className="fb-search-input" placeholder="Ej: Manzana Verde" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button type="submit" className="fb-search-btn"><i className="bi bi-search" /> Buscar producto</button>
            </form>
          </div>
          {productsByName.length > 0 && (
            <div className="fb-results-grid" style={{ marginTop: "1.5rem" }}>
              {productsByName.map(p => (
                <ProductCard key={p.id || p.productId} p={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEARCH BY ID */}
      {activeTab === "id" && tieneAcceso(userRole, "verTabsConsulta") && (
        <div className="fb-form-section">
          <div className="fb-form-card">
            <h3 className="fb-form-title"><i className="bi bi-tag-fill" /> Introduzca el ID del producto</h3>
            <form onSubmit={handleSearchById} className="fb-search-form">
              <div className="fb-search-input-wrap">
                <i className="bi bi-hash fb-search-icon" />
                <input type="number" className="fb-search-input" placeholder="Ingrese ID" value={searchId} onChange={e => setSearchId(e.target.value)} />
              </div>
              <button type="submit" className="fb-search-btn"><i className="bi bi-search" /> Buscar producto</button>
            </form>
          </div>
          {productById && (
            <div className="fb-results-grid fb-users-cards-margin" style={{ marginTop: "1.5rem" }}>
              <ProductCard p={productById} />
            </div>
          )}
        </div>
      )}

      {/* CREATE PRODUCT */}
      {activeTab === "create" && tieneAcceso(userRole, "crear") && (
        <div className="fb-form-section fb-tab-create">
          <div className="fb-form-card">
            <h3 className="fb-form-title"><i className="bi bi-plus-circle-fill" /> Ingresar un nuevo producto</h3>
            <form onSubmit={handleCreateSubmit} className="fb-crud-form">
              <div className="fb-crud-grid">
                <div className="fb-crud-field">
                  <label className="fb-crud-label">Nombre del producto</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-box-seam fb-crud-input-icon" />
                    <input type="text" name="name" className="fb-crud-input" placeholder="Ej: Carne de Res" required />
                  </div>
                </div>
                <div className="fb-crud-field">
                  <label className="fb-crud-label">Precio ($)</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-currency-dollar fb-crud-input-icon" />
                    <input type="number" step="0.01" name="price" className="fb-crud-input" placeholder="0.00" required />
                  </div>
                </div>
                <div className="fb-crud-field">
                  <label className="fb-crud-label">Stock inicial</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-hash fb-crud-input-icon" />
                    <input type="number" name="currentStock" className="fb-crud-input" placeholder="25" required />
                  </div>
                </div>
                <div className="fb-crud-field" style={{ gridColumn: "span 2" }}>
                  <label className="fb-crud-label">URL de imagen</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-image fb-crud-input-icon" />
                    <input type="text" name="imageUrl" className="fb-crud-input" placeholder="http://...jpg" />
                  </div>
                </div>
                <div className="fb-crud-field" style={{ gridColumn: "span 2" }}>
                  <label className="fb-crud-label">Descripción del producto</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-justify-left fb-crud-input-icon" />
                    <input type="text" name="description" className="fb-crud-input" placeholder="Detalles del producto" required />
                  </div>
                </div>
                <div className="fb-crud-field">
                  <label className="fb-crud-label">Categoría del producto</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-bookmark-star fb-crud-input-icon" />
                    <input type="text" name="categoryName" list="cats-options" className="fb-crud-input" placeholder="Seleccione o escriba" required autoComplete="off"/>
                    <datalist id="cats-options">
                      {categoriesList.map((c, i) => <option key={i} value={c.name} />)}
                    </datalist>
                  </div>
                </div>
                <div className="fb-crud-field">
                  <label className="fb-crud-label">Proveedor del producto</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-truck fb-crud-input-icon" />
                    <input type="text" name="supplierName" list="sups-options" className="fb-crud-input" placeholder="Seleccione o escriba" required autoComplete="off" />
                    <datalist id="sups-options">
                      {suppliersList.map((s, i) => <option key={i} value={`${s.name || ""} ${s.lastName || ""}`.trim()} />)}
                    </datalist>
                  </div>
                </div>
                <div className="fb-crud-field">
                  <label className="fb-crud-label">Usuario que registra</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-person-badge fb-crud-input-icon" />
                    <input
                        type="text"
                        name="userName"
                        className="fb-crud-input"
                        style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed", fontWeight: "bold" }} // Le da el toque grisáceo de bloqueado
                        value={userLogin}
                        disabled
                        readOnly
                        required
                    />
                  </div>
                </div>
              </div>
              <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)", marginTop: "1.5rem" }}>
                <i className="bi bi-check-circle" /> Registrar producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE PRODUCT */}
      {activeTab === "update" && tieneAcceso(userRole, "actualizar") && (
        <div className="fb-form-section fb-tab-update">
          <div className="fb-form-card">
            <h3 className="fb-form-title"><i className="bi bi-pencil-square" /> Modificación de la ficha de producto</h3>
            <form
              onSubmit={handleUpdateSubmit}
              className="fb-crud-form"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.keyCode === 13) e.preventDefault();
              }}
            >
              <div className="fb-crud-grid">
                <div className="fb-crud-field">
                  <label className="fb-crud-label">ID del producto</label>
                  <div className="fb-crud-input-wrap" style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <i className="bi bi-key-fill fb-crud-input-icon" />
                      <input
                        type="number"
                        name="productId"
                        className="fb-crud-input"
                        value={editSearchId || ""}
                        onChange={(e) => {
                          setEditSearchId(e.target.value);
                          setFormData(prev => ({ ...prev, productId: e.target.value }));
                        }}
                        placeholder="Ej: 2"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="fb-search-btn"
                      style={{ padding: "0 1rem", height: "42px", marginTop: "0", display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer" }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleBlurId(editSearchId);
                      }}
                    >
                      <i className="bi bi-download" /> Cargar
                    </button>
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Nombre comercial</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-box-seam fb-crud-input-icon" />
                    <input type="text" name="name" className="fb-crud-input" value={formData.name || ""} onChange={handleChange} required />
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Precio ($)</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-currency-dollar fb-crud-input-icon" />
                    <input type="number" step="0.01" name="price" className="fb-crud-input" value={formData.price || ""} onChange={handleChange} required />
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Stock actual</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-hash fb-crud-input-icon" />
                    <input type="number" name="currentStock" className="fb-crud-input" value={formData.currentStock || ""} onChange={handleChange} required />
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Imagen</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-image fb-crud-input-icon" />
                    <input type="text" name="imageUrl" className="fb-crud-input" value={formData.imageUrl || ""} onChange={handleChange} required />
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Categoría</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-bookmark-star fb-crud-input-icon" />
                    <input type="text" name="categoryName" list="update-cats-options" className="fb-crud-input" value={formData.categoryName || ""} onChange={handleChange} required autoComplete="off" />
                    <datalist id="update-cats-options">
                      {categoriesList.map((c, i) => <option key={i} value={c.name} />)}
                    </datalist>
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Proveedor</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-truck fb-crud-input-icon" />
                    <input type="text" name="supplierName" list="update-sups-options" className="fb-crud-input" value={formData.supplierName || ""} onChange={handleChange} required autoComplete="off" />
                    <datalist id="update-sups-options">
                      {suppliersList.map((s, i) => (
                        <option key={i} value={`${s.name || ""} ${s.lastName || ""}`.trim()} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="fb-crud-field">
                  <label className="fb-crud-label">Registrado por</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-person-badge fb-crud-input-icon" />
                    <input type="text" name="userName" list="update-users-options" className="fb-crud-input" value={formData.userName || ""} onChange={handleChange} required autoComplete="off" />
                    <datalist id="update-users-options">
                      {usersList.map((u, i) => (
                        <option key={i} value={`${u.name || u.username} ${u.lastName || ""}`.trim()} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="fb-crud-field" style={{ gridColumn: "span 2" }}>
                  <label className="fb-crud-label">Descripción</label>
                  <div className="fb-crud-input-wrap">
                    <i className="bi bi-justify-left fb-crud-input-icon" />
                    <input type="text" name="description" className="fb-crud-input" value={formData.description || ""} onChange={handleChange} required />
                  </div>
                </div>
              </div>
              <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)", marginTop: "1.5rem" }}>
                <i className="bi bi-check-circle-fill" /> Guardar cambios
              </button>
            </form>
          </div>
        </div>
      )}

        {/* DELETE PRODUCT */}
        {activeTab === "delete" && tieneAcceso(userRole, "eliminar") && (
            <div className="fb-form-section">
              <div className="fb-form-card" style={{ borderTop: "4px solid #dc3545" }}>
                <h3 className="fb-form-title" style={{ color: "#dc3545" }}>
                  <i className="bi bi-trash3-fill" /> Eliminar producto de inventario
                </h3>
                <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                  ⚠️ Al eliminar el producto se borrarán permanentemente de su inventario ⚠️.
                </p>
                <form
                 onSubmit={async (e) => {
                 e.preventDefault();
                 const form = e.target;
                 const id = form.elements.id.value;
                 if (!id || String(id).trim() === "") {
                   toast.error("Por favor, ingresa un ID válido.");
                   return;
                 }
                 try {
                   const product = await getProductById(id);
                   if (!product) {
                     toast.error(`No se puede eliminar: El producto con ID ${id} no existe.`);
                     return; // Detiene la ejecución por completo y no pregunta nada
                   }
                   toast((t) => (
                       <div className="d-flex flex-column gap-2 text-center" style={{ minWidth: "250px" }}>
                      <span className="fw-semibold text-dark" style={{ fontSize: "0.95rem" }}>
                  ¿Seguro que deseas eliminar el producto con ID <strong>{id}</strong>?
                </span>
                <div className="d-flex justify-content-center gap-2 mt-1">
                  <button
                      className="btn btn-danger btn-sm px-3 fw-bold shadow-sm"
                      style={{ borderRadius: "12px", fontSize: "0.85rem" }}
                      onClick={async () => {
                        toast.dismiss(t.id);
                     try {
                       await deleteProduct(id);
                       toast.success(`Producto con ID ${id} eliminado del sistema.`);
                       form.reset();
                       setTimeout(async () => {
                         if (typeof loadProducts === "function") {
                           await loadProducts();
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
                   toast.error(`No se encontró el producto con ID ${id}.`);
                 }
                 }}
                 className="fb-search-form"
                >
               <div className="fb-search-input-wrap">
              <i className="bi bi-hash fb-search-icon" />
              <input type="number" name="id" className="fb-search-input" placeholder="ID del producto" required />
               </div>
             <button type="submit" className="fb-search-btn" style={{ background: "#dc3545" }}>
             <i className="bi bi-trash3" /> Eliminar
             </button>
            </form>
           </div>
          </div>
        )}
    </div>
  );
}

// Función para manejar las tarjetas de los productos
function ProductCard({ p }) {

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fb-user-display-card">
      <div className="fb-card-user-info">
        <h4 className="fb-card-user-title">{p.name}</h4>
        <span className="fb-card-user-id">ID: {p.id || p.productId}</span>
      </div>

      {/* Imagen del producto */}
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
            <i className="bi bi-image" style={{ fontSize: '2.5rem', color: '#a3b8a3' }} />
          </div>
        )}
      </div>

      <div className="fb-card-user-body">
        {/* INFO SIEMPRE VISIBLE */}
        <p className="fb-card-user-detail">
          <i className="bi bi-currency-dollar" /> <strong>Precio:</strong> ${p.price}
        </p>
        <p className="fb-card-user-detail">
          <i className="bi bi-justify-left" /> <strong>Descripción:</strong> {p.description}
        </p>

        {/* INFO DESPLEGABLE */}
        {isExpanded && (
          <div className="fb-product-card-extra-info">
            <p className="fb-card-user-detail">
              <i className="bi bi-hash" /> <strong>Stock Actual:</strong> {p.currentStock ?? p.stockActual ?? p.stock}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-bookmark-star" /> <strong>Categoría:</strong> {p.categoryName || "Sin categoría"}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-truck" /> <strong>Proveedor:</strong> {p.supplierName || "Sin proveedor"}
            </p>
            <p className="fb-card-user-detail">
              <i className="bi bi-person-badge" /> <strong>Registrado por:</strong> {p.userName || "No disponible"}
            </p>
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