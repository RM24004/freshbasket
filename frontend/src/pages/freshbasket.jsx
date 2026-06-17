import "../styles/freshbasket.css";
import { tieneAcceso } from "../Config/permissions";
import { NotificationBell } from "../components/NotificationBell";
import Profile from "./profile.jsx";
import { useStockAlerts } from "../hooks/useStockAlerts";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

function Freshbasket({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extrae el rol y correo de cada usuario para mostrarse en el perfil
  const userRole = (localStorage.getItem("userRole") || "USUARIO").toUpperCase().trim();
  const userEmail = localStorage.getItem("userEmail") || "correodeejemplo@mail.com";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [isTabNone, setIsTabNone] = useState(true);

  const [openMenus, setOpenMenus] = React.useState({
    [location.pathname.split("/")[2]]: true
  });

  const isAdmin = userRole === "ADMINISTRADOR" || userRole === "ADMIN";

  // Helper para obtener la pestaña activa real del módulo actual en el localStorage
  const getActiveTabForCurrentModule = (path) => {
    const currentModule = path.split("/")[2];
    if (!currentModule) return "none";

    const mapping = {
      productos: "active_products_Tab",
      usuarios: "active_users_Tab",
      proveedores: "active_suppliers_Tab",
      entradas: "active_entries_Tab",
      salidas: "active_exits_Tab",
      categorias: "active_categories_Tab",
      paises: "active_countries_Tab"
    };
    return localStorage.getItem(mapping[currentModule]) || "none";
  };

  // Sincronizar el estado de la foto cuando cambia la URL
  React.useEffect(() => {
    const currentModule = location.pathname.split("/")[2];
    setOpenMenus(() => {
      if (!currentModule) return {};
      return { [currentModule]: true };
    });

    const activeTab = getActiveTabForCurrentModule(location.pathname);
    setIsTabNone(activeTab === "none");
  }, [location.pathname]);

  // Escuchar los eventos globales para mostrar la foto de inicio
  useEffect(() => {
    const handleTabChange = () => {
      const activeTab = getActiveTabForCurrentModule(window.location.pathname);
      setIsTabNone(activeTab === "none");
    };

    const events = [
      "productsTabChanged",
      "usersTabChanged",
      "suppliersTabChanged",
      "entriesTabChanged",
      "exitsTabChanged",
      "categoriesTabChanged",
      "countriesTabChanged"
    ];

    events.forEach(evt => window.addEventListener(evt, handleTabChange));
    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleTabChange));
    };
  }, [location.pathname]);

  // Inicializador de pestañas
  useEffect(() => {
    const modules = [
      "active_products_Tab",
      "active_users_Tab",
      "active_suppliers_Tab",
      "active_entries_Tab",
      "active_exits_Tab",
      "active_categories_Tab",
      "active_countries_Tab"
    ];
    modules.forEach(key => {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "none");
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
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    if (onLogout) onLogout();
    navigate("/login");
  };

  // MENÚ PRINCIPAL
  const menuItems = React.useMemo(() => {
    return [
      { key: "home",         icon: "bi-house-door",         label: "Inicio",        path: "/freshbasket" },
      { key: "productos",    icon: "bi-basket3",            label: "Productos",     path: "/freshbasket/productos", hasSubmenu: true },

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "entradas",     icon: "bi-arrow-up-circle",    label: "Entradas" ,   path: "/freshbasket/entradas", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "salidas",      icon: "bi-arrow-right-circle",  label: "Salidas" ,    path: "/freshbasket/salidas", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "proveedores",  icon: "bi-truck",              label: "Proveedores", path: "/freshbasket/proveedores", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "verModuloUsuarios") ? [
        { key: "usuarios",     icon: "bi-people",             label: "Usuarios",    path: "/freshbasket/usuarios", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "categorias",   icon: "bi-list-stars",         label: "Categorias",  path: "/freshbasket/categorias", hasSubmenu: true }
      ] : []),

      ...(tieneAcceso(userRole, "crear") ? [
        { key: "paises",       icon: "bi-globe",              label: "Paises",      path: "/freshbasket/paises", hasSubmenu: true }
      ] : []),
    ];
  }, [userRole]);

  // SubMenús Visuales del CRUD
  const productSubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verTabsConsulta") ? [
      { key: "all",    icon: "bi-basket3",    label: "Todos los productos" },
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
  ], [userRole]);

  const userSubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verModuloUsuarios") ? [
      { key: "all",    icon: "bi-people",    label: "Todos los usuarios" },
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
  ], [userRole]);

  const supplierSubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verTabsConsulta") ? [
      { key: "all",    icon: "bi-truck",    label: "Todos los proveedores" },
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
  ], [userRole]);

  const entrySubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verTabsConsulta") ? [
      { key: "all",    icon: "bi-arrow-up-circle",    label: "Todas las entradas" },
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
  ], [userRole]);

  const exitSubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verTabsConsulta") ? [
      { key: "all",    icon: "bi-arrow-right-circle",    label: "Todas las salidas" },
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
  ], [userRole]);

  const categorySubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verTabsConsulta") ? [
      { key: "all",    icon: "bi-list-stars",    label: "Todas las categorias" },
      { key: "name",   icon: "bi-tag-fill",         label: "Buscar por nombre" },
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
  ], [userRole]);

  const countrySubItems = React.useMemo(() => [
    ...(tieneAcceso(userRole, "verTabsConsulta") ? [
      { key: "all",    icon: "bi-globe",    label: "Todos los paises" },
      { key: "name",   icon: "bi-tag-fill",         label: "Buscar por nombre" },
      { key: "id",     icon: "bi-tag-fill",         label: "Buscar por ID" }
    ] : []),
    ...(tieneAcceso(userRole, "crear") ? [
      { key: "create", icon: "bi-plus-circle-fill", label: "Registrar pais" }
    ] : []),
    ...(tieneAcceso(userRole, "actualizar") ? [
      { key: "update", icon: "bi-pencil-square",    label: "Actualizar pais" }
    ] : []),
    ...(tieneAcceso(userRole, "eliminar") ? [
      { key: "delete", icon: "bi-trash3-fill",      label: "Eliminar pais" }
    ] : [])
  ], [userRole]);

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
                            setOpenMenus((prev) => ({ ...prev, [item.key]: !isMenuOpen }));
                          } else {
                            setOpenMenus((prev) => ({ ...prev, [item.key]: true }));
                          }

                          if (item.path) {
                            const tabKeys = {
                              productos: { storage: "active_products_Tab", event: "productsTabChanged" },
                              usuarios: { storage: "active_users_Tab", event: "usersTabChanged" },
                              proveedores: { storage: "active_suppliers_Tab", event: "suppliersTabChanged" },
                              entradas: { storage: "active_entries_Tab", event: "entriesTabChanged" },
                              salidas: { storage: "active_exits_Tab", event: "exitsTabChanged" },
                              categorias: { storage: "active_categories_Tab", event: "categoriesTabChanged" },
                              paises: { storage: "active_countries_Tab", event: "countriesTabChanged" }
                            };

                            const currentConfig = tabKeys[item.key];

                            if (currentConfig) {
                              localStorage.setItem(currentConfig.storage, "none");
                              window.dispatchEvent(new Event(currentConfig.event));
                            }

                            navigate(item.path);
                          }
                        }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                        {item.icon && <i className={`bi ${item.icon} fb-nav-icon`} style={{ fontSize: "1.1rem" }} />}
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
                                item.key === "productos" ? "active_products_Tab" :
                                    item.key === "usuarios" ? "active_users_Tab" :
                                        item.key === "proveedores" ? "active_suppliers_Tab" :
                                            item.key === "entradas" ? "active_entries_Tab" :
                                                item.key === "salidas" ? "active_exits_Tab" :
                                                    item.key === "categorias" ? "active_categories_Tab" :
                                                        item.key === "paises" ? "active_countries_Tab" : "";

                            const currentActiveTab = localStorage.getItem(storageKey) || "none";
                            const isSubActive = currentActiveTab === sub.key;
                            return (
                                <button
                                    key={sub.key}
                                    className="fb-nav-item"
                                    style={{
                                      fontSize: "0.85rem", padding: "0.5rem 0.75rem", background: isSubActive ? "rgba(255,255,255,0.1)" : "transparent",
                                      border: "none", fontWeight: isSubActive ? "bold" : "normal"
                                    }}
                                    onClick={() => {
                                      const tabKeys = {
                                        productos: { storage: "active_products_Tab", event: "productsTabChanged" },
                                        usuarios: { storage: "active_users_Tab", event: "usersTabChanged" },
                                        proveedores: { storage: "active_suppliers_Tab", event: "suppliersTabChanged" },
                                        entradas: { storage: "active_entries_Tab", event: "entriesTabChanged" },
                                        salidas: { storage: "active_exits_Tab", event: "exitsTabChanged" },
                                        categorias: { storage: "active_categories_Tab", event: "categoriesTabChanged" },
                                        paises: { storage: "active_countries_Tab", event: "countriesTabChanged" }
                                      };
                                      const currentConfig = tabKeys[item.key];
                                      if (currentConfig) {
                                        localStorage.setItem(currentConfig.storage, sub.key);
                                        window.dispatchEvent(new Event(currentConfig.event));
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

            {/* SECCIÓN DERECHA DE LA TOPBAR */}
            <div className="fb-top-right">
              <NotificationBell isAdmin={isAdmin} />

              {/* CONTENEDOR DE PERFIL */}
              <div className="fb-profile-container" ref={profileRef} style={{ position: "relative" }}>
                <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="fb-logout-btn fb-profile-trigger-btn"
                >
                  <i className="bi bi-person-circle fb-profile-icon" />
                  <span>Perfil</span>
                  <i className={`bi ${showProfileMenu ? "bi-chevron-up" : "bi-chevron-down"} fb-profile-arrow`} />
                </button>

                {showProfileMenu && (
                    <div className="fb-profile-dropdown">
                      <div className="fb-profile-header">
              <span className={`fb-role-badge ${userRole.toUpperCase()}`}>
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
                        <i className="bi bi-box-arrow-left" /> Cerrar sesión
                      </button>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* VISTA DINÁMICA DE CONTENIDO */}
          <div className="fb-content">
            {(location.pathname === "/freshbasket" || (isTabNone && !location.pathname.endsWith("my-profile"))) && (
                <div
                    className="fb-photo-section"
                    style={{
                      display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 90px)",
                      width: "100%", boxSizing: "border-box", overflow: "hidden", padding: "2rem"
                    }}
                >
                  <img
                      src="/logo1.png"
                      alt="Foto principal FreshBasket"
                      className="fb-photo"
                      style={{
                        width: "100%", maxWidth: "700px", maxHeight: "calc(100vh - 160px)", objectFit: "contain", display: "block"
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