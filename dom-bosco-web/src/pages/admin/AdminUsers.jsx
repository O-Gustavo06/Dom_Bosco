import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "customer" });

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      const response = await fetch("http://localhost:8000/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
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

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({ name: user.name || "", email: user.email || "", role: user.role || "customer" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setForm({ name: "", email: "", role: "customer" });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      const payload = { name: form.name, email: form.email, role: (form.role || 'customer').toLowerCase() };
      const res = await fetch(`http://localhost:8000/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Erro ao atualizar usuário');

      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...payload } : u));
      closeModal();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError('❌ ' + (err.message || 'Erro ao atualizar usuário'));
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm('Confirma remoção deste usuário?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || json.message || 'Erro ao remover usuário');
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      console.error('Erro ao remover usuário:', err);
      setError('❌ ' + (err.message || 'Erro ao remover usuário'));
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
                <th style={{ padding: "16px", textAlign: "left", color: "var(--text-primary)", fontWeight: "600" }}>Ações</th>
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
                  <td style={{ padding: "16px" }}>
                    <button onClick={() => openEdit(user)} style={{ marginRight: 8 }}>Editar</button>
                    <button onClick={() => handleDelete(user)}>Remover</button>
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

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 8, width: 440 }}>
            <h3 style={{ marginTop: 0 }}>Editar usuário</h3>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Nome</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Email</label>
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Função</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ width: '100%', padding: 8 }}>
                <option value="customer">Cliente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={closeModal} style={{ marginRight: 8 }}>Cancelar</button>
              <button onClick={handleSave}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
