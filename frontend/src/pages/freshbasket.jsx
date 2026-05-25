// Nuestra pagina principal
import "../styles/freshbasket.css";
import { tieneAcceso } from "../config/permissions.js";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

function Freshbasket({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  //Extrae el rol y correo de cada usuario para mostrarse en el perfil
  const userRole = (localStorage.getItem("userRole") || "USUARIO").toUpperCase().trim();
  const userEmail = localStorage.getItem("userEmail") || "correodeejemplo@mail.com";

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Desde aquí manejamos nuestro submenu
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isSuppliersOpen, setIsSuppliersOpen] = useState(false);

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

    //Menú de opciones, controlamos quienes tienen acceso a los diferentes botones
    const menuItems = React.useMemo(() => {
      return [
        { key: "home",         icon: "bi-house-fill",         label: "Inicio",      path: "/freshbasket" },
        { key: "productos",    icon: "bi-basket3-fill",       label: "Productos",    path: "/freshbasket/productos", hasSubmenu: true },
        { key: "entradas",     icon: "bi-box-arrow-in-down",  label: "Entradas" },
        { key: "salidas",      icon: "bi-box-arrow-up",       label: "Salidas" },
        { key: "proveedores",  icon: "bi-truck",              label: "Proveedores",  path: "/freshbasket/proveedores", hasSubmenu: true },


        ...(tieneAcceso(userRole, "verModuloUsuarios") ? [
          { key: "usuarios",     icon: "bi-people-fill",        label: "Usuarios",     path: "/freshbasket/usuarios", hasSubmenu: true }
        ] : []),

        { key: "categorías",   icon: "bi-tags-fill",          label: "Categorías" },
        { key: "paises",       icon: "bi-globe-americas",     label: "Países" },
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

              // Controlar el estado de apertura/cierre del menú desplegable
              const isMenuOpen =
                item.key === "productos" ? isProductsOpen :
                item.key === "usuarios" ? isUsersOpen :
                item.key === "proveedores" ? isSuppliersOpen :
                false;

              // Obtener los sub-ítems filtrados dinámicamente
              const subItemsArr =
                item.key === "productos" ? productSubItems :
                item.key === "usuarios" ? userSubItems :
                item.key === "proveedores" ? supplierSubItems :
                [];

              return (
                <div key={item.key} style={{ width: "100%" }}>
                  <button
                    className={`fb-nav-item ${isActive ? "fb-nav-item-active" : ""}`}
                    onClick={() => {
                      if (item.key === "productos") {
                        setIsProductsOpen(!isProductsOpen);
                        setIsUsersOpen(false);
                        setIsSuppliersOpen(false);
                        navigate(item.path);
                      } else if (item.key === "usuarios") {
                        setIsUsersOpen(!isUsersOpen);
                        setIsProductsOpen(false);
                        setIsSuppliersOpen(false);
                        navigate(item.path);
                      } else if (item.key === "proveedores") {
                        setIsSuppliersOpen(!isSuppliersOpen);
                        setIsProductsOpen(false);
                        setIsUsersOpen(false);
                        navigate(item.path);
                      } else if (item.path) {
                        setIsProductsOpen(false);
                        setIsUsersOpen(false);
                        setIsSuppliersOpen(false);
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
                  {/* Se añade la validación subItemsArr.length > 0 para que no pinte nada si no hay permisos */}
                  {item.hasSubmenu && isMenuOpen && subItemsArr.length > 0 && (
                    <div className="fb-sidebar-submenu" style={{ paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.25rem", marginTop: "0.25rem" }}>
                      {subItemsArr.map((sub) => (
                        <button
                          key={sub.key}
                          className="fb-nav-item"
                          style={{ fontSize: "0.85rem", padding: "0.5rem 0.75rem", background: "transparent", border: "none" }}
                          onClick={() => {
                            if (item.key === "productos") {
                              localStorage.setItem("activeProductTab", sub.key);
                              window.dispatchEvent(new Event("productTabChanged"));
                            } else if (item.key === "usuarios") {
                              localStorage.setItem("activeUserTab", sub.key);
                              window.dispatchEvent(new Event("userTabChanged"));
                            }
                            else if (item.key === "proveedores") {
                              localStorage.setItem("activeSupplierTab", sub.key);
                              window.dispatchEvent(new Event("supplierTabChanged"));
                            }

                            navigate(item.path);
                          }}
                        >
                          <i className={`bi ${sub.icon}`} style={{ marginRight: "0.5rem", fontSize: "1rem" }} />
                          <span>{sub.label}</span>
                        </button>
                      ))}
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
              <p style={{ margin: 0 }} className="fb-top-sub">Bienvenido/a</p>
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
                    <span className={`fb-role-badge ${userRole.toUpperCase() === "ADMIN" ? "admin" : "usuario"}`}>{userRole}</span>
                    <p className="fb-profile-email"><i className="bi bi-envelope-fill" />{userEmail}</p>
                  </div>
                  <button onClick={handleLogout} className="fb-logout-btn fb-profile-logout-action-btn">
                    <i className="bi bi-box-arrow-left" />Cerrar Sesión
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
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "calc(100vh - 90px)",
                          width: "100%",
                          boxSizing: "border-box",
                          overflow: "hidden",
                          padding: "2rem"
                        }}
                      >
                        <img
                          src="/logo1.png"
                          alt="Foto principal FreshBasket"
                          className="fb-photo"
                          style={{
                            width: "100%",
                            maxWidth: "700px",
                            maxHeight: "calc(100vh - 160px)",
                            objectFit: "contain",
                            display: "block"
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