import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useState } from "react";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <div
      className="fade-in"
      style={{
        height: "100%",
      }}
    >
      <Link
        to={`/products/${product.id}`}
        style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
      >
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            cursor: "pointer",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            style={{
              width: "100%",
              height: "240px",
              background: isHovered
                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "64px",
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                filter: isHovered ? "drop-shadow(0 8px 16px rgba(0,0,0,0.2))" : "none",
              }}
            >
              📦
            </div>
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                padding: "6px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#475569",
              }}
            >
              {product.category}
            </div>
          </div>

          <div className="card-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "700",
                marginBottom: "8px",
                color: "#0f172a",
                lineHeight: "1.3",
                letterSpacing: "-0.3px",
              }}
            >
              {product.name}
            </h3>

            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                marginBottom: "20px",
                lineHeight: "1.6",
                flex: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {product.description}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                    fontWeight: "600",
                  }}
                >
                  Preço
                </div>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-1px",
                  }}
                >
                  R$ {product.price.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              style={{
                width: "100%",
                marginTop: "auto",
                padding: "14px",
                fontSize: "15px",
                fontWeight: "600",
                background: isHovered
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                transition: "all 0.3s ease",
              }}
              onClick={handleAddToCart}
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
