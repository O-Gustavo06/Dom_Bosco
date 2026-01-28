import { useCart } from "../contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
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

  async function handleCheckout(e) {
    e.preventDefault();
    setError("");
    
    if (cart.length === 0) {
      setError("Seu carrinho está vazio!");
      return;
    }

    // Validar campos obrigatórios
    if (!formData.name || !formData.email) {
      setError("Nome e email são obrigatórios!");
      return;
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

      // O backend retorna: { message: "...", data: { order_id: X } }
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

              <form onSubmit={handleCheckout}>
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
                      color: "#475569",
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
                        color: "#475569",
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
                        color: "#475569",
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

                <button
                  type="submit"
                  className="success"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "18px",
                    fontSize: "18px",
                    fontWeight: "700",
                    background: loading
                      ? "#94a3b8"
                      : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: loading
                      ? "none"
                      : "0 8px 24px rgba(16, 185, 129, 0.3)",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Processando..." : "Finalizar Pedido →"}
                </button>
              </form>
            </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
