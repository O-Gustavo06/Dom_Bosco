import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminSettings() {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    store_name: "",
    store_description: "",
    store_email: "",
    store_phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/settings", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar configurações");
      }

      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:8000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao salvar configurações");
      }

      setSuccess("✅ Configurações salvas com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao salvar configurações:", err);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Carregando configurações...</div>;
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--text-primary)", marginBottom: "32px", fontSize: "28px" }}>
        ⚙️ Configurações
      </h1>

      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}>
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "var(--surface)",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "600" }}>
            Nome da Loja
          </label>
          <input
            type="text"
            name="store_name"
            value={settings.store_name}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--surface-gray)",
              color: "var(--text-primary)",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "600" }}>
            Descrição da Loja
          </label>
          <textarea
            name="store_description"
            value={settings.store_description}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--surface-gray)",
              color: "var(--text-primary)",
              boxSizing: "border-box",
              fontFamily: "inherit",
              minHeight: "100px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "600" }}>
            Email da Loja
          </label>
          <input
            type="email"
            name="store_email"
            value={settings.store_email}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--surface-gray)",
              color: "var(--text-primary)",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "600" }}>
            Telefone da Loja
          </label>
          <input
            type="tel"
            name="store_phone"
            value={settings.store_phone}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--surface-gray)",
              color: "var(--text-primary)",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          💾 Salvar Configurações
        </button>
      </form>
    </div>
  );
}
