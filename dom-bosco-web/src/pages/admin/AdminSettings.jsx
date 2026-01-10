import { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function AdminSettings() {
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    storeName: "Dom Bosco",
    storeEmail: "contato@dombosco.com.br",
    phone: "(11) 1234-5678",
    address: "Rua Dom Bosco, 123",
    currency: "BRL",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      // Simulação de salvamento - na prática você enviaria para o backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("✅ Configurações salvas com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "28px" }}>
          ⚙️ Configurações
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Controle as configurações da loja
        </p>
      </div>

      {success && (
        <div
          style={{
            backgroundColor: isDark ? "#064e3b" : "#dcfce7",
            borderLeft: "4px solid #16a34a",
            color: isDark ? "#86efac" : "#15803d",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Configurações Gerais */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ color: "var(--text-primary)", marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
            📋 Informações da Loja
          </h2>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "500" }}>
                Nome da Loja
              </label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  backgroundColor: "var(--background)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "500" }}>
                Email da Loja
              </label>
              <input
                type="email"
                name="storeEmail"
                value={settings.storeEmail}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  backgroundColor: "var(--background)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "500" }}>
                Telefone
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  backgroundColor: "var(--background)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "500" }}>
                Endereço
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  backgroundColor: "var(--background)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px 16px",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = "#6366f1";
              }}
            >
              {loading ? "💾 Salvando..." : "💾 Salvar Configurações"}
            </button>
          </form>
        </div>

        {/* Configurações de Aparência */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ color: "var(--text-primary)", marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
            🎨 Aparência
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              backgroundColor: "var(--background)",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <div>
              <p style={{ color: "var(--text-primary)", fontWeight: "500", marginBottom: "4px" }}>
                Modo Escuro
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                {isDark ? "Ativado" : "Desativado"}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                padding: "8px 16px",
                backgroundColor: isDark ? "#7c3aed" : "#fbbf24",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
            </button>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "var(--background)",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <p style={{ color: "var(--text-primary)", fontWeight: "500", marginBottom: "8px" }}>
              Moeda
            </p>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                backgroundColor: "var(--surface)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              <option value="BRL">BRL - Real Brasileiro</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div
        style={{
          backgroundColor: "var(--surface)",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2 style={{ color: "var(--text-primary)", marginBottom: "16px", fontSize: "18px", fontWeight: "600" }}>
          ℹ️ Informações do Sistema
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--background)",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "4px" }}>
              Versão da API
            </p>
            <p style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "16px" }}>
              v1.0.0
            </p>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--background)",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "4px" }}>
              Versão do Frontend
            </p>
            <p style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "16px" }}>
              v1.0.0
            </p>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--background)",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "4px" }}>
              Banco de Dados
            </p>
            <p style={{ color: "var(--text-primary)", fontWeight: "600", fontSize: "16px" }}>
              SQLite 3
            </p>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "var(--background)",
              borderRadius: "8px",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "4px" }}>
              Status
            </p>
            <p style={{ color: "#16a34a", fontWeight: "600", fontSize: "16px" }}>
              ✅ Online
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
