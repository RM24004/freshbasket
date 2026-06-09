// Nuestra página principal
import "../styles/freshbasket.css";
import { tieneAcceso } from "../Config/permissions";
import Profile from "./profile.jsx";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

function Freshbasket({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrae el rol y correo de cada usuario para mostrarse en el perfil
  const userRole = (localStorage.getItem("userRole") || "CLIENTE").toUpperCase().trim();
  const userEmail = localStorage.getItem("userEmail") || "correodeejemplo@mail.com";

  const [openMenus, setOpenMenus] = React.useState({
    [location.pathname.split("/")[2]]: true
  });

  React.useEffect(() => {
    const currentModule = location.pathname.split("/")[2];

    setOpenMenus(() => {
      if (!currentModule) {
        return {};
      }
      return { [currentModule]: true };
    });
  }, [location.pathname]);


  const [showProfileMenu, setShowProfileMenu] = useState(false);


  useEffect(() => {
    const modules = ["activeProductTab", "activeUserTab", "activeSupplierTab", "activeEntryTab", "activeExitTab"];
    modules.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, tieneAcceso(userRole, "verTabsConsulta") ? "all" : "create");
      }
    });
  }, [userRole]);

  const profileRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/login");
  };

  //Menu en el que se muestran todos los modulos segun sea el ROL
  const menuItems = React.useMemo(() => {
    return [
      { key: "home",         icon: "bi-house-fill",         label: "Inicio",        path: "/freshbasket" },
      { key: "productos",    icon: "bi-basket3-fill",       label: "Productos",     path: "/freshbasket/productos", hasSubmenu: true },

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "entradas",     icon: "bi-box-arrow-in-down",  label: "Entradas" ,   path: "/freshbasket/entradas", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "salidas",      icon: "bi-box-arrow-up",       label: "Salidas" ,    path: "/freshbasket/salidas", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "proveedores",  icon: "bi-truck",              label: "Proveedores", path: "/freshbasket/proveedores", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "verModuloUsuarios") ? [
        { key: "usuarios",     icon: "bi-people-fill",        label: "Usuarios",    path: "/freshbasket/usuarios", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "categorias",   icon: "bi-tags-fill",          label: "Categorias",  path: "/freshbasket/categorias", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "paises",       icon: "bi-globe-americas",     label: "Paises",      path: "/freshbasket/paises", hasSubmenu: true }
      ] : []),
    ];
  }, [userRole]);

  // SubMenu: aquí vemos todas las acciones que se pueden realizar
  const productSubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verTabsConsulta") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todos los productos" },
        { key: "name",   icon: "bi-search",           label: "Buscar por nombre" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrar producto" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar producto" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar producto" }
      ] : [])
    ];
  }, [userRole]);

  // Sub menu de usuarios
  const userSubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verModuloUsuarios") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todos los usuarios" },
        { key: "name",   icon: "bi-search",           label: "Buscar por nombre" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrar usuario" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar usuario" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar usuario" }
      ] : [])
    ];
  }, [userRole]);

  // Sub menu de proveedores
  const supplierSubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verTabsConsulta") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todos los proveedores" },
        { key: "name",   icon: "bi-search",           label: "Buscar por nombre" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrar proveedor" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar proveedor" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar proveedor" }
      ] : [])
    ];
  }, [userRole]);

  // Sub menu de entradas
  const entrySubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verTabsConsulta") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todas las entradas" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrar entrada" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar entrada" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar entrada" }
      ] : [])
    ];
  }, [userRole]);

  // Sub menu de salidas
  const exitSubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verTabsConsulta") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todas las salidas" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrar salida" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar salida" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar salida" }
      ] : [])
    ];
  }, [userRole]);

  // Sub menu de categorías
  const categorySubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verTabsConsulta") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todas las categorias" },
        { key: "name",     icon: "bi-tag-fill",         label: "Buscar por nombre" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrar categoria" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar categoria" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar categoria" }
      ] : [])
    ];
  }, [userRole]);

  // Sub menu de paises
  const countrySubItems = React.useMemo(() => {
    return [
      ...(tieneAcceso(userRole, "verTabsConsulta") ? [
        { key: "all",    icon: "bi-box-seam-fill",    label: "Todos los paises" },
        { key: "name",     icon: "bi-tag-fill",         label: "Buscar por nombre" },
        { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
      ] : []),
      ...(tieneAcceso(userRole, "crear") ? [
        { key: "create", icon: "bi-plus-circle-fill", label: "Registrarun  pais" }
      ] : []),
      ...(tieneAcceso(userRole, "actualizar") ? [
        { key: "update", icon: "bi-pencil-square",    label: "Actualizar un pais" }
      ] : []),
      ...(tieneAcceso(userRole, "eliminar") ? [
        { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar un pais" }
      ] : [])
    ];
  }, [userRole]);

  return (
      <div className="fb-root">
        {/* SIDEBAR */}
        <div className="fb-sidebar">
          <div className="fb-sidebar-brand">
            <i className="bi bi-basket3-fill fb-sidebar-brand-icon" />
            <span className="fb-sidebar-brand-name">FreshBasket</span>
          </div>
          <div className="fb-sidebar-section">MÓDULOS</div>
          <nav className="fb-nav">
            {menuItems.map((item) => {

              const isActive = location.pathname === item.path || (item.path !== "/freshbasket" && location.pathname.startsWith(item.path));
              const isMenuOpen = openMenus[item.key] !== undefined ? openMenus[item.key] : isActive;

              const subItemsArr =
                  item.key === "productos" ? productSubItems :
                  item.key === "usuarios" ? userSubItems :
                  item.key === "proveedores" ? supplierSubItems :
                  item.key === "entradas" ? entrySubItems :
                  item.key === "salidas" ? exitSubItems :
                  item.key === "categorias" ? categorySubItems :
                  item.key === "paises" ? countrySubItems :
               [];

              return (
                  <div key={item.key} style={{ width: "100%" }}>
                    <button
                        className={`fb-nav-item ${isActive ? "fb-nav-item-active" : ""}`}
                        onClick={() => {
                          if (isActive) {
                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.key]: !isMenuOpen,
                            }));
                          } else {

                            setOpenMenus((prev) => ({
                              ...prev,
                              [item.key]: true,
                            }));
                          }

                          if (item.path) {
                            // Nota: Corregí "categorías" por "categorias" para que coincida exactamente con la key de tu objeto
                            const tabKeys = {
                              productos: "activeProductTab",
                              usuarios: "activeUserTab",
                              proveedores: "activeSupplierTab",
                              entradas: "activeEntryTab",
                              salidas: "activeExitTab",
                              categorias: "activeCategoryTab",
                              paises: "activeCountryTab"
                            };
                            if (tabKeys[item.key] && !localStorage.getItem(tabKeys[item.key])) {
                              localStorage.setItem(tabKeys[item.key], tieneAcceso(userRole, "verTabsConsulta") ? "all" : "create");
                            }
                            navigate(item.path);
                          }
                        }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        <i className={`bi ${item.icon} fb-nav-icon`} />
                        <span>{item.label}</span>
                      </div>
                      {item.hasSubmenu && subItemsArr.length > 0 && (
                          <i className={`bi ${isMenuOpen ? "bi-chevron-up" : "bi-chevron-down"} fb-profile-arrow`} style={{ fontSize: "0.8rem" }} />
                      )}
                    </button>

                    {/* SUB-MENÚ DINÁMICO */}
                    {item.hasSubmenu && isMenuOpen && subItemsArr.length > 0 && (
                      <div className="fb-sidebar-submenu" style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                        {subItemsArr.map((sub) => {
                           const storageKey =
                            item.key === "productos" ? "activeProductTab" :
                            item.key === "usuarios" ? "activeUserTab" :
                            item.key === "proveedores" ? "activeSupplierTab" :
                            item.key === "entradas" ? "activeEntryTab" :
                            item.key === "salidas" ? "activeExitTab" :
                            item.key === "categorias" ? "activeCategoryTab" :
                            item.key === "paises" ? "activeCountryTab" : "";
                   const currentActiveTab = localStorage.getItem(storageKey) || (tieneAcceso(userRole, "verTabsConsulta") ? "all" : "create");
                   const isSubActive = currentActiveTab === sub.key;
                     return (
                     <button
                     key={sub.key}
                     className="fb-nav-item"
                     style={{
                     fontSize: "0.85rem", padding: "0.5rem 0.75rem",
                     background: isSubActive ? "rgba(255,255,255,0.1)" : "transparent",
                     border: "none",
                     fontWeight: isSubActive ? "bold" : "normal"
                     }}
                     onClick={() => {
                     const tabKeys = {
                     productos: { storage: "activeProductTab", event: "productTabChanged" },
                     usuarios: { storage: "activeUserTab", event: "userTabChanged" },
                     proveedores: { storage: "activeSupplierTab", event: "supplierTabChanged" },
                     entradas: { storage: "activeEntryTab", event: "entryTabChanged" },
                     salidas: { storage: "activeExitTab", event: "exitTabChanged" },
                     categorias: { storage: "activeCategoryTab", event: "categoryTabChanged" },
                     paises: { storage: "activeCountryTab", event: "countryTabChanged" }
                   };
                 const currentConfig = tabKeys[item.key];
                 if (currentConfig) {
                 localStorage.setItem(currentConfig.storage, sub.key);
                 if (window.location.pathname === item.path) {
                 window.dispatchEvent(new Event(currentConfig.event));
             }
             }
            navigate(item.path);
           }}
           >
             <i className={`bi ${sub.icon}`} style={{ marginRight: "0.5rem", fontSize: "1rem" }} />
             <span>{sub.label}</span>
           </button>
           );
         })}
         </div>
         )}
      </div>
       );
     })}
    </nav>
    </div>
    {/* PANEL CONTENT AREA */}
     <div className="fb-main">
      {/* TOPBAR */}
       <div className="fb-topbar">
        <div>
         <h2 className="fb-top-title">
          {menuItems.find(m => location.pathname === m.path)?.label || "Panel"}
           </h2>
            <p style={{ margin: 0 }} className="fb-top-sub">Bienvenido/a </p>
             </div>
            <div className="fb-top-right fb-profile-container" ref={profileRef}>
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="fb-logout-btn fb-profile-trigger-btn">
            <i className="bi bi-person-circle fb-profile-icon" />
            <span>Perfil</span>
              <i className={`bi ${showProfileMenu ? "bi-chevron-up" : "bi-chevron-down"} fb-profile-arrow`} />
              </button>

              {showProfileMenu && (
                  <div className="fb-profile-dropdown">
                    <div className="fb-profile-header">
                     <span className={`fb-role-badge ${userRole.toUpperCase() === "ADMINISTRADOR" ? "admin" : "CLIENTE"}`}>
                     {userRole}
                     </span>
                      <h6 className="fb-profile-name fw-bold text-dark mt-2 mb-1" style={{ fontSize: "0.95rem" }}>
                        {localStorage.getItem("userName") || "Usuario Registrado"}
                      </h6>
                      <p className="fb-profile-email">
                        <i className="bi bi-envelope-fill" /> {userEmail}
                      </p>
                    </div>
                    <button
                        onClick={() => {
                          navigate("my-profile");
                          setShowProfileMenu(false);
                        }}
                        className="fb-profile-edit-btn fb-profile-edit-action-btn mb-2"
                        style={{ width: "100%", textAlign: "left" }}
                    >
                      <i className="bi bi-gear-fill" /> Actualizar datos
                    </button>

                    <button onClick={handleLogout} className="fb-logout-btn fb-profile-logout-action-btn">
                      <i className="bi bi-box-arrow-left"
                      /> Cerrar sesión
               </button>
            </div>
           )}
         </div>
        </div>

        {/* VISTA DINÁMICA DE CONTENIDO */}
         <div className="fb-content">
          {location.pathname === "/freshbasket" && (
          <div
           className="fb-photo-section"
           style={{display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 90px)",
             width: "100%", boxSizing: "border-box", overflow: "hidden", padding: "2rem"
          }}
          >
            <img
            src="/logo1.png"
            alt="Foto principal FreshBasket"
            className="fb-photo"
            style={{ width: "100%", maxWidth: "700px", maxHeight: "calc(100vh - 160px)", objectFit: "contain", display: "block"
            }}
            />
          </div>
          )}
         <Outlet />
        </div>
        </div>
      </div>
  );
}

export default Freshbasket;