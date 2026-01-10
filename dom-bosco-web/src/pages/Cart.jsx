import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const { cart, removeFromCart, total, clearCart } = useCart();

  return (
    <div className="container">
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div className="fade-in" style={{ marginBottom: "48px" }}>
          <h1 style={{ marginBottom: "12px" }}>Carrinho de Compras</h1>
          <p style={{ fontSize: "18px", color: "var(--text-secondary)" }}>
            Revise seus itens antes de finalizar
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state fade-in">
            <div
              style={{
                fontSize: "80px",
                marginBottom: "24px",
                animation: "pulse 2s infinite",
              }}
            >
              🛒
            </div>
            <h2>Seu carrinho está vazio</h2>
            <p style={{ marginBottom: "32px", fontSize: "16px" }}>
              Adicione alguns produtos incríveis para começar!
            </p>
            <Link to="/">
              <button
                style={{
                  background: "var(--primary-gradient)",
                  padding: "14px 32px",
                  fontSize: "16px",
                }}
              >
                Explorar Produtos
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "32px" }}>
              {cart.map((item, index) => (
                <div
                  key={item.id}
                  className="card fade-in"
                  style={{
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "24px",
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        marginBottom: "8px",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.name}
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        gap: "16px",
                        alignItems: "center",
                        color: "var(--text-secondary)",
                        fontSize: "15px",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>
                        Quantidade: {item.quantity}x
                      </span>
                      <span>•</span>
                      <span>R$ {item.price.toFixed(2)} cada</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "24px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        minWidth: "120px",
                        textAlign: "right",
                      }}
                    >
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      className="danger"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        borderRadius: "10px",
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="card fade-in"
              style={{
                background: "var(--surface-gray)",
                border: "1px solid var(--border-color)",
                position: "sticky",
                bottom: "20px",
                padding: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "32px",
                  paddingBottom: "24px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <h2 style={{ fontSize: "28px", fontWeight: "700" }}>Total:</h2>
                <span
                  style={{
                    fontSize: "40px",
                    fontWeight: "800",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  R$ {total.toFixed(2)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                }}
              >
                <button
                  className="secondary"
                  onClick={clearCart}
                  style={{ flex: 1, padding: "14px" }}
                >
                  Limpar Carrinho
                </button>
                <Link to="/checkout" style={{ flex: 2 }}>
                  <button
                    className="success"
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "var(--primary-gradient)",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    Finalizar Compra →
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;
