import "../styles/notificationAlerts.css";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStockAlerts } from "../hooks/useStockAlerts";

export function NotificationBell({ isAdmin }) {
    const navigate = useNavigate();
    const [showNotificationMenu, setShowNotificationMenu] = useState(false);
    const notificationRef = useRef(null);


    const { data: alerts = [] } = useStockAlerts();

    // Cerrar el menú si se hace clic afuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotificationMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isAdmin) return null;
    const alertCount = Array.isArray(alerts) ? alerts.length : 0;

    return (
        <div className="fb-notification-container" ref={notificationRef} style={{ position: "relative" }}>
            <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className="fb-topbar-notification-btn"
                style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: "8px" }}
            >
                <i className="bi bi-bell-fill" style={{ fontSize: "1.4rem", color: "#4b5563" }} />
                {alertCount > 0 && (
                    <span className="fb-notification-badge">
            {alertCount}
          </span>
                )}
            </button>

            {/* Dropdown flotante de Alertas */}
            {showNotificationMenu && (
                <div className="fb-notification-dropdown">
                    <div className="fb-notification-header">
                        <i className="bi bi-exclamation-triangle-fill text-danger me-2" />
                        <span>Alertas de stock bajo ({alertCount})</span>
                    </div>

                    <div className="fb-notification-body">
                        {alertCount === 0 ? (
                            <div className="fb-notification-empty">
                                <i className="bi bi-check-circle-fill text-success d-block mb-1" style={{ fontSize: "1.2rem" }} />
                                Todo el stock está óptimo.
                            </div>
                        ) : (
                            alerts.map((product) => (
                                <div key={product.id} className="fb-notification-item">
                                    <div className="fb-notification-item-info">
                                        <span className="fw-bold text-dark d-block">{product.name}</span>
                                        <small className="text-muted">ID: {product.id}</small>
                                    </div>
                                    <div className="text-end">
                    <span className="badge bg-danger-subtle text-danger fw-bold d-block">
                      Cant: {product.currentStock}
                    </span>
                                        <small style={{ fontSize: "0.75rem" }} className="text-secondary">
                                            Min: {product.minStock}
                                        </small>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {alertCount > 0 && (
                        <button
                            onClick={() => {
                                localStorage.setItem("active_entries_Tab", "create");
                                window.dispatchEvent(new Event("entriesTabChanged"));
                                navigate("/freshbasket/entradas");
                                setShowNotificationMenu(false);
                            }}
                            className="fb-notification-footer-btn"
                        >
                            Ir a registrar entrada
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}