import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

function PaymentPix({ onPaymentDataChange }) {
  const { isDark } = useTheme();
  const [pixGenerated, setPixGenerated] = useState(false);
  const [pixCode, setPixCode] = useState("");

  const generatePixCode = () => {
    const mockPixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}52040000530398654041.005802BR5925Dom Bosco Distribuidora6009SAO PAULO62070503***6304${Math.random().toString(16).substring(2, 6).toUpperCase()}`;
    
    setPixCode(mockPixCode);
    setPixGenerated(true);
    
    onPaymentDataChange({
      method: "pix",
      pixCode: mockPixCode,
      status: "pending"
    });
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Código PIX copiado!");
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          marginBottom: "12px",
          color: "var(--text-primary)"
        }}>
          Pagamento via PIX
        </h3>
        <p style={{ 
          fontSize: "14px", 
          color: "var(--text-secondary)",
          lineHeight: "1.6"
        }}>
          Pague instantaneamente usando PIX. O código será gerado após confirmar o pedido.
        </p>
      </div>

      {!pixGenerated ? (
        <div 
          style={{
            padding: "32px",
            background: isDark 
              ? "linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)"
              : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
            borderRadius: "12px",
            border: isDark ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid #bae6fd",
            textAlign: "center"
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            🔲
          </div>
          <h4 style={{ 
            fontSize: "16px", 
            fontWeight: "600", 
            marginBottom: "8px",
            color: "var(--text-primary)"
          }}>
            QR Code PIX será gerado
          </h4>
          <p style={{ 
            fontSize: "14px", 
            color: "var(--text-secondary)",
            marginBottom: "20px"
          }}>
            Após confirmar o pedido, você receberá o QR Code e o código PIX para pagamento.
          </p>
          
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              background: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(59, 130, 246, 0.1)",
              borderRadius: "8px",
              fontSize: "13px",
              color: isDark ? "#a78bfa" : "#3b82f6"
            }}
          >
            <span>⚡</span>
            <span>Pagamento instantâneo e seguro</span>
          </div>
        </div>
      ) : (
        <div 
          style={{
            padding: "24px",
            background: isDark 
              ? "linear-gradient(135deg, #1e3a28 0%, #1a1a1a 100%)"
              : "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
            borderRadius: "12px",
            border: isDark ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #bbf7d0"
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div 
              style={{
                width: "200px",
                height: "200px",
                margin: "0 auto",
                background: "#fff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ fontSize: "48px" }}>📱</div>
            </div>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Escaneie o QR Code com seu app de pagamentos
            </p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "600",
              marginBottom: "8px",
              color: "var(--text-secondary)"
            }}>
              Código PIX (Copiar e Colar)
            </label>
            <div style={{ 
              display: "flex", 
              gap: "8px",
              alignItems: "center"
            }}>
              <input
                type="text"
                value={pixCode}
                readOnly
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  background: isDark ? "#1a1a1a" : "#fff",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)"
                }}
              />
              <button
                onClick={copyPixCode}
                style={{
                  padding: "12px 20px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  whiteSpace: "nowrap"
                }}
              >
                📋 Copiar
              </button>
            </div>
          </div>

          <div 
            style={{
              marginTop: "20px",
              padding: "16px",
              background: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)",
              borderRadius: "8px",
              fontSize: "13px",
              color: isDark ? "#6ee7b7" : "#059669",
              lineHeight: "1.6"
            }}
          >
            <strong>⏱️ Instruções:</strong>
            <ol style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar com PIX</li>
              <li>Escaneie o QR Code ou cole o código</li>
              <li>Confirme as informações e finalize</li>
            </ol>
          </div>
        </div>
      )}

      <div 
        style={{
          marginTop: "24px",
          padding: "16px",
          background: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(147, 51, 234, 0.1)",
          borderRadius: "8px",
          fontSize: "13px",
          color: isDark ? "#c4b5fd" : "#7c3aed",
          lineHeight: "1.6"
        }}
      >
        <strong>🔒 Seguro e instantâneo</strong>
        <p style={{ margin: "8px 0 0 0" }}>
          O pagamento via PIX é processado instantaneamente e seu pedido será confirmado automaticamente após a aprovação.
        </p>
      </div>
    </div>
  );
}

export default PaymentPix;
