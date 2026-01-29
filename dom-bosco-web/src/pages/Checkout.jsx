import { useCart } from "../contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import PaymentPix from "../components/PaymentPix";
import PaymentCard from "../components/PaymentCard";

function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentData, setPaymentData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaymentDataChange = (data) => {
    setPaymentData(data);
  };

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    
    if (cart.length === 0) {
      setError("Seu carrinho está vazio!");
      return;
    }

    if (!formData.name || !formData.email) {
      setError("Nome e email são obrigatórios!");
      return;
    }

    if (!paymentMethod) {
      setError("Selecione um método de pagamento!");
      return;
    }

    if (paymentMethod === "credit_card" && paymentData?.validateFn) {
      const isValid = paymentData.validateFn();
      if (!isValid) {
        setError("Verifique os dados do cartão!");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        items: cart,
        total,
        customer: {
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
        },
        payment: {
          method: paymentMethod,
          ...(paymentMethod === "credit_card" && paymentData && {
            cardNumber: paymentData.cardNumber,
            cardExpiry: paymentData.cardExpiry,
            cardCvv: paymentData.cardCvv,
            saveCard: paymentData.saveCard,
            brand: paymentData.brand,
            lastDigits: paymentData.lastDigits,
          }),
          ...(paymentMethod === "pix" && {
            pixCode: paymentData?.pixCode
          })
        }
      };

      console.log("Enviando pedido:", payload);

      const response = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await response.json();
        console.log("Resposta do servidor:", data);
      } catch (jsonError) {
        throw new Error(`Erro ao processar resposta do servidor: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || `Erro HTTP: ${response.status}`);
      }

      const orderId = data.data?.order_id || data.order_id || data.id || data.orderId || data.order?.id;
      
      if (data.message || orderId) {
        alert(`Pedido #${orderId} criado com sucesso!`);
        clearCart();
        navigate("/");
      } else {
        throw new Error(data.error || data.message || "Erro ao finalizar pedido");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);
      setError(error.message || "Erro ao finalizar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Carrinho vazio</h2>
          <p>Adicione produtos ao carrinho antes de finalizar a compra.</p>
          <Link to="/" style={{ marginTop: "16px", display: "inline-block" }}>
            <button>Ver Produtos</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="fade-in" style={{ marginBottom: "48px" }}>
          <h1 style={{ marginBottom: "12px" }}>Finalizar Compra</h1>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)" }}>
            Complete suas informações para finalizar o pedido
          </p>
        </div>

        <div
          className="checkout-grid fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "40px",
          }}
        >
          <div>
            <div
              className="card"
              style={{
                marginBottom: "24px",
                padding: "32px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "28px",
                  color: "var(--text-primary)",
                }}
              >
                Dados de Entrega
              </h2>

              {error && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#fee2e2",
                    border: "1px solid #fca5a5",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    color: "#dc2626",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                  }}
                >
                  Endereço
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Rua, número, complemento"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Sua cidade"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-secondary)",
                    }}
                  >
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="00000-000"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            <div
              className="card"
              style={{
                marginBottom: "24px",
                padding: "32px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "28px",
                  color: "var(--text-primary)",
                }}
              >
                Método de Pagamento
              </h2>

              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div
                    onClick={() => setPaymentMethod("pix")}
                    style={{
                      padding: "20px",
                      border: `2px solid ${paymentMethod === "pix" 
                        ? (isDark ? "#a78bfa" : "#8b5cf6")
                        : "var(--border-color)"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: paymentMethod === "pix"
                        ? (isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.05)")
                        : (isDark ? "#1a1a1a" : "#fff"),
                      transition: "all 0.2s ease",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔲</div>
                    <div style={{ 
                      fontWeight: "600", 
                      fontSize: "16px",
                      color: "var(--text-primary)",
                      marginBottom: "4px"
                    }}>
                      PIX
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Aprovação imediata
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod("credit_card")}
                    style={{
                      padding: "20px",
                      border: `2px solid ${paymentMethod === "credit_card" 
                        ? (isDark ? "#a78bfa" : "#8b5cf6")
                        : "var(--border-color)"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      background: paymentMethod === "credit_card"
                        ? (isDark ? "rgba(167, 139, 250, 0.1)" : "rgba(139, 92, 246, 0.05)")
                        : (isDark ? "#1a1a1a" : "#fff"),
                      transition: "all 0.2s ease",
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>💳</div>
                    <div style={{ 
                      fontWeight: "600", 
                      fontSize: "16px",
                      color: "var(--text-primary)",
                      marginBottom: "4px"
                    }}>
                      Cartão de Crédito
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Parcelamento disponível
                    </div>
                  </div>
                </div>
              </div>

              {paymentMethod === "pix" && (
                <PaymentPix onPaymentDataChange={handlePaymentDataChange} />
              )}
              
              {paymentMethod === "credit_card" && (
                <PaymentCard onPaymentDataChange={handlePaymentDataChange} />
              )}

              {!paymentMethod && (
                <div 
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "14px"
                  }}
                >
                  Selecione um método de pagamento acima
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              type="button"
              className="success"
              disabled={loading || !paymentMethod}
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "18px",
                fontWeight: "700",
                background: loading || !paymentMethod
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: loading || !paymentMethod
                  ? "none"
                  : "0 8px 24px rgba(16, 185, 129, 0.3)",
                cursor: loading || !paymentMethod ? "not-allowed" : "pointer",
                opacity: loading || !paymentMethod ? 0.7 : 1,
              }}
            >
              {loading ? "Processando..." : "Finalizar Pedido →"}
            </button>
          </div>

          <div>
            <div
              className="card"
              style={{
                position: "sticky",
                top: "120px",
                padding: "32px",
                background: isDark
                  ? "linear-gradient(135deg, #262626 0%, #1a1a1a 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f4f4f4 100%)",
                border: isDark ? "1px solid rgba(167, 139, 250, 0.15)" : "1px solid #e8e8e8",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "28px",
                  color: "var(--text-primary)",
                }}
              >
                Resumo do Pedido
              </h2>

              <div style={{ marginBottom: "24px" }}>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                      paddingBottom: "16px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px", color: "var(--text-primary)" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {item.quantity}x R$ {item.price.toFixed(2)}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "16px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  paddingTop: "24px",
                  borderTop: "1px solid var(--border-color)",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
                    Subtotal
                  </span>
                  <span style={{ fontWeight: "600", fontSize: "16px", color: "var(--text-primary)" }}>
                    R$ {total.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <span style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
                    Frete
                  </span>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "#10b981",
                      fontSize: "16px",
                    }}
                  >
                    Grátis
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "28px",
                    fontWeight: "800",
                    paddingTop: "16px",
                    borderTop: "1px solid var(--border-color)",
                  }}
                >
                  <span style={{ color: "var(--text-primary)" }}>Total</span>
                  <span
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)"
                        : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    R$ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {paymentMethod && (
                <div 
                  style={{
                    padding: "16px",
                    background: isDark 
                      ? "rgba(139, 92, 246, 0.1)" 
                      : "rgba(139, 92, 246, 0.05)",
                    borderRadius: "12px",
                    marginTop: "16px"
                  }}
                >
                  <div style={{ 
                    fontSize: "13px", 
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    marginBottom: "8px"
                  }}>
                    Método de Pagamento
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    color: "var(--text-primary)"
                  }}>
                    <span style={{ fontSize: "20px" }}>
                      {paymentMethod === "pix" ? "🔲" : "💳"}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "600" }}>
                      {paymentMethod === "pix" ? "PIX" : "Cartão de Crédito"}
                    </span>
                  </div>
                  {paymentMethod === "credit_card" && paymentData?.lastDigits && (
                    <div style={{ 
                      fontSize: "12px", 
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                      marginLeft: "28px"
                    }}>
                      {paymentData.brand} •••• {paymentData.lastDigits}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
