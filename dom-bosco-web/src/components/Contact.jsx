import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

function Contact() {
  const { isDark } = useTheme();
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    workingHours: ""
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/settings");
      const data = await response.json();
      
      setContactInfo({
        phone: data.contact_phone || "(14) 3402-5500",
        whatsapp: data.contact_whatsapp || "(14) 99674-1119",
        email: data.contact_email || "atendimento@dombosco.com.br",
        workingHours: data.contact_hours || "Segunda a Sexta: 08:00 - 18:00 | Sábado: 08:00 - 12:00"
      });
    } catch (error) {
      console.error("Erro ao carregar informações de contato:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: isDark 
            ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
            : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(139, 92, 246, 0.4)",
          zIndex: 1000,
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 24px rgba(139, 92, 246, 0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.4)";
        }}
      >
        {isOpen ? "✕" : "?"}
      </button>

      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
              animation: "fadeIn 0.3s ease"
            }}
          />
          
          <div
            style={{
              position: "fixed",
              bottom: "100px",
              right: "24px",
              width: "400px",
              maxWidth: "calc(100vw - 48px)",
              background: isDark 
                ? "linear-gradient(135deg, #1a1a1a 0%, #262626 100%)"
                : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
              zIndex: 1000,
              animation: "slideUp 0.3s ease",
              border: isDark ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid #e2e8f0"
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "12px",
                marginBottom: "8px"
              }}>
                <div style={{ 
                  fontSize: "32px",
                  background: isDark 
                    ? "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>
                  📞
                </div>
                <h3 style={{ 
                  fontSize: "22px", 
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  margin: 0
                }}>
                  Atendimento
                </h3>
              </div>
              <p style={{ 
                fontSize: "14px", 
                color: "var(--text-secondary)",
                margin: 0
              }}>
                Entre em contato conosco
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <a
                href={`tel:${contactInfo.phone.replace(/\D/g, '')}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  background: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(59, 130, 246, 0.05)",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  border: `1px solid ${isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(59, 130, 246, 0.2)"}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.background = isDark ? "rgba(139, 92, 246, 0.15)" : "rgba(59, 130, 246, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.background = isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(59, 130, 246, 0.05)";
                }}
              >
                <div style={{ 
                  fontSize: "28px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDark 
                    ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  borderRadius: "10px"
                }}>
                  📞
                </div>
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "var(--text-secondary)",
                    marginBottom: "4px"
                  }}>
                    Compre por telefone
                  </div>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "700",
                    color: "var(--text-primary)"
                  }}>
                    {contactInfo.phone}
                  </div>
                </div>
              </a>

              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  background: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  border: `1px solid ${isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.2)"}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.background = isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.background = isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)";
                }}
              >
                <div style={{ 
                  fontSize: "28px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: "10px"
                }}>
                  💬
                </div>
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "var(--text-secondary)",
                    marginBottom: "4px"
                  }}>
                    Fale no WhatsApp
                  </div>
                  <div style={{ 
                    fontSize: "18px", 
                    fontWeight: "700",
                    color: "var(--text-primary)"
                  }}>
                    {contactInfo.whatsapp}
                  </div>
                </div>
              </a>

              <a
                href={`mailto:${contactInfo.email}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px",
                  background: isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.05)",
                  borderRadius: "12px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  border: `1px solid ${isDark ? "rgba(245, 158, 11, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(4px)";
                  e.currentTarget.style.background = isDark ? "rgba(245, 158, 11, 0.15)" : "rgba(245, 158, 11, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.background = isDark ? "rgba(245, 158, 11, 0.1)" : "rgba(245, 158, 11, 0.05)";
                }}
              >
                <div style={{ 
                  fontSize: "28px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "10px"
                }}>
                  ✉️
                </div>
                <div>
                  <div style={{ 
                    fontSize: "12px", 
                    color: "var(--text-secondary)",
                    marginBottom: "4px"
                  }}>
                    Envie um e-mail
                  </div>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    wordBreak: "break-all"
                  }}>
                    {contactInfo.email}
                  </div>
                </div>
              </a>
            </div>

            <div 
              style={{
                marginTop: "20px",
                padding: "16px",
                background: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
                borderRadius: "12px",
                border: `1px solid ${isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.2)"}`
              }}
            >
              <div style={{ 
                fontSize: "13px", 
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "8px",
                display: "flex",
                alignItems: "center",
                gap: "20px"
              }}>
                🕒 HORÁRIO DE ATENDIMENTO
              </div>
              <div style={{ 
                fontSize: "13px", 
                color: "var(--text-primary)",
                lineHeight: "1.8"
              }}>
                {contactInfo.workingHours}
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default Contact;
