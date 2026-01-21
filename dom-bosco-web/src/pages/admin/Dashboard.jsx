import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminSettings from "./AdminSettings";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  if (user?.role !== "admin") {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "var(--surface)",
          borderRight: "1px solid var(--border-color)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>
            🎛️ Admin
          </h2>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "12px" }}>
            Bem-vindo, {user?.name}
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <button
            onClick={() => setActiveTab("products")}
            style={{
              width: "100%",
              padding: "12px 16px",
              textAlign: "left",
              backgroundColor: activeTab === "products" ? "#7c3aed" : "transparent",
              color: activeTab === "products" ? "white" : "var(--text-primary)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
          >
            📦 Produtos
          </button>

          <button
            onClick={() => setActiveTab("users")}
            style={{
              width: "100%",
              padding: "12px 16px",
              textAlign: "left",
              backgroundColor: activeTab === "users" ? "#7c3aed" : "transparent",
              color: activeTab === "users" ? "white" : "var(--text-primary)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
          >
            👥 Usuários
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={{
              width: "100%",
              padding: "12px 16px",
              textAlign: "left",
              backgroundColor: activeTab === "settings" ? "#7c3aed" : "transparent",
              color: activeTab === "settings" ? "white" : "var(--text-primary)",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "8px",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
          >
            ⚙️ Configurações
          </button>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
        >
          🚪 Sair
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "settings" && <AdminSettings />}
      </main>
    </div>
  );
}
