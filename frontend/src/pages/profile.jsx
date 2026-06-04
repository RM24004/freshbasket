import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyProfileData, updateMyProfileData } from "../services/profileService.js";

const Profile = () => {
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        id: "",
        name: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        role: "",
        countryName: ""
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getMyProfileData();


                setProfileData({
                    id: response.id || "",
                    name: response.name || "",
                    lastName: response.lastName || "",
                    phone: response.phone || "",
                    email: response.email || "",
                    role: response.role || "",
                    countryName: response.countryName || (response.country ? response.country.name : ""),
                    password: ""
                });
            } catch (error) {
                console.error("Error al cargar los datos del perfil:", error);
                toast.error("No se pudieron cargar tus datos de perfil o tu sesión expiró.");

                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    navigate("/login");
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleSelfUpdateSubmit = async (e) => {
        e.preventDefault();

        const { name, lastName, phone, email, password, role, countryName } = profileData;

        // Validación estricta en el Frontend
        if (!name?.trim() || !lastName?.trim() || !phone?.trim() || !countryName?.trim()) {
            toast.error("Por favor, completa todos los campos obligatorios.");
            return;
        }

        const finalPassword = (password && password.trim() !== "")
            ? password.trim()
            : "DUMMY_PASSWORD_NOT_CHANGED";

        const payload = {
            name: name.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            email: email,
            role: role,
            countryName: countryName.trim(),
            password: finalPassword
        };

        try {
            await updateMyProfileData(payload);
            toast.success("Tu perfil ha sido actualizado con éxito");
            navigate("/freshbasket");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Hubo un error al guardar los cambios.");
        }
    };

    return (
        <div className="fb-form-section fb-tab-my-profile">
            <div className="fb-form-card">
                <h3 className="fb-form-title">
                    <i className="bi bi-person-bounding-box" /> Actualizar perfil
                </h3>

                <form onSubmit={handleSelfUpdateSubmit} className="fb-crud-form">
                    <div className="fb-crud-grid">

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">Nombre</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-person fb-crud-input-icon" />
                                <input type="text" name="name" className="fb-crud-input" value={profileData.name} onChange={handleProfileChange} required />
                            </div>
                        </div>

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">Apellido</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-person fb-crud-input-icon" />
                                <input type="text" name="lastName" className="fb-crud-input" value={profileData.lastName} onChange={handleProfileChange} required />
                            </div>
                        </div>

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">Teléfono</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-telephone fb-crud-input-icon" />
                                <input type="text" name="phone" className="fb-crud-input" value={profileData.phone} onChange={handleProfileChange} required />
                            </div>
                        </div>

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">Email</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-envelope fb-crud-input-icon" />
                                <input type="email" name="email" className="fb-crud-input field-disabled" value={profileData.email} disabled />
                            </div>
                        </div>

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">¿Quieres actualizar tu contraseña?</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-lock fb-crud-input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    className="fb-crud-input"
                                    placeholder="Sino dejar en blanco para mantener la actual"
                                    value={profileData.password}
                                    onChange={handleProfileChange}
                                />
                            </div>
                        </div>

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">Rol / Credenciales</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-shield-lock fb-crud-input-icon" />
                                <input type="text" name="role" className="fb-crud-input field-disabled" value={profileData.role} disabled />
                            </div>
                        </div>

                        <div className="fb-crud-field">
                            <label className="fb-crud-label">País</label>
                            <div className="fb-crud-input-wrap">
                                <i className="bi bi-globe fb-crud-input-icon" />
                                <input type="text" name="countryName" className="fb-crud-input" value={profileData.countryName} onChange={handleProfileChange} required />
                            </div>
                        </div>

                    </div>

                    <button type="submit" className="fb-action-btn" style={{ background: "linear-gradient(135deg,#1a6b3a,#2ecc71)", marginTop: "1.5rem" }}>
                        <i className="bi bi-save-fill" /> Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;