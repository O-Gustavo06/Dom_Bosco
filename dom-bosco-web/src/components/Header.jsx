import { Link, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

function Header() {
  const location = useLocation();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const [showContact, setShowContact] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    workingHours: ""
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/settings");
      const data = await response.json();
      
      setContactInfo({
        instagram: data.contact_instagram || "https://www.instagram.com/papelaria.dombosco/",
        phone: data.contact_phone || "(14) 3402-5500",
        whatsapp: data.contact_whatsapp || "(14) 99674-1119",
        email: data.contact_email || "atendimento@dombosco.com.br",
        workingHours: data.contact_hours || "Segunda a Sexta: 08:00 - 18:00 | Sábado: 08:00 - 12:00"
      });
    } catch (error) {
      console.error("Erro ao carregar informações de contato:", error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: "var(--surface)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8c1af7 0%, #57052e 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "800",
              color: "white",
              boxShadow: "0 4px 12px rgba(132, 5, 250, 0.3)",
            }}
          >
            DB
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#4807b7",
              letterSpacing: "-1px",
            }}
          >
            Dom Bosco
          </span>
          {user?.name && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-secondary)",
                background: "var(--surface-gray)",
                padding: "6px 10px",
                borderRadius: "999px",
                border: "1px solid var(--border-color)",
              }}
            >
              {user.name}
            </span>
          )}
        </Link>

        <nav style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              color: isActive("/") ? "#7c3aed" : "#64748b",
              backgroundColor: isActive("/") ? "rgba(124, 58, 237, 0.1)" : "transparent",
              fontWeight: isActive("/") ? "600" : "500",
              fontSize: "15px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/")) {
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
                e.currentTarget.style.color = "#7c3aed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            Produtos
          </Link>

          <Link
            to="/cart"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              color: isActive("/cart") ? "#3b82f6" : "#64748b",
              backgroundColor: isActive("/cart") ? "rgba(59, 130, 246, 0.1)" : "transparent",
              fontWeight: isActive("/cart") ? "600" : "500",
              fontSize: "15px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/cart")) {
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
                e.currentTarget.style.color = "#7c3aed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/cart")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            Carrinho
            {cartItemsCount > 0 && (
              <span
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "12px",
                  minWidth: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "0 8px",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                  animation: "pulse 2s infinite",
                }}
              >
                {cartItemsCount}
              </span>
            )}
          </Link>

          {user && user.role === "admin" && (
            <Link
              to="/admin"
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                color: isActive("/admin") ? "#f59e0b" : "#64748b",
                backgroundColor: isActive("/admin") ? "rgba(245, 158, 11, 0.1)" : "transparent",
                fontWeight: isActive("/admin") ? "600" : "500",
                fontSize: "15px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                if (!isActive("/admin")) {
                  e.currentTarget.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
                  e.currentTarget.style.color = "#f59e0b";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive("/admin")) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              ⚙️ Admin
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/meus-pedidos"
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: isActive("/meus-pedidos") 
                    ? (isDark ? "#8b5cf6" : "#3b82f6")
                    : "transparent",
                  color: isActive("/meus-pedidos") ? "white" : "var(--text-primary)",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  if (!isActive("/meus-pedidos")) {
                    e.currentTarget.style.backgroundColor = isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(59, 130, 246, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive("/meus-pedidos")) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                📦 Meus Pedidos
              </Link>
              <button
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                🚪 Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              style={{
                padding: "12px 24px",
                borderRadius: "12px",
                textDecoration: "none",
                color: isActive("/login") ? "#3b82f6" : "var(--text-secondary)",
                backgroundColor: isActive("/login") ? "rgba(59, 130, 246, 0.1)" : "transparent",
                fontWeight: isActive("/login") ? "600" : "500",
                fontSize: "15px",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                if (!isActive("/login")) {
                  e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
                  e.currentTarget.style.color = "#7c3aed";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive("/login")) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              Login
            </Link>
          )}

          <div style={{ position: "relative", marginLeft: "12px" }}>
            <button
              onClick={() => setShowContact(!showContact)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "15px",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#17a2b8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: "700"
              }}>
                ?
              </div>
              <span>Atendimento</span>
            </button>

            {showContact && (
              <>
                <div
                  onClick={() => setShowContact(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    width: "400px",
                    background: isDark ? "#1f2937" : "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
                    padding: "24px",
                    zIndex: 1000,
                    animation: "slideDown 0.3s ease"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <a
                      href={contactInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        color: "var(--text-primary)",
                        padding: "12px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        transition: "all 0.3s ease",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? "rgba(168, 85, 247, 0.1)" : "rgba(124, 58, 237, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>📱</span>
                      <div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Siga nosso Instagram
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "16px", color: "#a855f7" }}>
                          @papelaria.dombosco
                        </div>
                      </div>
                    </a>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        color: "var(--text-primary)",
                        padding: "12px",
                        borderRadius: "8px"
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>📞</span>
                      <div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Compre por telefone
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "16px", color: "#ffffff" }}>
                          {contactInfo.phone}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        color: "var(--text-primary)",
                        padding: "12px",
                        borderRadius: "8px"
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>💬</span>
                      <div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Fale no WhatsApp
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "16px", color: "#ffffff" }}>
                          {contactInfo.whatsapp}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        color: "var(--text-primary)",
                        padding: "12px",
                        borderRadius: "8px"
                      }}
                    >
                      <span style={{ fontSize: "24px" }}>✉️</span>
                      <div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Envie um e-mail
                        </div>
                        <div style={{ fontWeight: "700", fontSize: "15px", color: "#ffffff", wordBreak: "break-all" }}>
                          {contactInfo.email}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "16px 12px",
                        background: isDark ? "rgba(251, 191, 36, 0.05)" : "#f8f9fa",
                        borderRadius: "8px",
                        marginTop: "8px"
                      }}
                    >
                      <div style={{ 
                        fontSize: "13px", 
                        fontWeight: "700", 
                        color: "var(--text-primary)",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}>
                        HORÁRIO DE ATENDIMENTO
                      </div>
                      <div style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                        {contactInfo.workingHours}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleTheme}
            style={{
              backgroundColor: "var(--surface-gray)",
              border: "none",
              borderRadius: "8px",
              width: "44px",
              height: "44px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
              marginLeft: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--surface-hover)";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--surface-gray)";
              e.currentTarget.style.transform = "scale(1)";
            }}
            title={isDark ? "Modo claro" : "Modo escuro"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
