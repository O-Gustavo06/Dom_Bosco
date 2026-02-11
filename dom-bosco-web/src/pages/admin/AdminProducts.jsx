import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminProducts() {
  const { token } = useAuth();
  const MAX_IMAGES = 4;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);

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
  const [imageInputs, setImageInputs] = useState([""]);

  const [showImageManager, setShowImageManager] = useState(false);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [customImageName, setCustomImageName] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await fetch("http://localhost:8000/api/admin/categories", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Erro ao buscar categorias" }));
        throw new Error(data.error || "Erro ao buscar categorias");
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
    }
  };

  const parseImagesFromProduct = (imageField) => {
    if (!imageField) return [""];

    if (Array.isArray(imageField)) {
      const normalized = imageField.map((img) => String(img).trim()).filter(Boolean);
      return normalized.length > 0 ? normalized.slice(0, MAX_IMAGES) : [""];
    }

    if (typeof imageField === "string") {
      const trimmed = imageField.trim();
      if (!trimmed) return [""];

      if (trimmed.startsWith("[")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            const normalized = parsed.map((img) => String(img).trim()).filter(Boolean);
            return normalized.length > 0 ? normalized.slice(0, MAX_IMAGES) : [""];
          }
        } catch {
          // fallback to single value below
        }
      }

      return [trimmed].slice(0, MAX_IMAGES);
    }

    return [String(imageField).trim()].filter(Boolean).slice(0, MAX_IMAGES);
  };

  const normalizeImageInputs = (inputs) =>
    inputs.map((img) => img.trim()).filter(Boolean).slice(0, MAX_IMAGES);

  const buildImagePayload = (inputs) => {
    const images = normalizeImageInputs(inputs);
    if (images.length === 0) return null;
    if (images.length === 1) return images[0];
    return JSON.stringify(images);
  };

  const handleAddImageInput = () => {
    if (imageInputs.length >= MAX_IMAGES) return;
    setImageInputs((prev) => [...prev, ""]);
  };

  const handleRemoveImageInput = (index) => {
    setImageInputs((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  };

  const handleImageInputChange = (index, value) => {
    setImageInputs((prev) => prev.map((img, i) => (i === index ? value : img)));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }
      
      const response = await fetch("http://localhost:8000/api/admin/products", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("❌ Sessão expirada. Por favor, faça login novamente.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar produtos");
      }

      // A API retorna um array direto, não um objeto com propriedade products
      setProducts(Array.isArray(data) ? data : (data.products || []));
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
      setError("");
      
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`http://localhost:8000/api/admin/products/${productId}/images`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setProductImages(data.images || []);
    } catch (err) {
      console.error("Erro ao buscar imagens:", err);
      setError(`❌ ${err.message}`);
      setProductImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Armazena os arquivos e abre o modal para nomear o primeiro
    setPendingFiles(Array.from(files));
    setCurrentFileIndex(0);
    const fileName = files[0].name.split('.')[0];
    setCustomImageName(fileName);
    setShowNameModal(true);
    e.target.value = "";
  };

  const processImageUpload = async () => {
    if (!customImageName.trim()) {
      setError("❌ Por favor, insira um nome para a imagem");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const file = pendingFiles[currentFileIndex];
      const fileExtension = file.name.split('.').pop();
      const customFileName = `${customImageName.trim()}.${fileExtension}`;

      const formDataUpload = new FormData();
      formDataUpload.append("image", file);
      formDataUpload.append("product_id", selectedProductForImages.id);
      formDataUpload.append("custom_name", customFileName);

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

      // Se há mais arquivos, vai para o próximo
      if (currentFileIndex < pendingFiles.length - 1) {
        const nextIndex = currentFileIndex + 1;
        setCurrentFileIndex(nextIndex);
        const nextFileName = pendingFiles[nextIndex].name.split('.')[0];
        setCustomImageName(nextFileName);
      } else {
        // Última imagem enviada
        setSuccess(`✅ ${pendingFiles.length} imagem(ns) enviada(s) com sucesso!`);
        await fetchProductImages(selectedProductForImages.id);
        await fetchProducts();
        setShowNameModal(false);
        setPendingFiles([]);
        setCurrentFileIndex(0);
        setCustomImageName("");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao fazer upload:", err);
    } finally {
      setUploading(false);
    }
  };

  const cancelImageNaming = () => {
    setShowNameModal(false);
    setPendingFiles([]);
    setCurrentFileIndex(0);
    setCustomImageName("");
  };

  const handleDeleteImage = async (filename) => {
    if (!confirm(`Tem certeza que deseja deletar a imagem?`)) return;

    try {
      setError("");
      setSuccess("");
      
      console.log('🗑️ Tentando deletar imagem:', filename);
      console.log('🔗 URL:', `http://localhost:8000/api/admin/products/${selectedProductForImages.id}/images/${encodeURIComponent(filename)}`);
      
      const response = await fetch(`http://localhost:8000/api/admin/products/${selectedProductForImages.id}/images/${encodeURIComponent(filename)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log('📡 Status da resposta:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Erro ao deletar imagem" }));
        console.error('❌ Erro na resposta:', data);
        throw new Error(data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Resposta:', data);
      
      setSuccess("✅ Imagem deletada com sucesso!");
      await fetchProductImages(selectedProductForImages.id);
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("❌ Erro completo ao deletar imagem:", err);
      const errorMessage = err.message || "Erro de conexão com o servidor";
      setError(`❌ ${errorMessage}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  const openImageManager = (product) => {
    setSelectedProductForImages(product);
    setShowImageManager(true);
    setError("");
    setSuccess("");
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

    if (!formData.name || !formData.price || !formData.category_id) {
      setError("❌ Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:8000/api/admin/products/${editingId}`
        : "http://localhost:8000/api/admin/products";

      const stockValue = formData.stock === "" || formData.stock === null
        ? 0
        : formData.stock;

      const payload = {
        ...formData,
        stock: stockValue,
        image: buildImagePayload(imageInputs),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("❌ Sessão expirada. Redirecionando para login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

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

    console.log("Tentando deletar produto ID:", id);

    try {
      const response = await fetch(`http://localhost:8000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Status da resposta:", response.status);

      const data = await response.json();
      console.log("Resposta do servidor:", data);

      if (!response.ok) {
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
      stock: product.inventory_quantity ?? product.stock,
      category_id: product.category_id,
      active: product.active,
    });
    setImageInputs(parseImagesFromProduct(product.image));
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
    setImageInputs([""]);
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
        onClick={() => {
          if (showForm) {
            resetForm();
            return;
          }
          setShowForm(true);
        }}
        style={{
          padding: "10px 20px",
          backgroundColor: showForm ? "#6b7280" : "#7c3aed",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "24px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = showForm ? "#4b5563" : "#6d28d9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = showForm ? "#6b7280" : "#7c3aed";
        }}
      >
        {showForm ? "✕ Cancelar" : "➕ Novo Produto"}
      </button>

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "stretch",
            justifyContent: "flex-end",
            zIndex: 1200,
          }}
          onClick={resetForm}
        >
          <aside
            style={{
              width: "520px",
              maxWidth: "90vw",
              backgroundColor: "var(--surface)",
              borderLeft: "1px solid var(--border-color)",
              padding: "24px",
              overflowY: "auto",
              boxShadow: "-12px 0 30px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h2 style={{ margin: 0, color: "var(--text-primary)", fontSize: "20px" }}>
                  {editingId ? "Editar Produto" : "Novo Produto"}
                </h2>
                <p style={{ margin: "4px 0 0 0", color: "var(--text-secondary)", fontSize: "12px" }}>
                  Preencha os dados e salve as alteracoes
                </p>
              </div>
              <button
                onClick={resetForm}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
                aria-label="Fechar"
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  <input
                    type="number"
                    name="price"
                    placeholder="Preco *"
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
                </div>
                <select
                  name="category_id"
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
                >
                  <option value="">Selecione a categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="description"
                placeholder="Descricao"
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

              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}>
                  <label style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                    Imagens do produto (max {MAX_IMAGES})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddImageInput}
                    disabled={imageInputs.length >= MAX_IMAGES}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: imageInputs.length >= MAX_IMAGES ? "#9ca3af" : "#7c3aed",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: imageInputs.length >= MAX_IMAGES ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ➕ Adicionar
                  </button>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  {imageInputs.map((value, index) => (
                    <div
                      key={index}
                      style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px" }}
                    >
                      <input
                        type="text"
                        placeholder="URL completa ou nome do arquivo (ex: produto-1.jpg)"
                        value={value}
                        onChange={(e) => handleImageInputChange(index, e.target.value)}
                        style={{
                          padding: "12px",
                          border: "1px solid var(--border-color)",
                          borderRadius: "8px",
                          backgroundColor: "var(--surface-gray)",
                          color: "var(--text-primary)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImageInput(index)}
                        style={{
                          padding: "0 12px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "8px", color: "var(--text-secondary)", fontSize: "12px" }}>
                  Dica: voce pode informar URLs completas ou apenas o nome do arquivo salvo em
                  /images/products.
                </div>
              </div>

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
                  width: "100%",
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
          </aside>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
        {products.map((product) => {
          let imageUrl = 'http://localhost:8000/images/products/default.png';
          
          try {
            if (product.image) {
              const parsed = JSON.parse(product.image);
              if (Array.isArray(parsed) && parsed.length > 0) {
                imageUrl = `http://localhost:8000/images/products/${parsed[0]}`;
              } else if (typeof product.image === 'string' && !product.image.startsWith('[')) {
                imageUrl = `http://localhost:8000/images/products/${product.image}`;
              }
            }
          } catch (e) {
            if (product.image && typeof product.image === 'string') {
              imageUrl = `http://localhost:8000/images/products/${product.image}`;
            }
          }

          return (
            <div
              key={product.id}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                overflow: "hidden",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  backgroundColor: "var(--surface-gray)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={imageUrl}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = 'http://localhost:8000/images/products/default.png';
                  }}
                />
                {!product.active && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}>
                    Inativo
                  </div>
                )}
              </div>

              <div style={{ padding: "16px" }}>
                <h3 style={{ 
                  margin: "0 0 8px 0", 
                  color: "var(--text-primary)", 
                  fontSize: "16px",
                  fontWeight: "600",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {product.name}
                </h3>
                <p style={{ 
                  margin: "0 0 12px 0", 
                  color: "var(--text-secondary)", 
                  fontSize: "13px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minHeight: "36px",
                }}>
                  {product.description || "Sem descrição"}
                </p>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid var(--border-color)",
                }}>
                  <span style={{ 
                    color: "var(--text-primary)", 
                    fontWeight: "700",
                    fontSize: "18px",
                  }}>
                    R$ {parseFloat(product.price).toFixed(2)}
                  </span>
                  <span style={{ 
                    color: "var(--text-secondary)", 
                    fontSize: "13px",
                  }}>
                    Estoque: {product.inventory_quantity ?? product.stock}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleEdit(product)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563eb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#3b82f6";
                    }}
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => openImageManager(product)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "transparent",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--surface-gray)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    🖼️
                  </button>

                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef4444";
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showNameModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
          onClick={cancelImageNaming}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "450px",
              width: "100%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 16px 0", color: "var(--text-primary)", fontSize: "20px" }}>
              📝 Nomear Imagem ({currentFileIndex + 1}/{pendingFiles.length})
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <p style={{ margin: "0 0 8px 0", color: "var(--text-secondary)", fontSize: "14px" }}>
                Arquivo original: <strong>{pendingFiles[currentFileIndex]?.name}</strong>
              </p>
              <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: "600" }}>
                Nome da Imagem:
              </label>
              <input
                type="text"
                value={customImageName}
                onChange={(e) => setCustomImageName(e.target.value)}
                placeholder="Ex: caneta-azul"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !uploading) {
                    processImageUpload();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: "var(--background)",
                  color: "var(--text-primary)",
                  boxSizing: "border-box",
                }}
              />
              <p style={{ margin: "8px 0 0 0", color: "var(--text-secondary)", fontSize: "12px" }}>
                💡 Use apenas letras, números e hífens (ex: caneta-azul-10mm)
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={cancelImageNaming}
                disabled={uploading}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  cursor: uploading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: uploading ? 0.5 : 1,
                }}
              >
                ✕ Cancelar
              </button>
              <button
                onClick={processImageUpload}
                disabled={uploading || !customImageName.trim()}
                style={{
                  flex: 2,
                  padding: "12px",
                  backgroundColor: !customImageName.trim() || uploading ? "#6b7280" : "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: !customImageName.trim() || uploading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                {uploading ? "⏳ Enviando..." : currentFileIndex < pendingFiles.length - 1 ? "➡️ Próxima" : "✓ Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

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
