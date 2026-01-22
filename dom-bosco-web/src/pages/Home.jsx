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
          <p style={{ marginTop: "16px", fontSize: "14px", color: "var(--text-muted)" }}>
            Verifique se o servidor backend está rodando na porta 8000
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Banner Full Width - Estilo Papelaria Dom Bosco */}
      <div
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
          marginBottom: "48px",
          background: "linear-gradient(135deg, #fce7f3 0%, #e0e7ff 30%, #ddd6fe 60%, #fef3c7 100%)",
          position: "relative",
          minHeight: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos de fundo */}
        <div style={{
          position: "absolute",
          top: "40px",
          left: "10%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "2px dashed rgba(167, 139, 250, 0.3)",
        }} />
        <div style={{
          position: "absolute",
          top: "60px",
          right: "15%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "2px dashed rgba(244, 114, 182, 0.3)",
        }} />
        
        {/* Risquinhos decorativos */}
        <div style={{
          position: "absolute",
          top: "100px",
          left: "20%",
          width: "60px",
          height: "2px",
          background: "rgba(96, 165, 250, 0.4)",
          transform: "rotate(-15deg)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "120px",
          right: "25%",
          width: "50px",
          height: "2px",
          background: "rgba(251, 146, 60, 0.4)",
          transform: "rotate(25deg)",
        }} />

        {/* Estrelas */}
        <div style={{
          position: "absolute",
          top: "80px",
          right: "12%",
          fontSize: "48px",
          opacity: "0.7",
        }}>
          ⭐
        </div>

        {/* Conteúdo Central */}
        <div style={{ 
          textAlign: "center", 
          position: "relative", 
          zIndex: 2, 
          maxWidth: "1200px",
          marginBottom: "80px"
        }}>
          <h1 style={{
            fontSize: "clamp(36px, 8vw, 72px)",
            fontWeight: "700",
            margin: "0 0 16px 0",
            color: "#1f2937",
            letterSpacing: "2px",
            fontFamily: "'Segoe UI', sans-serif",
          }}>
            Papelaria
          </h1>
          <h2 style={{
            fontSize: "clamp(48px, 10vw, 110px)",
            fontWeight: "900",
            margin: "0",
            letterSpacing: "-2px",
            fontFamily: "'Comic Sans MS', 'Brush Script MT', cursive",
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}>
            <span style={{ color: "#ef4444" }}>D</span>
            <span style={{ color: "#ec4899" }}>o</span>
            <span style={{ color: "#a855f7" }}>m</span>
            <span style={{ color: "#6366f1", marginRight: "20px" }}> </span>
            <span style={{ color: "#3b82f6" }}>B</span>
            <span style={{ color: "#10b981" }}>o</span>
            <span style={{ color: "#84cc16" }}>s</span>
            <span style={{ color: "#eab308" }}>c</span>
            <span style={{ color: "#f97316" }}>o</span>
          </h2>
        </div>

        {/* Plataforma com itens de papelaria na parte inferior */}
        <div style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          maxWidth: "800px",
          height: "120px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.95) 100%)",
          borderRadius: "200px 200px 0 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          padding: "20px",
          gap: "30px",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.05)",
        }}>
          {/* Grampeador rosa */}
          <div style={{
            fontSize: "48px",
            transform: "translateY(-10px)",
          }}>📎</div>
          
          {/* Post-its */}
          <div style={{
            fontSize: "48px",
            transform: "translateY(-5px)",
          }}>📝</div>
          
          {/* Caderno azul */}
          <div style={{
            fontSize: "52px",
            transform: "translateY(-8px)",
          }}>📘</div>
          
          {/* Caderno branco */}
          <div style={{
            fontSize: "50px",
            transform: "translateY(-12px)",
          }}>📓</div>
          
          {/* Lápis coloridos */}
          <div style={{
            fontSize: "48px",
            transform: "translateY(-6px)",
          }}>✏️</div>
          
          <div style={{
            fontSize: "48px",
            transform: "translateY(-10px)",
          }}>🖍️</div>
          
          <div style={{
            fontSize: "48px",
            transform: "translateY(-4px)",
          }}>🖊️</div>
        </div>

        {/* Elementos decorativos superiores */}
        <div style={{
          position: "absolute",
          top: "30px",
          left: "15%",
          fontSize: "32px",
          opacity: "0.6",
          transform: "rotate(-20deg)",
        }}>
          ✏️
        </div>
        <div style={{
          position: "absolute",
          top: "50px",
          right: "20%",
          fontSize: "28px",
          opacity: "0.6",
          transform: "rotate(15deg)",
        }}>
          📐
        </div>
      </div>

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
              color: "var(--text-primary)",
            }}
          >
            Todos os Produtos
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "var(--text-secondary)",
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
    </>
  );
}

export default Home;
