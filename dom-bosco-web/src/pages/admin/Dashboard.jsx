import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useLocation, Link } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";

function Dashboard() {
  const { isDark } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("produtos");

  const isActive = (tab) => activeTab === tab;

  const renderContent = () => {
    switch (activeTab) {
      case "produtos":
        return <AdminProducts />;
      case "usuarios":
        return <AdminUsers />;
      case "configuracoes":
        return <AdminSettings />;
      default:
        return <AdminProducts />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--background)",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "260px",
          backgroundColor: isDark ? "#0f0f0f" : "#f8f9fa",
          borderRight: "1px solid var(--border-color)",
          padding: "24px 0",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          top: "80px",
        }}
      >
        <div style={{ padding: "0 16px", marginBottom: "32px" }}>
          <h3 style={{ color: "var(--text-primary)", marginBottom: "16px", fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Painel de Admin
          </h3>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { id: "produtos", label: "📦 Produtos", icon: "📦" },
            { id: "usuarios", label: "👥 Usuários", icon: "👥" },
            { id: "configuracoes", label: "⚙️ Configurações", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                padding: "12px 16px",
                margin: "0 8px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isActive(item.id)
                  ? isDark
                    ? "rgba(168, 85, 247, 0.2)"
                    : "rgba(168, 85, 247, 0.1)"
                  : "transparent",
                color: isActive(item.id) ? "#a855f7" : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: isActive(item.id) ? "600" : "500",
                transition: "all 0.3s ease",
                textAlign: "left",
                borderLeft: isActive(item.id) ? "3px solid #a855f7" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.id)) {
                  e.currentTarget.style.backgroundColor = isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(168, 85, 247, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.id)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: "16px", marginTop: "32px", borderTop: "1px solid var(--border-color)" }}>
          <Link
            to="/"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              color: "#ef4444",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: "600",
              display: "block",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            }}
          >
            🚪 Sair do Admin
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "260px",
          flex: 1,
          marginTop: "80px",
          padding: "32px",
          backgroundColor: "var(--background)",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}

export default Dashboard;
