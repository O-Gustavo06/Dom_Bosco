import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminProducts() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
    active: 1,
  });

  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/admin/products", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar produtos");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductImages = async (productId) => {
    try {
      setLoadingImages(true);
      const response = await fetch(`http://localhost:8000/api/admin/products/${productId}/images`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar imagens");
      }

      setProductImages(data.images || []);
    } catch (err) {
      console.error("Erro ao buscar imagens:", err);
      setProductImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", files[i]);
        formDataUpload.append("product_id", selectedProductForImages.id);

        const response = await fetch("http://localhost:8000/api/admin/images/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formDataUpload,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao fazer upload da imagem");
        }
      }

      setSuccess(`✅ ${files.length} imagem(ns) enviada(s) com sucesso!`);
      await fetchProductImages(selectedProductForImages.id);
      e.target.value = "";
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao fazer upload:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (filename) => {
    if (!confirm(`Tem certeza que deseja deletar "${filename}"?`)) return;

    try {
      const response = await fetch(`http://localhost:8000/api/admin/images/${selectedProductForImages.id}/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao deletar imagem");
      }

      setSuccess("✅ Imagem deletada com sucesso!");
      await fetchProductImages(selectedProductForImages.id);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao deletar imagem:", err);
    }
  };

  const openImageManager = (product) => {
    setSelectedProductForImages(product);
    setShowImageManager(true);
    fetchProductImages(product.id);
  };

  const closeImageManager = () => {
    setShowImageManager(false);
    setSelectedProductForImages(null);
    setProductImages([]);
    setError("");
    setSuccess("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.price || !formData.stock || !formData.category_id) {
      setError("❌ Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:8000/api/admin/products/${editingId}`
        : "http://localhost:8000/api/admin/products";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.errors?.[0] || "Erro ao salvar produto");
      }

      setSuccess(`✅ Produto ${editingId ? "atualizado" : "criado"} com sucesso!`);
      await fetchProducts();
      resetForm();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao salvar produto:", err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar "${name}"?`)) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:8000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar produto");
      }

      setSuccess(`✅ Produto deletado com sucesso!`);
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao deletar produto:", err);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      active: product.active,
    });
    setEditingId(product.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category_id: "",
      active: 1,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Carregando produtos...</div>;
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "28px" }}>
          📦 Gerenciar Produtos
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          Total: {products.length} produtos
        </p>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "16px",
          border: "1px solid #ef5350",
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: "#e8f5e9",
          color: "#2e7d32",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "16px",
          border: "1px solid #4caf50",
        }}>
          {success}
        </div>
      )}

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "12px 24px",
          backgroundColor: showForm ? "#64748b" : "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
          marginBottom: "24px",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.2)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = showForm ? "0 4px 12px rgba(100, 116, 139, 0.3)" : "0 4px 12px rgba(99, 102, 241, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(99, 102, 241, 0.2)";
        }}
      >
        {showForm ? "✕ Cancelar" : "➕ Novo Produto"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "var(--surface)",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "32px",
            border: "1px solid var(--border-color)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "16px" }}>
            <input
              type="text"
              name="name"
              placeholder="Nome do Produto *"
              value={formData.name}
              onChange={handleInputChange}
              style={{
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                backgroundColor: "var(--surface-gray)",
                color: "var(--text-primary)",
              }}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Preço *"
              value={formData.price}
              onChange={handleInputChange}
              style={{
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                backgroundColor: "var(--surface-gray)",
                color: "var(--text-primary)",
              }}
              required
            />
            <input
              type="number"
              name="stock"
              placeholder="Estoque *"
              value={formData.stock}
              onChange={handleInputChange}
              style={{
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                backgroundColor: "var(--surface-gray)",
                color: "var(--text-primary)",
              }}
              required
            />
            <input
              type="number"
              name="category_id"
              placeholder="ID da Categoria *"
              value={formData.category_id}
              onChange={handleInputChange}
              style={{
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                backgroundColor: "var(--surface-gray)",
                color: "var(--text-primary)",
              }}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Descrição"
            value={formData.description}
            onChange={handleInputChange}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              backgroundColor: "var(--surface-gray)",
              color: "var(--text-primary)",
              marginBottom: "16px",
              fontFamily: "inherit",
              minHeight: "100px",
            }}
          />

          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="active"
              checked={formData.active === 1}
              onChange={handleInputChange}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span style={{ color: "var(--text-primary)" }}>Produto Ativo</span>
          </label>

          <button
            type="submit"
            style={{
              padding: "12px 24px",
              backgroundColor: "#7c3aed",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {editingId ? "💾 Atualizar" : "➕ Criar"}
          </button>
        </form>
      )}

      <div style={{ display: "grid", gap: "16px" }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>
                {product.name}
              </h3>
              <p style={{ margin: "0 0 12px 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                {product.description}
              </p>
              <div style={{ display: "flex", gap: "24px", fontSize: "14px", color: "var(--text-secondary)" }}>
                <span>💰 R$ {parseFloat(product.price).toFixed(2)}</span>
                <span>📦 {product.stock} em estoque</span>
                <span>{product.active ? "✅ Ativo" : "❌ Desativado"}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
              <button
                onClick={() => handleEdit(product)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => openImageManager(product)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
              >
                🖼️ Imagens
              </button>

              <button
                onClick={() => handleDelete(product.id, product.name)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#dc2626"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ef4444"}
              >
                🗑️ Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showImageManager && selectedProductForImages && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeImageManager}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ margin: 0, color: "var(--text-primary)" }}>
                🖼️ {selectedProductForImages.name}
              </h2>
              <button
                onClick={closeImageManager}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "14px",
              }}>
                {success}
              </div>
            )}

            <div
              style={{
                border: "2px dashed var(--border-color)",
                borderRadius: "8px",
                padding: "24px",
                textAlign: "center",
                marginBottom: "20px",
                cursor: "pointer",
                backgroundColor: "var(--surface-gray)",
                transition: "all 0.3s ease",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "#7c3aed";
                e.currentTarget.style.backgroundColor = "rgba(124, 58, 237, 0.1)";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.backgroundColor = "var(--surface-gray)";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.backgroundColor = "var(--surface-gray)";
                const files = e.dataTransfer.files;
                if (document.getElementById("imageInput")) {
                  document.getElementById("imageInput").files = files;
                  handleImageUpload({ target: { files } });
                }
              }}
            >
              <input
                id="imageInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <label
                htmlFor="imageInput"
                style={{
                  cursor: "pointer",
                  display: "block",
                }}
              >
                <div style={{ color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px" }}>
                  {uploading ? "Enviando..." : "Clique para selecionar ou arraste imagens"}
                </div>
                <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                  PNG, JPG, GIF ou WebP (máx. 5MB por arquivo)
                </div>
              </label>
            </div>

            <div>
              <h3 style={{ color: "var(--text-primary)", marginBottom: "12px", fontSize: "16px" }}>
                Imagens do Produto ({productImages.length})
              </h3>

              {loadingImages ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>
                  Carregando imagens...
                </div>
              ) : productImages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>
                  Nenhuma imagem ainda. Selecione uma acima.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px" }}>
                  {productImages.map((image) => (
                    <div
                      key={image.filename}
                      style={{
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--surface-gray)",
                      }}
                    >
                      <img
                        src={`http://localhost:8000${image.url}`}
                        alt={image.filename}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          padding: "4px",
                          display: "flex",
                          gap: "4px",
                          justifyContent: "center",
                        }}
                      >
                        <button
                          onClick={() => handleDeleteImage(image.filename)}
                          title="Deletar imagem"
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "transparent",
                            color: "white",
                            border: "1px solid white",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#ef4444";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          🗑️ Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
