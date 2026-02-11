import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminInventory() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);

  const [quantityEdits, setQuantityEdits] = useState({});
  const [minEdits, setMinEdits] = useState({});
  const [adjustEdits, setAdjustEdits] = useState({});

  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [token, showLowOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Token nao encontrado. Faca login novamente.");
      }

      const url = showLowOnly
        ? "http://localhost:8000/api/admin/inventory/low-stock"
        : "http://localhost:8000/api/admin/inventory";

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("❌ Sessao expirada. Por favor, faca login novamente.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar estoque");
      }

      const rows = Array.isArray(data) ? data : [];
      setItems(rows);

      const nextQuantity = {};
      const nextMin = {};
      const nextAdjust = {};
      rows.forEach((item) => {
        nextQuantity[item.product_id] = String(item.quantity ?? 0);
        nextMin[item.product_id] = String(item.min_quantity ?? 5);
        nextAdjust[item.product_id] = "1";
      });
      setQuantityEdits(nextQuantity);
      setMinEdits(nextMin);
      setAdjustEdits(nextAdjust);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateRow = async (productId) => {
    try {
      setError("");
      setSuccess("");

      const quantity = parseInt(quantityEdits[productId] ?? "0", 10);
      const minQuantity = parseInt(minEdits[productId] ?? "5", 10);

      const response = await fetch(
        `http://localhost:8000/api/admin/inventory/${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: Number.isNaN(quantity) ? 0 : quantity,
            min_quantity: Number.isNaN(minQuantity) ? 5 : minQuantity,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar estoque");
      }

      setSuccess("✅ Estoque atualizado");
      fetchInventory();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    }
  };

  const adjustRow = async (productId, direction) => {
    try {
      setError("");
      setSuccess("");

      const amount = parseInt(adjustEdits[productId] ?? "1", 10);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("Informe um valor valido para ajuste");
      }

      const endpoint = direction === "inc" ? "increment" : "decrement";
      const response = await fetch(
        `http://localhost:8000/api/admin/inventory/${productId}/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao ajustar estoque");
      }

      setSuccess("✅ Estoque ajustado");
      fetchInventory();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(`❌ ${err.message}`);
    }
  };

  const openHistory = async (item) => {
    try {
      setHistoryOpen(true);
      setHistoryProduct(item);
      setHistoryItems([]);
      setHistoryLoading(true);

      const response = await fetch(
        `http://localhost:8000/api/admin/inventory/movements?product_id=${item.product_id}&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar historico");
      }

      setHistoryItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`❌ ${err.message}`);
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setHistoryOpen(false);
    setHistoryProduct(null);
    setHistoryItems([]);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Carregando estoque...</div>;
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "28px" }}>
            🛡️ Estoque
          </h1>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Total: {items.length} produtos
          </p>
        </div>

        <button
          onClick={() => setShowLowOnly((prev) => !prev)}
          style={{
            padding: "10px 16px",
            backgroundColor: showLowOnly ? "#f59e0b" : "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {showLowOnly ? "Ver todos" : "Apenas baixo estoque"}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#ffebee",
          color: "#c62828",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "16px",
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
        }}>
          {success}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
              <th style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>Produto</th>
              <th style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>Quantidade</th>
              <th style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>Minimo</th>
              <th style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>Status</th>
              <th style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>Atualizado</th>
              <th style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isLow = Number(item.quantity) < Number(item.min_quantity);
              return (
                <tr key={item.product_id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "12px 8px", color: "var(--text-primary)", fontWeight: "600" }}>
                    {item.product_name}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <input
                      type="number"
                      value={quantityEdits[item.product_id] ?? ""}
                      onChange={(e) =>
                        setQuantityEdits((prev) => ({
                          ...prev,
                          [item.product_id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "90px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--surface-gray)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <input
                      type="number"
                      value={minEdits[item.product_id] ?? ""}
                      onChange={(e) =>
                        setMinEdits((prev) => ({
                          ...prev,
                          [item.product_id]: e.target.value,
                        }))
                      }
                      style={{
                        width: "80px",
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "var(--surface-gray)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: isLow ? "#fecaca" : "#d1fae5",
                      color: isLow ? "#7f1d1d" : "#065f46",
                    }}>
                      {isLow ? "Baixo" : "OK"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                    {item.last_update || "-"}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => updateRow(item.product_id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#7c3aed",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Salvar
                      </button>

                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="number"
                          value={adjustEdits[item.product_id] ?? "1"}
                          onChange={(e) =>
                            setAdjustEdits((prev) => ({
                              ...prev,
                              [item.product_id]: e.target.value,
                            }))
                          }
                          style={{
                            width: "70px",
                            padding: "6px",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--surface-gray)",
                            color: "var(--text-primary)",
                          }}
                        />
                        <button
                          onClick={() => adjustRow(item.product_id, "inc")}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => adjustRow(item.product_id, "dec")}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          -
                        </button>
                      </div>

                      <button
                        onClick={() => openHistory(item)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "transparent",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Historico
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {historyOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={closeHistory}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              padding: "20px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h2 style={{ margin: 0, color: "var(--text-primary)" }}>
                Historico - {historyProduct?.product_name}
              </h2>
              <button
                onClick={closeHistory}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                }}
              >
                ✕
              </button>
            </div>

            {historyLoading ? (
              <div style={{ padding: "20px", textAlign: "center" }}>Carregando...</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "8px", color: "var(--text-secondary)" }}>Data</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)" }}>Delta</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)" }}>Depois</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)" }}>Tipo</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)" }}>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((row) => (
                    <tr key={row.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "8px", color: "var(--text-secondary)" }}>{row.created_at}</td>
                      <td style={{
                        padding: "8px",
                        color: row.change_amount >= 0 ? "#10b981" : "#ef4444",
                        fontWeight: "600",
                      }}>
                        {row.change_amount > 0 ? "+" : ""}{row.change_amount}
                      </td>
                      <td style={{ padding: "8px", color: "var(--text-primary)" }}>{row.quantity_after}</td>
                      <td style={{ padding: "8px", color: "var(--text-secondary)" }}>{row.type}</td>
                      <td style={{ padding: "8px", color: "var(--text-secondary)" }}>{row.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
