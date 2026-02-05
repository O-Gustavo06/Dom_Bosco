import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    fetchMyOrders();
  }, [user, token, navigate]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar pedidos");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTrackingStatusInfo = (trackingStatus) => {
    const statusMap = {
      analise_pendente: {
        label: "Em Análise",
        icon: "🔍",
        color: "#3b82f6",
        progress: 20,
      },
      separando: {
        label: "Sendo Separado",
        icon: "📦",
        color: "#f59e0b",
        progress: 40,
      },
      pronto_envio: {
        label: "Pronto para Envio",
        icon: "✅",
        color: "#8b5cf6",
        progress: 60,
      },
      a_caminho: {
        label: "A Caminho",
        icon: "🚚",
        color: "#10b981",
        progress: 80,
      },
      entregue: {
        label: "Entregue",
        icon: "🎉",
        color: "#059669",
        progress: 100,
      },
      cancelado: {
        label: "Cancelado",
        icon: "❌",
        color: "#ef4444",
        progress: 0,
      },
    };

    return statusMap[trackingStatus] || statusMap.analise_pendente;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        <p>❌ {error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "40px 20px",
      minHeight: "80vh"
    }}>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "32px",
          fontWeight: "700",
          color: "var(--text-primary)",
          marginBottom: "8px"
        }}>
          Meus Pedidos
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Acompanhe o status dos seus pedidos
        </p>
      </div>

      {orders.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "var(--surface)",
          borderRadius: "16px",
          border: "1px solid var(--border-color)"
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
          <h3 style={{ 
            fontSize: "20px", 
            marginBottom: "8px",
            color: "var(--text-primary)"
          }}>
            Nenhum pedido encontrado
          </h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
            Você ainda não fez nenhum pedido
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 24px",
              background: isDark 
                ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Ir para loja
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {orders.map((order) => {
            const trackingInfo = getTrackingStatusInfo(order.status_de_rastreamento);
            
            return (
              <div
                key={order.id}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Header do Pedido */}
                <div style={{
                  padding: "24px",
                  borderBottom: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  <div>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "4px"
                    }}>
                      Pedido #{order.id}
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)"
                    }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--text-primary)"
                    }}>
                      {formatPrice(order.total)}
                    </p>
                    <p style={{
                      fontSize: "14px",
                      color: "var(--text-secondary)"
                    }}>
                      {order.items_count} {order.items_count === 1 ? "item" : "itens"}
                    </p>
                  </div>
                </div>

                {/* Status de Rastreamento */}
                {order.delivery_tipo === "delivery" && order.status_de_rastreamento !== "cancelado" && (
                  <div style={{ padding: "24px", background: isDark ? "rgba(139, 92, 246, 0.05)" : "rgba(59, 130, 246, 0.03)" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "32px" }}>{trackingInfo.icon}</span>
                        <div>
                          <h4 style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "4px"
                          }}>
                            {trackingInfo.label}
                          </h4>
                          <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                            {order.status_de_rastreamento === "entregue" 
                              ? "Seu pedido foi entregue com sucesso!"
                              : "Acompanhe o status do seu pedido"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${trackingInfo.progress}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${trackingInfo.color}, ${trackingInfo.color}dd)`,
                        transition: "width 0.5s ease",
                        borderRadius: "4px"
                      }} />
                    </div>

                    {/* Etapas */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "24px",
                      gap: "8px"
                    }}>
                      {[
                        { key: "analise_pendente", label: "Análise" },
                        { key: "separando", label: "Separando" },
                        { key: "pronto_envio", label: "Pronto" },
                        { key: "a_caminho", label: "Enviado" },
                        { key: "entregue", label: "Entregue" }
                      ].map((step, index) => {
                        const stepInfo = getTrackingStatusInfo(step.key);
                        const isCompleted = stepInfo.progress <= trackingInfo.progress;
                        
                        return (
                          <div
                            key={step.key}
                            style={{
                              flex: 1,
                              textAlign: "center",
                              opacity: isCompleted ? 1 : 0.4
                            }}
                          >
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: isCompleted ? stepInfo.color : "var(--border-color)",
                              margin: "0 auto 8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px"
                            }}>
                              {isCompleted ? "✓" : ""}
                            </div>
                            <p style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                              fontWeight: isCompleted ? "600" : "400"
                            }}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Endereço de Entrega */}
                {order.delivery_tipo === "delivery" && order.delivery_entrega && (
                  <div style={{
                    padding: "20px 24px",
                    borderTop: "1px solid var(--border-color)",
                    background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)"
                  }}>
                    <p style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px"
                    }}>
                      📍 ENDEREÇO DE ENTREGA
                    </p>
                    <p style={{
                      fontSize: "14px",
                      color: "var(--text-primary)"
                    }}>
                      {order.delivery_entrega}
                      {order.delivery_Numero_casa && `, Nº ${order.delivery_Numero_casa}`}
                      {order.delivery_cidade && ` - ${order.delivery_cidade}`}
                      {order.delivery_cep && ` - CEP: ${order.delivery_cep}`}
                    </p>
                  </div>
                )}

                {/* Retirada na Loja */}
                {order.delivery_tipo === "pickup" && (
                  <div style={{
                    padding: "20px 24px",
                    borderTop: "1px solid var(--border-color)",
                    background: "rgba(245, 158, 11, 0.1)"
                  }}>
                    <p style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#f59e0b",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}>
                      🏪 Retirada na Loja
                    </p>
                  </div>
                )}

                {/* Itens do Pedido */}
                <div style={{ padding: "24px" }}>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    marginBottom: "16px"
                  }}>
                    ITENS DO PEDIDO
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: "flex",
                          gap: "16px",
                          alignItems: "center"
                        }}
                      >
                        {item.image_url && (
                          <img
                            src={`http://localhost:8000${item.image_url}`}
                            alt={item.product_name}
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid var(--border-color)"
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "4px"
                          }}>
                            {item.product_name}
                          </p>
                          <p style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)"
                          }}>
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <p style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          color: "var(--text-primary)"
                        }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
