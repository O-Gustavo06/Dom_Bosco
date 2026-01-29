import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../api/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filtrar produtos por categoria e pesquisa
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;
    
    // Filtrar por categoria
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }
    
    // Filtrar por termo de pesquisa
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [allProducts, selectedCategory, searchTerm]);

  const products = filteredProducts;

  if (loading) {
    return (
      <div className="container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px"
        }}>
          <div style={{
            width: "60px",
            height: "60px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #a855f7",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <p style={{ fontSize: "18px", color: "#64748b", fontWeight: "500" }}>
            Carregando produtos incríveis...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos de fundo com animação */}
        <div style={{
          position: "absolute",
          top: "40px",
          left: "10%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: "3px dashed rgba(167, 139, 250, 0.4)",
          animation: "float 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          top: "60px",
          right: "15%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "3px dashed rgba(244, 114, 182, 0.4)",
          animation: "float 4s ease-in-out infinite",
          animationDelay: "1s",
        }} />
        <div style={{
          position: "absolute",
          bottom: "180px",
          left: "8%",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          border: "2px solid rgba(96, 165, 250, 0.3)",
          animation: "float 5s ease-in-out infinite",
          animationDelay: "2s",
        }} />
        
        {/* Risquinhos decorativos */}
        <div style={{
          position: "absolute",
          top: "100px",
          left: "20%",
          width: "60px",
          height: "3px",
          background: "rgba(96, 165, 250, 0.5)",
          transform: "rotate(-15deg)",
          borderRadius: "2px",
        }} />
        <div style={{
          position: "absolute",
          bottom: "160px",
          right: "25%",
          width: "50px",
          height: "3px",
          background: "rgba(251, 146, 60, 0.5)",
          transform: "rotate(25deg)",
          borderRadius: "2px",
        }} />
        <div style={{
          position: "absolute",
          top: "140px",
          right: "18%",
          width: "45px",
          height: "3px",
          background: "rgba(236, 72, 153, 0.5)",
          transform: "rotate(-25deg)",
          borderRadius: "2px",
        }} />

        {/* Estrelas com animação */}
        <div style={{
          position: "absolute",
          top: "80px",
          right: "12%",
          fontSize: "48px",
          opacity: "0.8",
          animation: "twinkle 3s ease-in-out infinite",
        }}>
          ⭐
        </div>
        <div style={{
          position: "absolute",
          bottom: "200px",
          left: "18%",
          fontSize: "32px",
          opacity: "0.6",
          animation: "twinkle 2.5s ease-in-out infinite",
          animationDelay: "1s",
        }}>
          ✨
        </div>

        {/* Conteúdo Central */}
        <div style={{ 
          textAlign: "center", 
          position: "relative", 
          zIndex: 2, 
          maxWidth: "1200px",
          marginBottom: "80px",
          animation: "fadeInUp 1s ease-out",
        }}>
          <div style={{
            display: "inline-block",
            padding: "8px 24px",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "50px",
            marginBottom: "20px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#a855f7" }}>
              ✨ Bem-vindo à
            </span>
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 8vw, 72px)",
            fontWeight: "700",
            margin: "0 0 16px 0",
            color: "#1f2937",
            letterSpacing: "2px",
            fontFamily: "'Segoe UI', sans-serif",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.05)",
          }}>
            Papelaria
          </h1>
          <h2 style={{
            fontSize: "clamp(48px, 10vw, 110px)",
            fontWeight: "900",
            margin: "0 0 20px 0",
            letterSpacing: "-2px",
            fontFamily: "'Comic Sans MS', 'Brush Script MT', cursive",
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            flexWrap: "wrap",
            textShadow: "3px 3px 6px rgba(0, 0, 0, 0.08)",
          }}>
            <span style={{ color: "#ef4444", display: "inline-block", animation: "bounce 2s ease-in-out infinite" }}>D</span>
            <span style={{ color: "#ec4899", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.1s" }}>o</span>
            <span style={{ color: "#a855f7", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.2s" }}>m</span>
            <span style={{ color: "#6366f1", marginRight: "20px" }}> </span>
            <span style={{ color: "#3b82f6", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.3s" }}>B</span>
            <span style={{ color: "#10b981", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.4s" }}>o</span>
            <span style={{ color: "#84cc16", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.5s" }}>s</span>
            <span style={{ color: "#eab308", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.6s" }}>c</span>
            <span style={{ color: "#f97316", display: "inline-block", animation: "bounce 2s ease-in-out infinite", animationDelay: "0.7s" }}>o</span>
          </h2>
          <p style={{
            fontSize: "18px",
            color: "#475569",
            fontWeight: "500",
            maxWidth: "600px",
            margin: "0 auto",
          }}>
            Tudo o que você precisa para seus estudos e criatividade! 🎨📚
          </p>
        </div>

        {/* Plataforma com itens de papelaria na parte inferior */}
        <div style={{
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: "85%",
          maxWidth: "900px",
          height: "140px",
          background: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.98) 100%)",
          borderRadius: "200px 200px 0 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          padding: "25px",
          gap: "35px",
          boxShadow: "0 -15px 40px rgba(0,0,0,0.08)",
        }}>
          {/* Grampeador rosa */}
          <div style={{
            fontSize: "48px",
            transform: "translateY(-10px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-20px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-10px) scale(1)"}
          >📎</div>
          
          {/* Post-its */}
          <div style={{
            fontSize: "48px",
            transform: "translateY(-5px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-15px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-5px) scale(1)"}
          >📝</div>
          
          {/* Caderno azul */}
          <div style={{
            fontSize: "52px",
            transform: "translateY(-8px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-18px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-8px) scale(1)"}
          >📘</div>
          
          {/* Caderno branco */}
          <div style={{
            fontSize: "50px",
            transform: "translateY(-12px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-22px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-12px) scale(1)"}
          >📓</div>
          
          {/* Lápis coloridos */}
          <div style={{
            fontSize: "48px",
            transform: "translateY(-6px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-16px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-6px) scale(1)"}
          >✏️</div>
          
          <div style={{
            fontSize: "48px",
            transform: "translateY(-10px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-20px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-10px) scale(1)"}
          >🖍️</div>
          
          <div style={{
            fontSize: "48px",
            transform: "translateY(-4px)",
            transition: "transform 0.3s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-14px) scale(1.1)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(-4px) scale(1)"}
          >🖊️</div>
        </div>

        {/* Elementos decorativos superiores com animação */}
        <div style={{
          position: "absolute",
          top: "30px",
          left: "15%",
          fontSize: "32px",
          opacity: "0.7",
          transform: "rotate(-20deg)",
          animation: "wiggle 3s ease-in-out infinite",
        }}>
          ✏️
        </div>
        <div style={{
          position: "absolute",
          top: "50px",
          right: "20%",
          fontSize: "28px",
          opacity: "0.7",
          transform: "rotate(15deg)",
          animation: "wiggle 2.5s ease-in-out infinite",
          animationDelay: "0.5s",
        }}>
          📐
        </div>
        <div style={{
          position: "absolute",
          bottom: "180px",
          right: "10%",
          fontSize: "36px",
          opacity: "0.6",
          animation: "wiggle 3.5s ease-in-out infinite",
          animationDelay: "1s",
        }}>
          🎨
        </div>

        {/* Estilos de animação */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-20deg); }
            50% { transform: rotate(-10deg); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      <div className="container">
      <div
        className="fade-in"
        style={{
          marginBottom: "48px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {/* Badge animado */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
            borderRadius: "50px",
            marginBottom: "20px",
            boxShadow: "0 4px 15px rgba(168, 85, 247, 0.25)",
            animation: "pulse 2s ease-in-out infinite",
          }}>
            <span style={{ fontSize: "16px" }}>🛍️</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#6b21a8" }}>
              PRODUTOS EM DESTAQUE
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 56px)",
              fontWeight: "800",
              marginBottom: "16px",
              letterSpacing: "-1.5px",
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Todos os Produtos
          </h1>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "10px 24px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "50px",
            marginBottom: "36px",
            border: "2px solid #e2e8f0",
          }}>
            <span style={{ fontSize: "20px" }}>📦</span>
            <span style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#7c3aed",
            }}>
              {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </span>
          </div>

          {/* Barra de Pesquisa Melhorada */}
          <div
            style={{
              maxWidth: "650px",
              margin: "0 auto 32px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: "60px",
                padding: "6px 10px 6px 24px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                border: "3px solid #e2e8f0",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(168, 85, 247, 0.25)";
                e.currentTarget.style.borderColor = "#a855f7";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.08)";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                boxShadow: "0 4px 12px rgba(168, 85, 247, 0.3)",
              }}>
                <span style={{ fontSize: "20px" }}>🔍</span>
              </div>
              <input
                type="text"
                placeholder="Pesquisar produtos por nome, descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "16px",
                  padding: "14px 12px",
                  background: "transparent",
                  color: "#334155",
                  fontWeight: "500",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  style={{
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    marginRight: "4px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#64748b",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)";
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
        </div>

        {/* Filtro de Categorias Melhorado */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "48px",
            padding: "20px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "30px",
            boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <span style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "#64748b",
            marginRight: "8px",
            letterSpacing: "0.5px",
          }}>
            FILTRAR POR:
          </span>
          <button
            onClick={() => setSelectedCategory("all")}
            style={{
              padding: "12px 28px",
              borderRadius: "30px",
              fontSize: "14px",
              fontWeight: "700",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background:
                selectedCategory === "all"
                  ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                  : "white",
              color: selectedCategory === "all" ? "white" : "#64748b",
              boxShadow: selectedCategory === "all" 
                ? "0 8px 25px rgba(168, 85, 247, 0.35)" 
                : "0 2px 8px rgba(0, 0, 0, 0.08)",
              transform: selectedCategory === "all" ? "translateY(-2px)" : "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== "all") {
                e.currentTarget.style.background = "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)";
                e.currentTarget.style.color = "#a855f7";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(168, 85, 247, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== "all") {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.color = "#64748b";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
              }
            }}
          >
            ⭐ Todas Categorias
          </button>

          {categories.map((category, index) => {
            const icons = ["📚", "✏️", "🎨", "📝", "🖍️", "📐", "🖊️", "📌"];
            const icon = icons[index % icons.length];
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "12px 28px",
                  borderRadius: "30px",
                  fontSize: "14px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    selectedCategory === category
                      ? "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)"
                      : "white",
                  color: selectedCategory === category ? "white" : "#64748b",
                  boxShadow: selectedCategory === category 
                    ? "0 8px 25px rgba(168, 85, 247, 0.35)" 
                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  transform: selectedCategory === category ? "translateY(-2px)" : "translateY(0)",
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)";
                    e.currentTarget.style.color = "#a855f7";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(168, 85, 247, 0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.color = "#64748b";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
                  }
                }}
              >
                {icon} {category}
              </button>
            );
          })}
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 40px",
          background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
          borderRadius: "30px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
        }}>
          <div style={{
            fontSize: "80px",
            marginBottom: "24px",
            animation: "bounce 2s ease-in-out infinite",
          }}>
            {searchTerm.trim() ? "🔍" : "📦"}
          </div>
          <h2 style={{
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "16px",
            color: "#1e293b",
          }}>
            {searchTerm.trim()
              ? `Nenhum produto encontrado para "${searchTerm}"`
              : selectedCategory === "all"
              ? "Nenhum produto encontrado"
              : `Nenhum produto encontrado na categoria "${selectedCategory}"`}
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#64748b",
            marginBottom: "32px",
            maxWidth: "500px",
            margin: "0 auto 32px",
          }}>
            {searchTerm.trim()
              ? "Tente usar outros termos de pesquisa ou navegue pelas categorias."
              : selectedCategory === "all"
              ? "Não há produtos disponíveis no momento."
              : "Tente selecionar outra categoria ou visualizar todos os produtos."}
          </p>
          {(selectedCategory !== "all" || searchTerm.trim()) && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
              }}
              style={{
                padding: "16px 40px",
                fontSize: "16px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                color: "white",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                boxShadow: "0 8px 25px rgba(168, 85, 247, 0.35)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 35px rgba(168, 85, 247, 0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(168, 85, 247, 0.35)";
              }}
            >
              🏠 Ver Todos os Produtos
            </button>
          )}
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-20px); }
            }
          `}</style>
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
