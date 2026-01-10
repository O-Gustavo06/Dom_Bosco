import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";

// Helper para normalizar URL da imagem
function getImageUrl(product) {
  if (!product) return null;

  let imageField = null;

  // PRIORIDADE 1: Campo "Image" (com I maiúsculo) - campo do banco de dados
  if (product.Image) {
    imageField = product.Image;
  }
  // PRIORIDADE 2: Campo "imagens" (plural) - caso tenha múltiplas imagens
  else if (product.imagens) {
    // Se for array, pega o primeiro elemento
    if (Array.isArray(product.imagens)) {
      imageField = product.imagens.length > 0 ? product.imagens[0] : null;
    }
    // Se for string, tenta fazer parse (caso seja JSON)
    else if (typeof product.imagens === 'string') {
      try {
        // Tenta fazer parse se for JSON
        const parsed = JSON.parse(product.imagens);
        if (Array.isArray(parsed)) {
          imageField = parsed.length > 0 ? parsed[0] : null;
        } else {
          imageField = parsed;
        }
      } catch {
        // Se não for JSON, verifica se é separado por vírgula
        if (product.imagens.includes(',')) {
          imageField = product.imagens.split(',')[0].trim();
        } else {
          // É uma string simples com o nome do arquivo
          imageField = product.imagens;
        }
      }
    } else {
      imageField = product.imagens;
    }
  }
  // PRIORIDADE 3: Campos alternativos (fallback para compatibilidade)
  else {
    imageField = product.image || product.image_url || product.imageUrl || product.imagem;
  }
  
  if (!imageField) {
    return null;
  }

  // Limpa espaços em branco
  imageField = String(imageField).trim();

  // Se já é uma URL completa (http:// ou https://)
  if (imageField.startsWith("http://") || imageField.startsWith("https://")) {
    return imageField;
  }

  // Se começa com /, é um caminho relativo do backend
  if (imageField.startsWith("/")) {
    return `http://localhost:8000${imageField}`;
  }

  // Caso contrário, assume que é um nome de arquivo e monta o caminho
  return `http://localhost:8000/images/products/${imageField}`;
}

// Helper para obter todas as imagens (para galeria)
function getAllImages(product) {
  if (!product) return [];
  
  let images = [];

  // PRIORIDADE 1: Campo "Image" (com I maiúsculo) - campo do banco
  if (product.Image) {
    // Se for string separada por vírgula ou JSON
    if (typeof product.Image === 'string') {
      const trimmed = product.Image.trim();
      if (trimmed) {
        try {
          const parsed = JSON.parse(trimmed);
          images = Array.isArray(parsed) ? parsed.filter(img => img) : (parsed ? [parsed] : []);
        } catch {
          // Se não for JSON, verifica se é separado por vírgula
          if (trimmed.includes(',')) {
            images = trimmed.split(',').map(img => img.trim()).filter(img => img);
          } else {
            images = [trimmed];
          }
        }
      }
    } else if (Array.isArray(product.Image)) {
      images = product.Image.filter(img => img);
    } else if (product.Image) {
      images = [product.Image];
    }
  }
  // PRIORIDADE 2: Campo "imagens" (plural)
  else if (product.imagens) {
    if (Array.isArray(product.imagens)) {
      images = product.imagens.filter(img => img);
    } else if (typeof product.imagens === 'string') {
      const trimmed = product.imagens.trim();
      if (trimmed) {
        try {
          const parsed = JSON.parse(trimmed);
          images = Array.isArray(parsed) ? parsed.filter(img => img) : (parsed ? [parsed] : []);
        } catch {
          // Se não for JSON, verifica se é separado por vírgula
          if (trimmed.includes(',')) {
            images = trimmed.split(',').map(img => img.trim()).filter(img => img);
          } else {
            images = [trimmed];
          }
        }
      }
    }
  }
  // PRIORIDADE 3: Campos alternativos (fallback)
  else {
    const altImage = product.image || product.image_url || product.imageUrl || product.imagem;
    if (altImage) {
      images = [altImage];
    }
  }

  // Normaliza as URLs
  return images.map(img => {
    const trimmed = String(img).trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `http://localhost:8000${trimmed}`;
    }
    return `http://localhost:8000/images/products/${trimmed}`;
  });
}

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { isDark } = useTheme();
  
  const allImages = getAllImages(product);
  const safeImageIndex = allImages.length > 0 
    ? Math.min(currentImageIndex, allImages.length - 1) 
    : 0;
  const imageUrl = allImages.length > 0 
    ? allImages[safeImageIndex] 
    : getImageUrl(product);

  useEffect(() => {
    setLoading(true);
    setCurrentImageIndex(0); 
    setImageError(false); 
    setProduct(null); 
    
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
          <div>
            <div
              className="card"
              style={{
                width: "100%",
                height: "500px",
                background: imageUrl && !imageError
                  ? "#ffffff"
                  : "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
                position: "relative",
                overflow: "hidden",
                padding: imageUrl && !imageError ? 0 : "40px",
                marginBottom: allImages.length > 1 ? "16px" : "0",
              }}
            >
              {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={product.name || "Produto"}
                onError={() => {
                  setImageError(true);
                }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{ fontSize: "140px", filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}>
                  📦
                </div>
              )}
              
              {allImages.length > 1 && imageUrl && !imageError && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                      setImageError(false);
                    }}
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "20px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      zIndex: 10,
                    }}
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                      setImageError(false);
                    }}
                    style={{
                      position: "absolute",
                      right: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "20px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                      zIndex: 10,
                    }}
                  >
                    →
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                          setImageError(false);
                        }}
                        style={{
                          width: safeImageIndex === index ? "24px" : "8px",
                          height: "8px",
                          borderRadius: "4px",
                          border: "none",
                          backgroundColor: safeImageIndex === index ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
              
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  padding: "10px 20px",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: imageUrl && !imageError ? "#475569" : "white",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {product.category}
              </div>
            </div>

            {allImages.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(allImages.length, 5)}, 1fr)`,
                  gap: "12px",
                  marginTop: "16px",
                }}
              >
                {allImages.slice(0, 5).map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                      setImageError(false);
                    }}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: safeImageIndex === index ? "3px solid #a855f7" : "2px solid #e2e8f0",
                      padding: 0,
                      cursor: "pointer",
                      background: "transparent",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (safeImageIndex !== index) {
                        e.currentTarget.style.borderColor = "#a855f7";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (safeImageIndex !== index) {
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }
                    }}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Imagem ${index + 1}`}
                      style={{
                        width: "80%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
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
                background: isDark 
                  ? "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)"
                  : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                border: isDark 
                  ? "1px solid rgba(167, 139, 250, 0.15)"
                  : "2px solid #e2e8f0",
                padding: "32px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  color: "var(--text-muted)",
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
                  background: isDark
                    ? "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
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
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <div>
                  <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                    Estoque
                  </span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "18px" }}>
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
