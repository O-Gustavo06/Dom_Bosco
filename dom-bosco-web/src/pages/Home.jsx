import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then((data) => {
        // Debug: Verificar estrutura dos produtos recebidos
        if (data && data.length > 0) {
          console.log("🔍 Estrutura do primeiro produto:", data[0]);
          console.log("🔍 Campo Image:", data[0].Image);
        }
        setAllProducts(data);
      })
      .catch((err) => {
        console.error("❌ Erro ao carregar produtos:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Extrair categorias únicas
  const categories = useMemo(() => {
    const cats = [...new Set(allProducts.map((p) => p.category))].filter(Boolean);
    return cats.sort();
  }, [allProducts]);

  // Filtrar produtos por categoria
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return allProducts;
    }
    return allProducts.filter((product) => product.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  const products = filteredProducts;

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
          marginBottom: "48px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "800",
              marginBottom: "12px",
              letterSpacing: "-1.5px",
              color: "#1e293b",
            }}
          >
            Todos os Produtos
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              marginBottom: "32px",
            }}
          >
            {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>

        {/* Filtro de Categorias */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "10px 24px",
              borderRadius: "25px",
              fontSize: "14px",
              fontWeight: "600",
              border: "2px solid",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background:
                selectedCategory === "all"
                  ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                  : "transparent",
              color: selectedCategory === "all" ? "white" : "#64748b",
              borderColor: selectedCategory === "all" ? "transparent" : "#e2e8f0",
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== "all") {
                e.currentTarget.style.borderColor = "#a855f7";
                e.currentTarget.style.color = "#a855f7";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== "all") {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#64748b";
              }
            }}
          >
            Todas Categorias
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "10px 24px",
                borderRadius: "25px",
                fontSize: "14px",
                fontWeight: "600",
                border: "2px solid",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  selectedCategory === category
                    ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                    : "transparent",
                color: selectedCategory === category ? "white" : "#64748b",
                borderColor: selectedCategory === category ? "transparent" : "#e2e8f0",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = "#a855f7";
                  e.currentTarget.style.color = "#a855f7";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <h2>
            {selectedCategory === "all"
              ? "Nenhum produto encontrado"
              : `Nenhum produto encontrado na categoria "${selectedCategory}"`}
          </h2>
          <p>
            {selectedCategory === "all"
              ? "Não há produtos disponíveis no momento."
              : "Tente selecionar outra categoria ou visualizar todos os produtos."}
          </p>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="purple"
              style={{
                marginTop: "24px",
                padding: "12px 24px",
              }}
            >
              Ver Todos os Produtos
            </button>
          )}
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
