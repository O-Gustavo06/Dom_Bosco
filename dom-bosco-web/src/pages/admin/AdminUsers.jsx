import { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";

function AdminUsers() {
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:8000/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar usuários");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${name}"?`)) return;

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao deletar usuário");
      }

      setSuccess(`✅ Usuário deletado com sucesso!`);
      await fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao deletar usuário:", err);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "8px", fontSize: "28px" }}>
          👥 Gerenciar Usuários
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Visualize e controle os usuários do sistema
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: isDark ? "#4c0519" : "#fee2e2",
            borderLeft: "4px solid #dc2626",
            color: isDark ? "#fca5a5" : "#991b1b",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: isDark ? "#064e3b" : "#dcfce7",
            borderLeft: "4px solid #16a34a",
            color: isDark ? "#86efac" : "#15803d",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
          }}
        >
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <div style={{ color: "var(--text-secondary)" }}>Carregando usuários...</div>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
          <div style={{ color: "var(--text-secondary)" }}>Nenhum usuário cadastrado</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto", boxShadow: "var(--shadow-sm)", borderRadius: "12px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "var(--surface)",
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
                  Email
                </th>
                <th style={{ padding: "16px", textAlign: "center", color: "var(--text-primary)", fontWeight: "600" }}>
                  Role
                </th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>
                  Cadastrado em
                </th>
                <th style={{ padding: "16px", textAlign: "center", color: "var(--text-primary)", fontWeight: "600" }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--surface-gray)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "16px", color: "var(--text-secondary)" }}>
                    #{user.id}
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-primary)", fontWeight: "500" }}>
                    {user.name}
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-primary)" }}>
                    {user.email}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: user.role === "admin" ? "#dbeafe" : "#f3e8ff",
                        color: user.role === "admin" ? "#0c4a6e" : "#6b21a8",
                      }}
                    >
                      {user.role === "admin" ? "👑 Admin" : "👤 Cliente"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
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
                      🗑️ Deletar
                    </button>
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

export default AdminUsers;
