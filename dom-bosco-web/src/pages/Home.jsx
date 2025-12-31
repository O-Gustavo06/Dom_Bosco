import { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Carregando produtos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Ops! Algo deu errado</h2>
          <p>{error}</p>
          <p style={{ marginTop: "16px", fontSize: "14px", color: "#94a3b8" }}>
            Verifique se o servidor backend está rodando na porta 8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        className="fade-in"
        style={{
          marginBottom: "64px",
          textAlign: "center",
          padding: "40px 20px",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            marginBottom: "16px",
            letterSpacing: "-2px",
          }}
        >
          Nossos Produtos
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#64748b",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Descubra uma seleção premium de produtos cuidadosamente escolhidos para você
        </p>

        <div
          style={{
            marginTop: "32px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "20px",
              fontSize: "14px",
              color: "#3b82f6",
              fontWeight: "600",
            }}
          >
            ✨ Qualidade Premium
          </div>
          <div
            style={{
              padding: "8px 20px",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              borderRadius: "20px",
              fontSize: "14px",
              color: "#10b981",
              fontWeight: "600",
            }}
          >
            🚀 Entrega Rápida
          </div>
          <div
            style={{
              padding: "8px 20px",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              borderRadius: "20px",
              fontSize: "14px",
              color: "#8b5cf6",
              fontWeight: "600",
            }}
          >
            💎 Preços Competitivos
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>Nenhum produto encontrado</h2>
          <p>Não há produtos disponíveis no momento.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
