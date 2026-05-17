import "../styles/forms.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllUsers, getUserById, createUser,
  updateUser, deleteUser, searchUsersByName
} from "../services/userService.js";

function UsersScreen({ onLogout }) {
  const [allUsers, setAllUsers] = useState([]);
  const [usersByName, setUsersByName] = useState([]);
  const [userById, setUserById] = useState(null);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [formData, setFormData] = useState({
    id: "", name: "", lastName: "", phone: "", email: "", password: "", countryId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/login");
  }, [navigate]);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setAllUsers(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === "") { setUsersByName([]); return; }
    const data = await searchUsersByName(search);
    setUsersByName(data);
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (searchId.trim() === "") { setUserById(null); return; }
    try {
      const user = await getUserById(searchId);
      setUserById(user || null);
    } catch { setUserById(null); }
  };

  const addUser = async (name, last_name, phone, email, password, countryId) => {
    await createUser({ name, last_name, phone, email, password, countryId });
    loadUsers();
  };

  const updateUserById = async (id, payload) => {
    await updateUser(id, payload);
    loadUsers();
  };

  const deleteUserById = async (id) => {
    await deleteUser(id);
    loadUsers();
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleBlurId = async (e) => {
    try {
      const user = await getUserById(e.target.value);
      if (user) {
        setFormData({
          id: user.id || "", name: user.name || "", lastName: user.last_name || "",
          phone: user.phone || "", email: user.email || "",
          password: user.password || "", countryId: user.countryId || "",
        });
      } else alert("No se encontró el usuario con ese ID");
    } catch { alert("Error al consultar usuario"); }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const { id, name, lastName, phone, email, password, countryId } = formData;
    const payload = { name, last_name: lastName, phone, email, password, countryId };
    await updateUserById(id, payload);
    alert("Usuario actualizado correctamente");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const menuItems = [
    { key: "home",   icon: "bi-house-fill",       label: "Inicio" },
    { key: "all",    icon: "bi-people-fill",       label: "Todos los usuarios", action: loadUsers },
    { key: "name",   icon: "bi-search",            label: "Buscar por nombre" },
    { key: "id",     icon: "bi-person-badge-fill", label: "Buscar por ID" },
    { key: "create", icon: "bi-person-plus-fill",  label: "Crear usuario" },
    { key: "update", icon: "bi-pencil-square",     label: "Actualizar usuario" },
    { key: "delete", icon: "bi-trash3-fill",       label: "Eliminar usuario" },
  ];

  const tabColors = {
    home: "#1a6b3a", all: "#1a6b3a", name: "#0d6efd",
    id: "#6f42c1", create: "#198754", update: "#fd7e14", delete: "#dc3545",
  };

  return (
    <div style={u.root}>
      {/* SIDEBAR */}
      <div style={u.sidebar}>
        <div style={u.sidebarBrand}>
          <i className="bi bi-basket3-fill" style={u.sidebarBrandIcon} />
          <span style={u.sidebarBrandName}>FreshBasket</span>
        </div>

        <div style={u.sidebarSection}>MÓDULOS</div>
        <nav style={u.nav}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              style={{
                ...u.navItem,
                ...(activeTab === item.key ? u.navItemActive : {}),
              }}
              onClick={() => { setActiveTab(item.key); if (item.action) item.action(); }}
            >
              <i className={`bi ${item.icon}`} style={u.navIcon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={u.sidebarFooter}>
          <button style={u.logoutBtn} onClick={handleLogout}>
            <i className="bi bi-box-arrow-left" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={u.main}>
        {/* TOPBAR */}
        <div style={u.topbar}>
          <div>
            <h2 style={u.topTitle}>
              {menuItems.find(m => m.key === activeTab)?.label || "Panel"}
            </h2>
            <p style={u.topSub}>Gestión de usuarios del sistema</p>
          </div>
          <div style={u.topRight}>
            <div style={u.adminBadge}>
              <i className="bi bi-person-circle" style={{ fontSize: "1.4rem", color: "#1a6b3a" }} />
              <span style={u.adminName}>Admin</span>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={u.content}>

          {/* HOME */}
          {activeTab === "home" && (
            <div>
              <div style={u.welcomeCard}>
                <div style={u.welcomeLeft}>
                  <h1 style={u.welcomeTitle}>¡Bienvenido a FreshBasket! 🎉</h1>
                  <p style={u.welcomeDesc}>Gestiona tu stock de productos, usuarios y proveedores desde este panel.</p>
                  <button style={u.welcomeBtn} onClick={() => { setActiveTab("all"); loadUsers(); }}>
                    <i className="bi bi-people-fill" /> Ver todos los usuarios
                  </button>
                </div>
                <div style={u.welcomeRight}>
                  <i className="bi bi-basket3-fill" style={u.welcomeIcon} />
                </div>
              </div>

              <div style={u.statsGrid}>
                {[
                  { icon: "bi-people-fill", label: "Usuarios", color: "#1a6b3a", bg: "rgba(46,204,113,0.1)" },
                  { icon: "bi-box-seam-fill", label: "Productos", color: "#0d6efd", bg: "rgba(13,110,253,0.1)" },
                  { icon: "bi-truck", label: "Proveedores", color: "#fd7e14", bg: "rgba(253,126,20,0.1)" },
                  { icon: "bi-graph-up-arrow", label: "Reportes", color: "#6f42c1", bg: "rgba(111,66,193,0.1)" },
                ].map((s, i) => (
                  <div key={i} style={{ ...u.statCard, background: s.bg, borderColor: s.color + "30" }}>
                    <div style={{ ...u.statIcon, color: s.color }}>
                      <i className={`bi ${s.icon}`} />
                    </div>
                    <span style={{ ...u.statLabel, color: s.color }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALL USERS */}
          {activeTab === "all" && (
            <div>
              <div style={u.tableCard}>
                <div style={u.tableHeader}>
                  <h3 style={u.tableTitle}><i className="bi bi-people-fill" /> Todos los Usuarios</h3>
                  <span style={u.badge}>{allUsers.length} registros</span>
                </div>
                {Array.isArray(allUsers) && allUsers.length > 0 ? (
                  <div style={u.tableWrap}>
                    <table style={u.table}>
                      <thead>
                        <tr style={u.thead}>
                          <th style={u.th}>Nombre</th>
                          <th style={u.th}>Email</th>
                          <th style={u.th}>Teléfono</th>
                          <th style={u.th}>País</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((u2, i) => (
                          <tr key={u2.user_id} style={i % 2 === 0 ? u.trEven : u.trOdd}>
                            <td style={u.td}>
                              <div style={u.userCell}>
                                <div style={u.userAvatar}>{u2.name?.[0]?.toUpperCase()}</div>
                                <span>{u2.name} {u2.last_name}</span>
                              </div>
                            </td>
                            <td style={u.td}>{u2.email}</td>
                            <td style={u.td}>{u2.phone}</td>
                            <td style={u.td}><span style={u.countryBadge}>{u2.countryId}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={u.empty}><i className="bi bi-inbox" style={{ fontSize: "2rem" }} /><p>No hay usuarios registrados</p></div>
                )}
              </div>
            </div>
          )}

          {/* SEARCH BY NAME */}
          {activeTab === "name" && (
            <div style={u.formSection}>
              <div style={u.formCard}>
                <h3 style={u.formTitle}><i className="bi bi-search" /> Buscar por Nombre</h3>
                <form onSubmit={handleSearch} style={u.searchForm}>
                  <div style={u.searchInputWrap}>
                    <i className="bi bi-person" style={u.searchIcon} />
                    <input type="text" style={u.searchInput} placeholder="Ej: Martin Antonio"
                      value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <button type="submit" style={u.searchBtn}>
                    <i className="bi bi-search" /> Buscar
                  </button>
                </form>
              </div>
              {usersByName.length > 0 && (
                <div style={u.resultsGrid}>
                  {usersByName.map(u2 => (
                    <div key={u2.user_id} style={u.userCard}>
                      <div style={u.userCardAvatar}>{u2.name?.[0]?.toUpperCase()}</div>
                      <div style={u.userCardInfo}>
                        <p style={u.userCardName}>{u2.name} {u2.last_name}</p>
                        <p style={u.userCardDetail}><i className="bi bi-envelope" /> {u2.email}</p>
                        <p style={u.userCardDetail}><i className="bi bi-telephone" /> {u2.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {search && usersByName.length === 0 && (
                <div style={u.empty}><i className="bi bi-search" style={{ fontSize: "2rem" }} /><p>No se encontraron usuarios con ese nombre</p></div>
              )}
            </div>
          )}

          {/* SEARCH BY ID */}
          {activeTab === "id" && (
            <div style={u.formSection}>
              <div style={u.formCard}>
                <h3 style={u.formTitle}><i className="bi bi-person-badge-fill" /> Buscar por ID</h3>
                <form onSubmit={handleSearchById} style={u.searchForm}>
                  <div style={u.searchInputWrap}>
                    <i className="bi bi-hash" style={u.searchIcon} />
                    <input type="number" style={u.searchInput} placeholder="Ingrese ID"
                      value={searchId} onChange={e => setSearchId(e.target.value)} />
                  </div>
                  <button type="submit" style={u.searchBtn}>
                    <i className="bi bi-search" /> Buscar
                  </button>
                </form>
              </div>
              {userById && (
                <div style={u.detailCard}>
                  <div style={u.detailAvatar}>{userById.name?.[0]?.toUpperCase()}</div>
                  <div style={u.detailInfo}>
                    <h4 style={u.detailName}>{userById.name} {userById.last_name}</h4>
                    <p style={u.detailItem}><i className="bi bi-envelope" /> {userById.email}</p>
                    <p style={u.detailItem}><i className="bi bi-telephone" /> {userById.phone}</p>
                    <p style={u.detailItem}><i className="bi bi-globe" /> País ID: {userById.countryId}</p>
                  </div>
                </div>
              )}
              {!userById && searchId && (
                <div style={u.empty}><i className="bi bi-person-x" style={{ fontSize: "2rem" }} /><p>No se encontró usuario con ese ID</p></div>
              )}
            </div>
          )}

          {/* CREATE */}
          {activeTab === "create" && (
            <div style={u.formSection}>
              <div style={u.formCard}>
                <h3 style={u.formTitle}><i className="bi bi-person-plus-fill" /> Crear Nuevo Usuario</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    await createUser({
                      name: fd.get("name"), last_name: fd.get("lastName"),
                      phone: fd.get("phone"), email: fd.get("email"),
                      password: fd.get("password"), countryId: fd.get("countryId"),
                    });
                    alert("Usuario creado correctamente");
                    e.target.reset();
                  } catch (error) {
                    alert("Error al crear usuario: " + (error.response?.data?.message || "ver consola"));
                  }
                }} style={u.crudForm}>
                  <div style={u.crudGrid}>
                    {[
                      { label: "Nombre", name: "name", icon: "bi-person", placeholder: "Nombre" },
                      { label: "Apellido", name: "lastName", icon: "bi-person", placeholder: "Apellido" },
                      { label: "Teléfono", name: "phone", icon: "bi-telephone", placeholder: "7777-7777" },
                      { label: "ID de País", name: "countryId", icon: "bi-globe", type: "number", placeholder: "Ej: 1" },
                      { label: "Email", name: "email", icon: "bi-envelope", type: "email", placeholder: "correo@ejemplo.com" },
                      { label: "Contraseña", name: "password", icon: "bi-lock", type: "password", placeholder: "••••••••" },
                    ].map((f) => (
                      <div key={f.name} style={u.crudField}>
                        <label style={u.crudLabel}>{f.label}</label>
                        <div style={u.crudInputWrap}>
                          <i className={`bi ${f.icon}`} style={u.crudInputIcon} />
                          <input type={f.type || "text"} name={f.name} style={u.crudInput}
                            placeholder={f.placeholder} required
                            onFocus={e => e.target.style.borderColor = "#2ecc71"}
                            onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="submit" style={{ ...u.actionBtn, background: "linear-gradient(135deg,#1a6b3a,#2ecc71)" }}>
                    <i className="bi bi-person-check-fill" /> Crear Usuario
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* UPDATE */}
          {activeTab === "update" && (
            <div style={u.formSection}>
              <div style={u.formCard}>
                <h3 style={u.formTitle}><i className="bi bi-pencil-square" /> Actualizar Usuario</h3>
                <form onSubmit={handleUpdateSubmit} style={u.crudForm}>
                  <div style={u.crudGrid}>
                    {[
                      { label: "ID Usuario", name: "id", icon: "bi-hash", type: "number", placeholder: "User ID", onBlur: handleBlurId },
                      { label: "Nombre", name: "name", icon: "bi-person", placeholder: "Nombre" },
                      { label: "Apellido", name: "lastName", icon: "bi-person", placeholder: "Apellido" },
                      { label: "Teléfono", name: "phone", icon: "bi-telephone", placeholder: "Teléfono" },
                      { label: "Email", name: "email", icon: "bi-envelope", type: "email", placeholder: "Email" },
                      { label: "Contraseña", name: "password", icon: "bi-lock", type: "password", placeholder: "••••••••" },
                      { label: "ID País", name: "countryId", icon: "bi-globe", type: "number", placeholder: "ID País" },
                    ].map((f) => (
                      <div key={f.name} style={u.crudField}>
                        <label style={u.crudLabel}>{f.label}</label>
                        <div style={u.crudInputWrap}>
                          <i className={`bi ${f.icon}`} style={u.crudInputIcon} />
                          <input type={f.type || "text"} name={f.name} style={u.crudInput}
                            placeholder={f.placeholder} value={formData[f.name]}
                            onChange={handleChange} onBlur={f.onBlur}
                            required
                            onFocus={e => e.target.style.borderColor = "#fd7e14"}
                            onBlurCapture={e => { if (!f.onBlur) e.target.style.borderColor = "#e5e7eb"; }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="submit" style={{ ...u.actionBtn, background: "linear-gradient(135deg,#b45309,#fd7e14)" }}>
                    <i className="bi bi-check-circle-fill" /> Actualizar Usuario
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* DELETE */}
          {activeTab === "delete" && (
            <div style={u.formSection}>
              <div style={{ ...u.formCard, borderTop: "4px solid #dc3545" }}>
                <h3 style={{ ...u.formTitle, color: "#dc3545" }}><i className="bi bi-trash3-fill" /> Eliminar Usuario</h3>
                <p style={{ color: "#7a8694", fontSize: "0.9rem", marginBottom: "1.2rem" }}>
                  ⚠️ Esta acción es irreversible. Ingresa el ID del usuario a eliminar.
                </p>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const { id } = e.target;
                  try {
                    const status = await deleteUser(id.value);
                    if (status === 200 || status === 204) alert("Usuario eliminado correctamente");
                    else alert("No se pudo eliminar el usuario");
                    e.target.reset();
                  } catch { alert("Error al eliminar usuario"); }
                }} style={u.searchForm}>
                  <div style={u.searchInputWrap}>
                    <i className="bi bi-hash" style={u.searchIcon} />
                    <input type="number" name="id" style={u.searchInput} placeholder="ID del usuario a eliminar" required />
                  </div>
                  <button type="submit" style={{ ...u.searchBtn, background: "#dc3545" }}>
                    <i className="bi bi-trash3" /> Eliminar
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

const u = {
  root: { display: "flex", minHeight: "100vh", fontFamily: "'Nunito', sans-serif", background: "#f4f7f4" },
  // Sidebar
  sidebar: {
    width: "240px", minWidth: "240px", background: "linear-gradient(180deg, #1a6b3a 0%, #145a32 100%)",
    display: "flex", flexDirection: "column", padding: "1.5rem 0",
    boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
  },
  sidebarBrand: { display: "flex", alignItems: "center", gap: "0.6rem", padding: "0 1.5rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.15)" },
  sidebarBrandIcon: { fontSize: "1.8rem", color: "#2ecc71" },
  sidebarBrandName: { fontFamily: "'Poppins', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#fff" },
  sidebarSection: { padding: "1rem 1.5rem 0.4rem", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1px" },
  nav: { display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0.5rem 0.8rem", flex: 1 },
  navItem: {
    display: "flex", alignItems: "center", gap: "0.7rem",
    padding: "0.65rem 0.8rem", borderRadius: "10px",
    background: "none", border: "none", color: "rgba(255,255,255,0.75)",
    cursor: "pointer", fontSize: "0.88rem", fontWeight: 600, textAlign: "left",
    transition: "all 0.2s",
  },
  navItemActive: { background: "rgba(255,255,255,0.15)", color: "#fff" },
  navIcon: { fontSize: "1rem", width: "18px" },
  sidebarFooter: { padding: "1rem 0.8rem", borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: "auto" },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: "0.7rem",
    padding: "0.65rem 0.8rem", borderRadius: "10px",
    background: "rgba(220,53,69,0.2)", border: "none",
    color: "#ff8a8a", cursor: "pointer", fontSize: "0.88rem",
    fontWeight: 600, width: "100%",
  },
  // Main
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "1.2rem 2rem", background: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  topTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1.3rem", fontWeight: 700, color: "#1a1a2e", margin: 0 },
  topSub: { fontSize: "0.82rem", color: "#7a8694", margin: 0 },
  topRight: { display: "flex", alignItems: "center", gap: "1rem" },
  adminBadge: { display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" },
  adminName: { fontWeight: 700, color: "#1a1a2e", fontSize: "0.9rem" },
  content: { flex: 1, padding: "1.5rem 2rem", overflowY: "auto" },
  // Welcome
  welcomeCard: {
    background: "linear-gradient(135deg, #1a6b3a, #2ecc71)",
    borderRadius: "16px", padding: "2rem", display: "flex",
    alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem",
    color: "#fff",
  },
  welcomeLeft: {},
  welcomeTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" },
  welcomeDesc: { fontSize: "0.92rem", opacity: 0.88, marginBottom: "1rem" },
  welcomeBtn: {
    background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)",
    color: "#fff", padding: "0.5rem 1.2rem", borderRadius: "8px",
    cursor: "pointer", fontWeight: 700, fontSize: "0.88rem",
    display: "flex", alignItems: "center", gap: "0.4rem",
  },
  welcomeRight: { opacity: 0.2 },
  welcomeIcon: { fontSize: "5rem" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" },
  statCard: {
    borderRadius: "12px", padding: "1.2rem", display: "flex",
    flexDirection: "column", alignItems: "center", gap: "0.5rem",
    border: "1px solid", cursor: "pointer",
  },
  statIcon: { fontSize: "1.8rem" },
  statLabel: { fontWeight: 700, fontSize: "0.88rem" },
  // Table
  tableCard: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 15px rgba(0,0,0,0.06)" },
  tableHeader: { padding: "1.2rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" },
  tableTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#1a1a2e", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" },
  badge: { background: "rgba(46,204,113,0.15)", color: "#1a6b3a", padding: "0.2rem 0.7rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafb" },
  th: { padding: "0.75rem 1.2rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "#7a8694", textTransform: "uppercase", letterSpacing: "0.5px" },
  td: { padding: "0.85rem 1.2rem", fontSize: "0.88rem", color: "#374151", borderBottom: "1px solid #f5f5f5" },
  trEven: { background: "#fff" },
  trOdd: { background: "#fafcfa" },
  userCell: { display: "flex", alignItems: "center", gap: "0.6rem" },
  userAvatar: {
    width: "32px", height: "32px", borderRadius: "50%",
    background: "linear-gradient(135deg,#1a6b3a,#2ecc71)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
  },
  countryBadge: { background: "#f0faf4", color: "#1a6b3a", padding: "0.15rem 0.6rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 },
  empty: { padding: "3rem", textAlign: "center", color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" },
  // Forms
  formSection: { display: "flex", flexDirection: "column", gap: "1.2rem" },
  formCard: { background: "#fff", borderRadius: "16px", padding: "1.8rem", boxShadow: "0 2px 15px rgba(0,0,0,0.06)" },
  formTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "#1a1a2e", marginBottom: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" },
  searchForm: { display: "flex", gap: "0.8rem" },
  searchInputWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", color: "#9ca3af", fontSize: "0.9rem" },
  searchInput: {
    width: "100%", padding: "0.7rem 1rem 0.7rem 2.4rem",
    border: "2px solid #e5e7eb", borderRadius: "10px",
    fontSize: "0.9rem", fontFamily: "'Nunito', sans-serif",
    outline: "none", background: "#f9fafb",
  },
  searchBtn: {
    display: "flex", alignItems: "center", gap: "0.4rem",
    padding: "0.7rem 1.4rem",
    background: "linear-gradient(135deg,#1a6b3a,#2ecc71)",
    color: "#fff", border: "none", borderRadius: "10px",
    fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", whiteSpace: "nowrap",
  },
  resultsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" },
  userCard: { background: "#fff", borderRadius: "12px", padding: "1.2rem", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", gap: "1rem", alignItems: "center" },
  userCardAvatar: {
    width: "48px", height: "48px", borderRadius: "50%",
    background: "linear-gradient(135deg,#1a6b3a,#2ecc71)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.2rem", fontWeight: 700, flexShrink: 0,
  },
  userCardInfo: {},
  userCardName: { fontWeight: 700, color: "#1a1a2e", margin: "0 0 0.3rem", fontSize: "0.95rem" },
  userCardDetail: { fontSize: "0.82rem", color: "#7a8694", margin: "0.15rem 0", display: "flex", alignItems: "center", gap: "0.3rem" },
  detailCard: { background: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 2px 15px rgba(0,0,0,0.06)", display: "flex", gap: "1.5rem", alignItems: "center" },
  detailAvatar: {
    width: "70px", height: "70px", borderRadius: "50%",
    background: "linear-gradient(135deg,#1a6b3a,#2ecc71)",
    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "2rem", fontWeight: 700, flexShrink: 0,
  },
  detailInfo: {},
  detailName: { fontFamily: "'Poppins', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#1a1a2e", margin: "0 0 0.5rem" },
  detailItem: { fontSize: "0.9rem", color: "#7a8694", margin: "0.3rem 0", display: "flex", alignItems: "center", gap: "0.4rem" },
  crudForm: { display: "flex", flexDirection: "column", gap: "1rem" },
  crudGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" },
  crudField: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  crudLabel: { fontSize: "0.8rem", fontWeight: 700, color: "#374151" },
  crudInputWrap: { position: "relative", display: "flex", alignItems: "center" },
  crudInputIcon: { position: "absolute", left: "11px", color: "#9ca3af", fontSize: "0.85rem", pointerEvents: "none" },
  crudInput: {
    width: "100%", padding: "0.6rem 0.8rem 0.6rem 2.2rem",
    border: "2px solid #e5e7eb", borderRadius: "9px",
    fontSize: "0.87rem", fontFamily: "'Nunito', sans-serif",
    outline: "none", background: "#f9fafb", transition: "border-color 0.25s",
  },
  actionBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
    padding: "0.75rem", color: "#fff", border: "none", borderRadius: "10px",
    fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem", fontWeight: 600,
    cursor: "pointer", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", marginTop: "0.3rem",
  },
};

export default UsersScreen;
