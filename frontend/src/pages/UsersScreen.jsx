import "../styles/forms.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";   // ← IMPORTANTE

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsersByName
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
    id: "",
    name: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    countryId: "",
  });

  const navigate = useNavigate();

  // Protege la ruta
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // CRUD
  const loadUsers = async () => {
    const data = await getAllUsers();
    setAllUsers(data);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (search.trim() === "") {
      setUsersByName([]);
    } else {
      const data = await searchUsersByName(search);
      setUsersByName(data);
    }
  };

const handleSearchById = async (e) => {
  e.preventDefault();
  if (searchId.trim() === "") {
    setUserById(null);
    return;
  }
  try {
    const user = await getUserById(searchId);
    if (user) {
      setUserById(user);
    } else {
      setUserById(null); // fuerza null si no existe
    }
  } catch (error) {
    console.error("Error buscando usuario:", error);
    setUserById(null); // también null en caso de error
  }
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

  // Manejo de formulario de actualización
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlurId = async (e) => {
    try {
      const user = await getUserById(e.target.value);
      if (user) {
        setFormData({
          id: user.id || "",
          name: user.name || "",
          lastName: user.last_name || "",
          phone: user.phone || "",
          email: user.email || "",
          password: user.password || "",
          countryId: user.countryId || "",
        });
      } else {
        alert("No se encontró el usuario con ese ID");
      }
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      alert("Error al consultar usuario");
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const { id, name, lastName, phone, email, password, countryId } = formData;
    const payload = { name, last_name: lastName, phone, email, password, countryId };
    await updateUserById(id, payload);
    alert("Usuario actualizado correctamente");
  };

  return (
    <div className="users-container">
      {/* Botón Menu */}
      <button className="menu-button" onClick={() => setShowMenu(!showMenu)}>
        Usuarios
      </button>

      {/* Menú desplegable */}
      {showMenu && (
        <div className="menu-grid">
          <button className="menu-item" onClick={() => { setActiveTab("all"); loadUsers(); setShowMenu(false); }}>
            Buscar todos
          </button>
          <button className="menu-item" onClick={() => { setActiveTab("name"); setShowMenu(false); }}>
            Buscar usuario por nombre
          </button>
          <button className="menu-item" onClick={() => { setActiveTab("id"); setShowMenu(false); }}>
            Buscar usuario por ID
          </button>
          <button className="menu-item" onClick={() => { setActiveTab("create"); setShowMenu(false); }}>
            Crear usuario
          </button>
          <button className="menu-item" onClick={() => { setActiveTab("update"); setShowMenu(false); }}>
            Actualizar usuario
          </button>
          <button className="menu-item" onClick={() => { setActiveTab("delete"); setShowMenu(false); }}>
            Eliminar usuario
          </button>
        </div>
      )}

      {/* Botón cerrar sesión */}
   <div className="logout-container">
          <button className="logout-btn" onClick={handleLogout}>
           Cerrar Sesión
         </button>
      </div>

      {/* Contenido dinámico */}
        <div className="users-content">
         {activeTab === "home" && (
         <div className="welcome-box">
          <h1> Bienvenido a Freshbasket</h1>
          <h2>Gestiona tu Stock de productos</h2>
        </div>
        )}

{activeTab === "all" && (
  <div className="search-container">
    <h3 className="results-title">Mostrando todos los usuarios</h3>

    {/* Resultados */}
    <div className="search-results">
      {Array.isArray(allUsers) && allUsers.length > 0 ? (
        <ul className="list-group mb-3">
          {allUsers.map((u) => (
            <li key={u.user_id} className="list-group-item">
              <div><strong>Nombre:</strong> {u.name} {u.last_name}</div>
              <div><strong>Email:</strong> {u.email}</div>
              <div><strong>Teléfono:</strong> {u.phone}</div>
              <div><strong>CountryID:</strong> {u.countryId}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay usuarios registrados.</p>
      )}
    </div>
  </div>
)}


{activeTab === "name" && (
  /* Contenedor principal: Apila búsqueda y resultados en columna y los centra */
  <div className="d-flex flex-column align-items-center w-100 animate__animated animate__fadeIn">
      <h3 className="results-title">Ingrese un nombre del usuario</h3>
    {/* 1. Tarjeta de Búsqueda (Igual a la de ID) */}
    <div className="card shadow-lg border-0 p-1 mb-4" style={{ borderRadius: '20px', width: '100%', maxWidth: '450px' }}>
      <form onSubmit={handleSearch}>
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control bg-light py-2 text-center"
            placeholder="Ej: Martin Antonio"
            style={{ borderRadius: '10px', border: '1px solid #dee2e6' }}
          />
        </div>

        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-primary fw-bold px-5 py-2 shadow-sm"
            style={{ borderRadius: '15px', minWidth: '250px' }}
          >
            Buscar por nombre
          </button>
        </div>
      </form>
    </div>

    {/* 2. Lista de Resultados debajo y centrada */}
    {usersByName.length > 0 && (
      <div className="w-100 d-flex flex-column align-items-center animate__animated animate__fadeInUp">
        <h5 className="text-muted fw-bold mb-3">Resultados encontrados ({usersByName.length})</h5>

        {usersByName.map((u) => (
          <div
            key={u.user_id}
            className="card shadow-sm border-0 p-4 mb-3"
            style={{ borderRadius: '15px', width: '100%', maxWidth: '500px' }}
          >
            <div className="text-start">
              <p className="mb-1"><strong>Nombre:</strong> {u.name} {u.last_name}</p>
              <p className="mb-1"><strong>Email:</strong> {u.email}</p>
              <p className="mb-1"><strong>Teléfono:</strong> {u.phone}</p>
              <p className="mb-0"><strong>CountryID:</strong> <span className="badge bg-secondary">{u.countryId}</span></p>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Mensaje cuando no hay resultados (opcional) */}
    {search && usersByName.length === 0 && (
      <p className="text-muted mt-3">No se encontraron usuarios con ese nombre.</p>
    )}
  </div>
)}

{activeTab === "id" && (
  /* Contenedor principal */
  <div className="d-flex flex-column align-items-center w-100 animate__animated animate__fadeIn">
    <h3 className="results-title">Ingrese el número de ID del usuario</h3>

    {/* 1. Tarjeta de Búsqueda */}
    <div
      className="card shadow-lg border-0 p-1 mb-3"
      style={{ borderRadius: "20px", width: "90%", maxWidth: "450px" }}
    >
      <form onSubmit={handleSearchById}>
        <div className="mb-4">
          <input
            type="number"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="form-control bg-light py-2 text-center"
            placeholder="Ingrese ID"
            style={{ borderRadius: "10px", border: "1px solid #dee2e6" }}
          />
        </div>

        <div className="d-flex justify-content-center">
          <button
            type="submit"
            className="btn btn-primary fw-bold px-5 py-2 shadow-sm"
            style={{ borderRadius: "15px", minWidth: "250px" }}
          >
            Buscar usuario
          </button>
        </div>
      </form>
    </div>

    {/* 2. Tarjeta de Resultados */}
    {userById && (
      <div
        className="card shadow border-0 p-4 animate__animated animate__zoomIn"
        style={{ borderRadius: "15px", width: "100%", maxWidth: "500px" }}
      >
        <h5 className="text-primary fw-bold mb-3 border-bottom pb-2">
          Resultado de la búsqueda
        </h5>
        <div className="text-start">
          <p className="mb-1">
            <strong>Nombre:</strong> {userById.name} {userById.last_name}
          </p>
          <p className="mb-1">
            <strong>Email:</strong> {userById.email}
          </p>
          <p className="mb-1">
            <strong>Teléfono:</strong> {userById.phone}
          </p>
          <p className="mb-1">
            <strong>CountryID:</strong>{" "}
            <span className="badge bg-secondary">{userById.countryId}</span>
          </p>
        </div>
      </div>
    )}

    {/* Mensaje de no encontrado */}
    {!userById && searchId.trim() !== "" && (
      <p className="text-muted mt-3">No se encontró usuario con ese ID.</p>
    )}
  </div>
)}


{/* Crear usuario */}
{activeTab === "create" && (
      <div className="d-flex flex-column align-items-center w-100 animate__animated animate__fadeIn">
        <h3 className="results-title">Ingrese los datos del nuevo usuario</h3>
  <form
    onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      const newUser = {
        name: formData.get("name"),
        last_name: formData.get("lastName"),   // ojo: backend suele esperar last_name
        phone: formData.get("phone"),
        email: formData.get("email"),
        password: formData.get("password"),
        countryId: formData.get("countryId"),  // revisa si tu backend espera country_id
      };

      try {
        const created = await createUser(newUser);
        alert("Usuario creado correctamente");
        console.log("Usuario creado:", created);
        e.target.reset();
      } catch (error) {
        console.error("Error al crear usuario:", error.response?.data || error.message);
        alert("Error al crear usuario: " + (error.response?.data?.message || "ver consola"));
      }
    }}
  >
    <input
      type="text"
      name="name"
      className="form-control mb-2"
      placeholder="Name"
      required
    />
    <input
      type="text"
      name="lastName"
      className="form-control mb-2"
      placeholder="LastName"
      required
    />
    <input
      type="text"
      name="phone"
      className="form-control mb-2"
      placeholder="Phone"
      required
    />
    <input
      type="email"
      name="email"
      className="form-control mb-2"
      placeholder="Email"
      required
    />
    <input
      type="password"
      name="password"
      className="form-control mb-2"
      placeholder="Password"
      required
    />
    <input
      type="number"
      name="countryId"
      className="form-control mb-2"
      placeholder="CountryID"
      required
    />
{/* Contenedor para centrar el botón manteniendo el formato */}
      <div className="d-flex justify-content-center mt-3">
        <button
          type="submit"
          className="btn btn-primary fw-bold px-2 py-2 shadow-sm"
          style={{ borderRadius: '10px', minWidth: '300px' }}
        >
          Crear nuevo usuario
        </button>
      </div>
    </form>
    </div>
)}

      {activeTab === "update" && (
          <div className="d-flex flex-column align-items-center w-100 animate__animated animate__fadeIn">
              <h3 className="results-title">Ingrese el ID del usuario para actualizar cualquier campo</h3>
        <form onSubmit={handleUpdateSubmit} className="p-4">
          <input
            type="number"
            name="id"
            placeholder="User ID"
            value={formData.id}
            onChange={handleChange}
            onBlur={handleBlurId}
            className="form-control mb-2"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="form-control mb-2"
          />
          <input
            type="text"
            name="lastName"
            placeholder="LastName"
            value={formData.lastName}
            onChange={handleChange}
            className="form-control mb-2"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-control mb-2"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="form-control mb-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="form-control mb-2"
          />
          <input
            type="number"
            name="countryId"
            placeholder="CountryID"
            value={formData.countryId}
            onChange={handleChange}
            className="form-control mb-2"
          />
{/* Contenedor para centrar el botón manteniendo el formato */}
      <div className="d-flex justify-content-center mt-3">
        <button
          type="submit"
          className="btn btn-warning fw-bold px-2 py-2 shadow-sm"
          style={{ borderRadius: '10px', minWidth: '300px' }}
        >
          Actualizar usuario
        </button>
        </div>
       </form>
       </div>
      )}

      {/* Eliminar usuario */}
      {activeTab === "delete" && (
                  <div className="d-flex flex-column align-items-center w-100 animate__animated animate__fadeIn">
                        <h3 className="results-title">Ingrese el ID del usuario a eliminar</h3>
<form
  onSubmit={async (e) => {
    e.preventDefault();
    const { id } = e.target;
    try {
      const status = await deleteUser(id.value);
      if (status === 200 || status === 204) {
        alert("Usuario eliminado correctamente");
      } else {
        alert("No se pudo eliminar el usuario");
      }
      e.target.reset();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Error al eliminar usuario");
    }
  }}
>
  <input
    type="number"
    name="id"
    className="form-control mb-2"
    placeholder="User ID"
    required
  />
{/* Contenedor para centrar el botón manteniendo el formato */}
      <div className="d-flex justify-content-center mt-3">
        <button
          type="submit"
          className="btn btn-danger fw-bold px-2 py-2 shadow-sm"
          style={{ borderRadius: '10px', minWidth: '300px' }}
        >
          Eliminar Usuario
        </button>
      </div>
    </form>
 </div>
      )}

</div>
</div>
  );
}

export default UsersScreen;


