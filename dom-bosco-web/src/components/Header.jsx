import { Link, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

function Header() {
  const location = useLocation();
  const { cart } = useCart();
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "800",
              color: "white",
              boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#7c3aed",
              letterSpacing: "-0.5px",
            }}
          >
            Dom Bosco
          </span>
        </Link>

        <nav style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              color: isActive("/") ? "#7c3aed" : "#64748b",
              backgroundColor: isActive("/") ? "rgba(124, 58, 237, 0.1)" : "transparent",
              fontWeight: isActive("/") ? "600" : "500",
              fontSize: "15px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/")) {
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
                e.currentTarget.style.color = "#7c3aed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            Produtos
          </Link>

          <Link
            to="/cart"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              color: isActive("/cart") ? "#3b82f6" : "#64748b",
              backgroundColor: isActive("/cart") ? "rgba(59, 130, 246, 0.1)" : "transparent",
              fontWeight: isActive("/cart") ? "600" : "500",
              fontSize: "15px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/cart")) {
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
                e.currentTarget.style.color = "#7c3aed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/cart")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            Carrinho
            {cartItemsCount > 0 && (
              <span
                style={{
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "12px",
                  minWidth: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "0 8px",
                  boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                  animation: "pulse 2s infinite",
                }}
              >
                {cartItemsCount}
              </span>
            )}
          </Link>

          <Link
            to="/login"
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              textDecoration: "none",
              color: isActive("/login") ? "#3b82f6" : "#64748b",
              backgroundColor: isActive("/login") ? "rgba(59, 130, 246, 0.1)" : "transparent",
              fontWeight: isActive("/login") ? "600" : "500",
              fontSize: "15px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              if (!isActive("/login")) {
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.05)";
                e.currentTarget.style.color = "#7c3aed";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive("/login")) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
