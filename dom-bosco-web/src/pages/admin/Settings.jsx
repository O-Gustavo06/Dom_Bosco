import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function Settings() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [settings, setSettings] = useState({
    company_name: "",
    company_description: "",
    contact_phone: "",
    contact_whatsapp: "",
    contact_email: "",
    contact_address: "",
    contact_city: "",
    contact_hours: "",
    social_facebook: "",
    social_instagram: "",
    social_twitter: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/settings", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Configurações salvas com sucesso!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Erro ao salvar configurações");
      }
    } catch (error) {
      setError("Erro ao salvar configurações: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div className="fade-in">
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ marginBottom: "8px" }}>⚙️ Configurações</h1>
          <p style={{ fontSize: "16px", color: "var(--text-secondary)" }}>
            Gerencie as informações da sua loja
          </p>
        </div>

        {success && (
          <div
            style={{
              padding: "16px",
              background: "#d1fae5",
              border: "1px solid #6ee7b7",
              borderRadius: "12px",
              marginBottom: "24px",
              color: "#065f46",
              fontSize: "14px"
            }}
          >
            ✓ {success}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "16px",
              background: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "12px",
              marginBottom: "24px",
              color: "#dc2626",
              fontSize: "14px"
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--text-primary)" }}>
              Informações da Empresa
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                Nome da Empresa
              </label>
              <input
                type="text"
                name="company_name"
                value={settings.company_name}
                onChange={handleInputChange}
                placeholder="Ex: Dom Bosco Distribuidora"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                Descrição
              </label>
              <textarea
                name="company_description"
                value={settings.company_description}
                onChange={handleInputChange}
                placeholder="Breve descrição da sua empresa"
                rows="3"
                style={{ 
                  width: "100%", 
                  padding: "12px",
                  fontSize: "14px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  background: isDark ? "#1a1a1a" : "#fff",
                  color: "var(--text-primary)",
                  resize: "vertical"
                }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--text-primary)" }}>
              Informações de Contato
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-secondary)"
                }}>
                  📞 Telefone
                </label>
                <input
                  type="text"
                  name="contact_phone"
                  value={settings.contact_phone}
                  onChange={handleInputChange}
                  placeholder="(14) 3402-5500"
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-secondary)"
                }}>
                  💬 WhatsApp
                </label>
                <input
                  type="text"
                  name="contact_whatsapp"
                  value={settings.contact_whatsapp}
                  onChange={handleInputChange}
                  placeholder="(14) 99674-1119"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                ✉️ E-mail
              </label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleInputChange}
                placeholder="atendimento@dombosco.com.br"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                📍 Endereço
              </label>
              <input
                type="text"
                name="contact_address"
                value={settings.contact_address}
                onChange={handleInputChange}
                placeholder="Rua Exemplo, 123 - Centro"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                🏙️ Cidade/Estado
              </label>
              <input
                type="text"
                name="contact_city"
                value={settings.contact_city}
                onChange={handleInputChange}
                placeholder="São Paulo - SP"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                🕒 Horário de Atendimento
              </label>
              <input
                type="text"
                name="contact_hours"
                value={settings.contact_hours}
                onChange={handleInputChange}
                placeholder="Segunda a Sexta: 08:00 - 18:00 | Sábado: 08:00 - 12:00"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="card" style={{ padding: "32px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "24px", color: "var(--text-primary)" }}>
              Redes Sociais
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                📘 Facebook
              </label>
              <input
                type="url"
                name="social_facebook"
                value={settings.social_facebook}
                onChange={handleInputChange}
                placeholder="https://facebook.com/sua-pagina"
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                📷 Instagram
              </label>
              <input
                type="url"
                name="social_instagram"
                value={settings.social_instagram}
                onChange={handleInputChange}
                placeholder="https://instagram.com/seu-perfil"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-secondary)"
              }}>
                🐦 Twitter
              </label>
              <input
                type="url"
                name="social_twitter"
                value={settings.social_twitter}
                onChange={handleInputChange}
                placeholder="https://twitter.com/seu-perfil"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="success"
            style={{
              width: "100%",
              padding: "16px",
              fontSize: "16px",
              fontWeight: "700",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Salvando..." : "💾 Salvar Configurações"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
