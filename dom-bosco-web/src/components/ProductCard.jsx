import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useState, useEffect } from "react";

function getImageUrl(product) {
  if (!product) return null;

  let imageField = null;

  if (product.image) {
    imageField = product.image;
  }
  else if (product.Image) {
    imageField = product.Image;
  }
  else if (product.imagens) {
    if (Array.isArray(product.imagens)) {
      imageField = product.imagens.length > 0 ? product.imagens[0] : null;
    }
    else if (typeof product.imagens === 'string') {
      try {
        const parsed = JSON.parse(product.imagens);
        if (Array.isArray(parsed)) {
          imageField = parsed.length > 0 ? parsed[0] : null;
        } else {
          imageField = parsed;
        }
      } catch {
        if (product.imagens.includes(',')) {
          imageField = product.imagens.split(',')[0].trim();
        } else {
          imageField = product.imagens;
        }
      }
    } else {
      imageField = product.imagens;
    }
  }
  else {
    imageField = product.image_url || product.imageUrl || product.imagem;
  }
  
  if (!imageField) {
    return null;
  }

  if (typeof imageField === 'string' && imageField.startsWith('[')) {
    try {
      const parsed = JSON.parse(imageField);
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageField = parsed[0];
      }
    } catch (e) {
    }
  }

  imageField = String(imageField).trim();

  if (imageField.startsWith("http://") || imageField.startsWith("https://")) {
    return imageField;
  }

  if (imageField.startsWith("/")) {
    return `http://localhost:8000${imageField}`;
  }

  return `http://localhost:8000/images/products/${imageField}`;
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(product);
  
  const hasMultipleImages = () => {
    if (!product.image) return false;
    
    if (typeof product.image === 'string' && product.image.startsWith('[')) {
      try {
        const parsed = JSON.parse(product.image);
        return Array.isArray(parsed) && parsed.length > 1;
      } catch {
        return false;
      }
    }
    return false;
  };
  
  const multipleImages = hasMultipleImages();

  useEffect(() => {
    if (product && product.id === 1) {
      console.log("🔍 ProductCard - Produto recebido:", product);
      console.log("🔍 ProductCard - Campo image:", product.image);
      console.log("🔍 ProductCard - URL da imagem gerada:", imageUrl);
    }
  }, [product, imageUrl]);

  return (
    <Link
      to={`/products/${product.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}
    >
      <div
        className="card fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          cursor: "pointer",
        }}
      >
      {/* IMAGEM */}
      <div
        style={{
          backgroundColor: imageUrl && !imageError ? "transparent" : "var(--surface-gray)",
          padding: imageUrl && !imageError ? 0 : "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "240px",
          position: "relative",
          overflow: "hidden",
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
              width: "60%",
              height: "100%",
              objectFit: "cover",
              display: "center",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: "64px",
              opacity: 0.3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📦
          </div>
        )}
        
        {multipleImages && !imageError && (
          <div style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            backgroundColor: "rgba(124, 58, 237, 0.9)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            🖼️ Múltiplas
          </div>
        )}
      </div>

      <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {product.category && (
          <span className="badge-category" style={{ marginBottom: "12px" }}>
            {product.category}
          </span>
        )}

        <h3
          style={{
            fontSize: "18px",
            fontWeight: "700",
            marginBottom: "8px",
            color: "var(--text-primary)",
            lineHeight: "1.4",
            letterSpacing: "-0.2px",
          }}
        >
          {product.name || "Produto sem nome"}
        </h3>

        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: "1.6",
            marginBottom: "20px",
            flex: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description || "Sem descrição disponível"}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-light)",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            R$ {product.price ? product.price.toFixed(2) : "0.00"}
          </span>
        </div>

        <button
          className="purple"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart(product);
          }}
          style={{
            width: "100%",
            marginTop: "auto",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(168, 85, 247, 0.35)",
          }}
        >
          <span>🛒</span>
          <span>Adicionar</span>
        </button>
      </div>
    </div>
    </Link>
  );
}

export default ProductCard;
