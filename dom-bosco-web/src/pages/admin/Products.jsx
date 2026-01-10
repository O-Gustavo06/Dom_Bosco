import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function AdminProducts() {
  const { isDark } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const token = localStorage.getItem("token");

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/admin/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar produtos");
      }

      setProducts(data.products || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

    if (!formData.name || !formData.price || !formData.stock || !formData.category_id) {
      setError("Preencha todos os campos obrigatórios");
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

      await fetchProducts();
      resetForm();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

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

      await fetchProducts();
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category_id: product.category_id,
      active: product.active,
    });
    setEditingId(product.id);
    setShowForm(true);
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

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "12px" }}>
          Gerenciar Produtos
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Adicione, edite ou delete produtos
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            borderLeft: "4px solid #dc2626",
            color: "#991b1b",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={() => (showForm ? resetForm() : setShowForm(true))}
        style={{
          padding: "12px 24px",
          backgroundColor: showForm ? "#ef4444" : "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          marginBottom: "24px",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {showForm ? "Cancelar" : "+ Novo Produto"}
      </button>

      {showForm && (
        <div
          style={{
            background: isDark
              ? "linear-gradient(135deg, #262626 0%, #1a1a1a 100%)"
              : "#ffffff",
            border: isDark ? "1px solid rgba(167, 139, 250, 0.15)" : "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ color: "var(--text-primary)", marginBottom: "24px" }}>
            {editingId ? "Editar Produto" : "Novo Produto"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--surface-gray)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--surface-gray)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Estoque (Qtd) *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--surface-gray)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Categoria *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--surface-gray)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                  }}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="1">Cadernos</option>
                  <option value="2">Canetas e Lápis</option>
                  <option value="3">Papéis</option>
                  <option value="4">Mochilas</option>
                  <option value="5">Outros</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "var(--surface-gray)",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    minHeight: "100px",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active === 1}
                  onChange={handleInputChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label style={{ color: "var(--text-secondary)", cursor: "pointer", margin: 0 }}>
                  Ativo
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {editingId ? "Atualizar" : "Criar"} Produto
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "var(--surface-gray)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--surface-gray)";
                }}
              >
                Limpar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Carregando produtos...
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Nenhum produto cadastrado ainda
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--surface-gray)", borderBottom: "2px solid var(--border-color)" }}>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>
                  ID
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>
                  Nome
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>
                  Preço
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>
                  Estoque
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>
                  Categoria
                </th>
                <th style={{ padding: "16px", textAlign: "center", color: "var(--text-primary)", fontWeight: "600" }}>
                  Status
                </th>
                <th style={{ padding: "16px", textAlign: "center", color: "var(--text-primary)", fontWeight: "600" }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--surface-gray)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{product.id}</td>
                  <td style={{ padding: "16px", color: "var(--text-primary)", fontWeight: "500" }}>
                    {product.name}
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-primary)" }}>
                    R$ {parseFloat(product.price).toFixed(2)}
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-primary)" }}>{product.stock}</td>
                  <td style={{ padding: "16px", color: "var(--text-secondary)" }}>
                    {["", "Cadernos", "Canetas", "Papéis", "Mochilas"][product.category_id]}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: product.active ? "#dcfce7" : "#fee2e2",
                        color: product.active ? "#15803d" : "#991b1b",
                      }}
                    >
                      {product.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#2563eb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#3b82f6";
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#dc2626";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#ef4444";
                        }}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
