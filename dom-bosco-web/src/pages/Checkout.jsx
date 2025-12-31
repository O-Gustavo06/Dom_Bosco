import { useCart } from "../contexts/CartContext";
import { useNavigate, Link } from "react-router-dom";

function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  async function handleCheckout(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart,
          total,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Pedido #${data.order_id} criado com sucesso!`);
        clearCart();
        navigate("/");
      } else {
        alert("Erro ao finalizar pedido");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
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
          <p style={{ fontSize: "18px", color: "#64748b" }}>
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
                  color: "#0f172a",
                }}
              >
                Dados de Entrega
              </h2>

              <form onSubmit={handleCheckout}>
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
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome"
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
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
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
                    placeholder="Rua, número, complemento"
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
                      placeholder="Sua cidade"
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
                      placeholder="00000-000"
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="success"
                  style={{
                    width: "100%",
                    padding: "18px",
                    fontSize: "18px",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 8px 24px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  Finalizar Pedido →
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
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "28px",
                  color: "#0f172a",
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
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: "13px", color: "#64748b" }}>
                        {item.quantity}x R$ {item.price.toFixed(2)}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: "700",
                        fontSize: "16px",
                        color: "#475569",
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
                  borderTop: "2px solid #e2e8f0",
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
                  <span style={{ fontSize: "15px", color: "#64748b" }}>
                    Subtotal
                  </span>
                  <span style={{ fontWeight: "600", fontSize: "16px" }}>
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
                  <span style={{ fontSize: "15px", color: "#64748b" }}>
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
                    borderTop: "2px solid #e2e8f0",
                  }}
                >
                  <span style={{ color: "#0f172a" }}>Total</span>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
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
