import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar usuários");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`❌ ${err.message}`);
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Carregando usuários...</div>;
  }

  return (
    <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "var(--text-primary)", marginBottom: "32px", fontSize: "28px" }}>
        👥 Gerenciar Usuários
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

      {users.length === 0 ? (
        <div style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}>
          Nenhum usuário cadastrado
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
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Nome</th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Email</th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Função</th>
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    backgroundColor: index % 2 === 0 ? "transparent" : "var(--surface-gray)",
                  }}
                >
                  <td style={{ padding: "16px", color: "var(--text-primary)" }}>{user.name}</td>
                  <td style={{ padding: "16px", color: "var(--text-primary)" }}>{user.email}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "600",
                      backgroundColor: user.role === "admin" ? "#fecaca" : "#d1fae5",
                      color: user.role === "admin" ? "#7f1d1d" : "#065f46",
                    }}>
                      {user.role === "admin" ? "👑 Admin" : "👤 Cliente"}
                    </span>
                  </td>
                  <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
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
