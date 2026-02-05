import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para filtros
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Estado para visualizar detalhes do pedido
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [token, filter, startDate, endDate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      let url = `http://localhost:8000/api/admin/orders?filter=${filter}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("❌ Sessão expirada. Por favor, faça login novamente.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar pedidos");
      }

      setOrders(Array.isArray(data) ? data : data.orders || []);
      setStatistics(data.statistics || null);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingDetails(true);
      setError("");

      const response = await fetch(
        `http://localhost:8000/api/admin/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar detalhes do pedido");
      }

      setSelectedOrder(data);
      setShowOrderDetails(true);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao buscar detalhes:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:8000/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar status");
      }

      setSuccess("✅ Status atualizado com sucesso!");
      fetchOrders();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        fetchOrderDetails(orderId);
      }

    } catch (err) {
      setError(`❌ ${err.message}`);
    }
  };

  const updateTrackingStatus = async (orderId, newTrackingStatus) => {
    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://localhost:8000/api/admin/orders/${orderId}/tracking-status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tracking_status: newTrackingStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar status de rastreamento");
      }

      setSuccess("✅ Status de rastreamento atualizado com sucesso!");
      fetchOrders();
      
      if (selectedOrder && selectedOrder.id === orderId) {
        fetchOrderDetails(orderId);
      }

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao atualizar status:", err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: "⏳ Pendente", bg: "#fef3c7", color: "#78350f" },
      processing: { label: "⚙️ Processando", bg: "#dbeafe", color: "#1e3a8a" },
      completed: { label: "✅ Concluído", bg: "#d1fae5", color: "#065f46" },
      cancelled: { label: "❌ Cancelado", bg: "#fecaca", color: "#7f1d1d" },
    };

    const badge = badges[status] || badges.pending;
    return (
      <span style={{
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: badge.bg,
        color: badge.color,
      }}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Carregando pedidos...</div>;
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--text-primary)", marginBottom: "32px", fontSize: "28px" }}>
        🛒 Gerenciar Pedidos
      </h1>

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

        {/* Estatísticas */}
        {statistics && (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
            gap: "16px", 
            marginBottom: "24px" 
          }}>
            <div style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px" }}>
                Total de Pedidos
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)" }}>
                {statistics.total_orders || 0}
              </p>
            </div>
            <div style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px" }}>
                Receita Total
              </h3>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-primary)" }}>
                {formatCurrency(statistics.total_revenue || 0)}
              </p>
            </div>
            <div style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px" }}>
                Ticket Médio
              </h3>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: "var(--text-primary)" }}>
                {formatCurrency(statistics.average_order || 0)}
              </p>
            </div>
            <div style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <h3 style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "8px" }}>
                Concluídos
              </h3>
              <p style={{ fontSize: "32px", fontWeight: "bold", color: "var(--text-primary)" }}>
                {statistics.completed_orders || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "24px",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)" }}>
            🔍 Filtros
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "16px" 
          }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                Período
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--surface)",
                }}
              >
                <option value="all">Todos os Períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Última Semana</option>
                <option value="month">Último Mês</option>
                <option value="year">Último Ano</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--surface)",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "8px" }}>
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--surface)",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => {
                  setFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                style={{
                  width: "100%",
                  padding: "8px 16px",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🔄 Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Pedidos */}
        {orders.length === 0 ? (
          <div style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}>
            Nenhum pedido encontrado
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "var(--surface)",
              borderRadius: "12px",
              overflow: "hidden",
            }}>
              <thead>
                <tr style={{ backgroundColor: "var(--surface-gray)", borderBottom: "2px solid var(--border-color)" }}>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>ID</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Cliente</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Total</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Itens</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Entrega</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Data</th>
                  <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      backgroundColor: index % 2 === 0 ? "transparent" : "var(--surface-gray)",
                    }}
                  >
                    <td style={{ padding: "16px", color: "var(--text-primary)", fontWeight: "600" }}>
                      #{order.id}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                        {order.user_name}
                      </div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                        {order.user_email}
                      </div>
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-primary)", fontWeight: "600" }}>
                      {formatCurrency(order.total)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: "#e0f2fe",
                        color: "#0c4a6e",
                      }}>
                        {order.items_count} {order.items_count === 1 ? "item" : "itens"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: order.delivery_tipo === "pickup" ? "#fef3c7" : "#dbeafe",
                        color: order.delivery_tipo === "pickup" ? "#92400e" : "#1e40af",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>{order.delivery_tipo === "pickup" ? "🏪" : "🚚"}</span>
                        {order.delivery_tipo === "pickup" ? "Retirada" : "Entrega"}
                      </span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>
                      {formatDate(order.created_at)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        📋 Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Painel Lateral de Detalhes do Pedido */}
      {showOrderDetails && selectedOrder && (
        <>
          {/* Overlay escuro */}
          <div 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 9998,
            }}
            onClick={() => setShowOrderDetails(false)}
          ></div>
          
          {/* Painel lateral */}
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100%",
            width: "100%",
            maxWidth: "700px",
            backgroundColor: "var(--surface)",
            boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.1)",
            zIndex: 9999,
            overflowY: "auto",
          }}>
            {/* Header fixo */}
            <div style={{
              position: "sticky",
              top: 0,
              backgroundColor: "#2563eb",
              padding: "20px 24px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              zIndex: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "white" }}>
                  📦 Pedido #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  style={{
                    color: "white",
                    fontSize: "36px",
                    fontWeight: "bold",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  title="Fechar"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div style={{ padding: "24px" }}>

              {loadingDetails ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <p style={{ color: "var(--text-secondary)" }}>Carregando detalhes...</p>
                </div>
              ) : (
                <>
                  {/* Informações do Cliente */}
                  <div style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}>
                    <h3 style={{ fontWeight: "600", fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)" }}>
                      👤 Informações do Cliente
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <p style={{ fontSize: "14px" }}>
                        <strong style={{ color: "var(--text-secondary)" }}>Nome:</strong> 
                        <span style={{ marginLeft: "8px", color: "var(--text-primary)" }}>{selectedOrder.user_name}</span>
                      </p>
                      <p style={{ fontSize: "14px" }}>
                        <strong style={{ color: "var(--text-secondary)" }}>Email:</strong> 
                        <span style={{ marginLeft: "8px", color: "var(--text-primary)" }}>{selectedOrder.user_email}</span>
                      </p>
                      <p style={{ fontSize: "14px" }}>
                        <strong style={{ color: "var(--text-secondary)" }}>Data do Pedido:</strong> 
                        <span style={{ marginLeft: "8px", color: "var(--text-primary)" }}>{formatDate(selectedOrder.created_at)}</span>
                      </p>
                      <p style={{ fontSize: "14px" }}>
                        <strong style={{ color: "var(--text-secondary)" }}>Tipo de Entrega:</strong> 
                        <span style={{ 
                          marginLeft: "8px", 
                          color: "var(--text-primary)",
                          fontWeight: "600"
                        }}>
                          {selectedOrder.delivery_tipo === "pickup" ? "🏪 Retirar na Loja" : "🚚 Entrega em Casa"}
                        </span>
                      </p>
                      {selectedOrder.delivery_tipo === "delivery" && selectedOrder.delivery_entrega && (
                        <>
                          <p style={{ fontSize: "14px", gridColumn: "1 / -1" }}>
                            <strong style={{ color: "var(--text-secondary)" }}>Endereço de Entrega:</strong> 
                            <span style={{ marginLeft: "8px", color: "var(--text-primary)" }}>
                              {selectedOrder.delivery_entrega}
                              {selectedOrder.delivery_Numero_casa && `, Nº ${selectedOrder.delivery_Numero_casa}`}
                              {selectedOrder.delivery_cidade && ` - ${selectedOrder.delivery_cidade}`}
                              {selectedOrder.delivery_cep && ` - CEP: ${selectedOrder.delivery_cep}`}
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status do Pedido */}
                  <div style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "20px",
                  }}>
                    <h3 style={{ fontWeight: "600", fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)" }}>
                      📊 Status do Pedido
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Atual:</span>
                        {getStatusBadge(selectedOrder.status)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Alterar para:</span>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) =>
                            updateOrderStatus(selectedOrder.id, e.target.value)
                          }
                          style={{
                            flex: 1,
                            padding: "8px 12px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            backgroundColor: "var(--surface)",
                          }}
                        >
                          <option value="pending">⏳ Pendente</option>
                          <option value="processing">⚙️ Processando</option>
                          <option value="completed">✅ Concluído</option>
                          <option value="cancelled">❌ Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Status de Rastreamento (apenas para delivery) */}
                  {selectedOrder.delivery_tipo === "delivery" && (
                    <div style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                    }}>
                      <h3 style={{ fontWeight: "600", fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)" }}>
                        📦 Status de Rastreamento
                      </h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Etapa Atual:</span>
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            color: "#3b82f6"
                          }}>
                            {selectedOrder.status_de_rastreamento === "analise_pendente" && "🔍 Em Análise"}
                            {selectedOrder.status_de_rastreamento === "separando" && "📦 Sendo Separado"}
                            {selectedOrder.status_de_rastreamento === "pronto_envio" && "✅ Pronto para Envio"}
                            {selectedOrder.status_de_rastreamento === "a_caminho" && "🚚 A Caminho"}
                            {selectedOrder.status_de_rastreamento === "entregue" && "🎉 Entregue"}
                            {selectedOrder.status_de_rastreamento === "cancelado" && "❌ Cancelado"}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)" }}>Alterar para:</span>
                          <select
                            value={selectedOrder.status_de_rastreamento || "analise_pendente"}
                            onChange={(e) =>
                              updateTrackingStatus(selectedOrder.id, e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "1px solid var(--border-color)",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "var(--text-primary)",
                              backgroundColor: "var(--surface)",
                            }}
                          >
                            <option value="analise_pendente">🔍 Em Análise</option>
                            <option value="separando">📦 Sendo Separado</option>
                            <option value="pronto_envio">✅ Pronto para Envio</option>
                            <option value="a_caminho">🚚 A Caminho</option>
                            <option value="entregue">🎉 Entregue</option>
                            <option value="cancelado">❌ Cancelado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Itens do Pedido */}
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontWeight: "600", fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)" }}>
                      🛍️ Itens do Pedido
                    </h3>
                    <div style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ backgroundColor: "var(--surface-gray)" }}>
                            <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Produto</th>
                            <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Qtd.</th>
                            <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Preço Unit.</th>
                            <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.items && selectedOrder.items.map((item, index) => (
                            <tr key={item.id} style={{
                              backgroundColor: index % 2 === 0 ? "var(--surface)" : "var(--surface-gray)",
                              borderBottom: "1px solid var(--border-color)",
                            }}>
                              <td style={{ padding: "12px" }}>
                                <p style={{ fontWeight: "600", color: "var(--text-primary)", fontSize: "14px" }}>{item.product_name}</p>
                              </td>
                              <td style={{ padding: "12px", textAlign: "center" }}>
                                <span style={{
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  backgroundColor: "#e0f2fe",
                                  color: "#0c4a6e",
                                }}>
                                  {item.quantity}
                                </span>
                              </td>
                              <td style={{ padding: "12px", textAlign: "right", fontWeight: "600", color: "var(--text-secondary)", fontSize: "14px" }}>
                                {formatCurrency(item.price)}
                              </td>
                              <td style={{ padding: "12px", textAlign: "right" }}>
                                <span style={{ fontWeight: "bold", fontSize: "16px", color: "var(--text-primary)" }}>
                                  {formatCurrency(item.quantity * item.price)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Total */}
                  <div style={{
                    backgroundColor: "#d1fae5",
                    border: "1px solid #065f46",
                    borderRadius: "12px",
                    padding: "24px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "20px", fontWeight: "bold", color: "#065f46" }}>💰 Total do Pedido:</span>
                      <span style={{ fontSize: "28px", fontWeight: "bold", color: "#065f46" }}>
                        {formatCurrency(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
