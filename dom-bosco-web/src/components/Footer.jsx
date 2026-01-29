import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function Footer() {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    company_name: "Dom Bosco Distribuidora",
    company_description: "Sua papelaria completa com os melhores produtos e preços.",
    contact_phone: "(14) 3402-5500",
    contact_whatsapp: "(14) 99674-1119",
    contact_email: "atendimento@dombosco.com.br",
    contact_address: "Rua Exemplo, 123 - Centro",
    contact_city: "São Paulo - SP",
    contact_hours: "Segunda a Sexta: 08:00 - 18:00 | Sábado: 08:00 - 12:00",
    social_facebook: "",
    social_instagram: "",
    social_twitter: ""
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/settings");
      const data = await response.json();
      setSettings(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  return (
    <footer
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1e293b 0%, #0f0f0f 100%)"
          : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "#fff",
        marginTop: "80px",
        padding: "60px 0 20px 0",
        borderTop: isDark ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid rgba(255, 255, 255, 0.1)"
      }}
    >
      <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "48px",
            marginBottom: "48px"
          }}
        >
          <div>
            <h3 style={{ 
              fontSize: "24px", 
              fontWeight: "700", 
              marginBottom: "16px",
              background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              {settings.company_name}
            </h3>
            <p style={{ 
              fontSize: "14px", 
              lineHeight: "1.8",
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: "20px"
            }}>
              {settings.company_description}
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {settings.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(247, 246, 250, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(238, 237, 240, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  📘
                </a>
              )}
              {settings.social_instagram && (
                <a
                  href={settings.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "rgba(139, 92, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  📷
                </a>
              )}
              {settings.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    background: "rgba(139, 92, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    textDecoration: "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.4)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(139, 92, 246, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  🐦
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "20px",
              color: "rgba(255, 255, 255, 0.9)"
            }}>
              Links Rápidos
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link
                to="/"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a78bfa";
                  e.currentTarget.style.paddingLeft = "4px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                → Início
              </Link>
              <Link
                to="/"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a78bfa";
                  e.currentTarget.style.paddingLeft = "4px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                → Produtos
              </Link>
              <Link
                to="/cart"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a78bfa";
                  e.currentTarget.style.paddingLeft = "4px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                → Carrinho
              </Link>
              <Link
                to="/login"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#a78bfa";
                  e.currentTarget.style.paddingLeft = "4px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                → Minha Conta
              </Link>
            </div>
          </div>

          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "20px",
              color: "rgba(255, 255, 255, 0.9)"
            }}>
              Contato
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <a
                href={`tel:${settings.contact_phone.replace(/\D/g, '')}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#a78bfa"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
              >
                <span>📞</span>
                <span>{settings.contact_phone}</span>
              </a>
              <a
                href={`https://wa.me/${settings.contact_whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#10b981"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
              >
                <span>💬</span>
                <span>{settings.contact_whatsapp}</span>
              </a>
              <a
                href={`mailto:${settings.contact_email}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "14px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#f59e0b"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
              >
                <span>✉️</span>
                <span>{settings.contact_email}</span>
              </a>
              {settings.contact_address && (
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "14px",
                  lineHeight: "1.6"
                }}>
                  <span>📍</span>
                  <div>
                    <div>{settings.contact_address}</div>
                    <div>{settings.contact_city}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 style={{ 
              fontSize: "16px", 
              fontWeight: "600", 
              marginBottom: "20px",
              color: "rgba(255, 255, 255, 0.9)"
            }}>
              Horário de Atendimento
            </h4>
            <div style={{
              padding: "16px",
              background: "rgba(139, 92, 246, 0.1)",
              borderRadius: "12px",
              border: "1px solid rgba(139, 92, 246, 0.2)"
            }}>
              <div style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: "1.8"
              }}>
                {settings.contact_hours}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            paddingTop: "32px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px"
          }}
        >
          <div style={{ 
            fontSize: "14px", 
            color: "rgba(255, 255, 255, 0.6)"
          }}>
            © {new Date().getFullYear()} {settings.company_name}. Todos os direitos reservados.
          </div>
          <div style={{ 
            fontSize: "14px", 
            color: "rgba(255, 255, 255, 0.6)",
            display: "flex",
            gap: "20px"
          }}>
            
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
