import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Produto não encontrado");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Carregando produto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Produto não encontrado</h2>
          <p>O produto que você está procurando não existe.</p>
          <Link to="/" style={{ marginTop: "16px", display: "inline-block" }}>
            <button>Voltar para Produtos</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <Link
          to="/"
          className="fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "32px",
            color: "#64748b",
            fontSize: "15px",
            textDecoration: "none",
            fontWeight: "500",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#3b82f6";
            e.currentTarget.style.transform = "translateX(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#64748b";
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          ← Voltar para produtos
        </Link>

        <div
          className="product-details-grid fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "64px",
            marginBottom: "48px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              height: "500px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "140px",
              boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                padding: "10px 20px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "white",
              }}
            >
              {product.category}
            </div>
            <div style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}>
              📦
            </div>
          </div>

          <div>
            <div
              className="badge badge-primary"
              style={{
                marginBottom: "20px",
                fontSize: "13px",
                padding: "8px 18px",
              }}
            >
              {product.category}
            </div>

            <h1 style={{ marginBottom: "20px", fontSize: "48px" }}>
              {product.name}
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "#64748b",
                lineHeight: "1.8",
                marginBottom: "40px",
              }}
            >
              {product.description}
            </p>

            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                border: "2px solid #e2e8f0",
                padding: "32px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  fontWeight: "600",
                }}
              >
                Preço
              </div>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: "800",
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "24px",
                  letterSpacing: "-2px",
                }}
              >
                R$ {product.price.toFixed(2)}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "32px",
                  fontSize: "15px",
                  paddingTop: "24px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <span style={{ color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Estoque
                  </span>
                  <strong style={{ color: "#475569", fontSize: "18px" }}>
                    {product.stock} unidades
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => addToCart(product)}
              style={{
                width: "100%",
                padding: "18px",
                fontSize: "18px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
              }}
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
