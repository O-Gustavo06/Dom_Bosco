import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function Register() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    birthdate: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validação de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de senha
  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const isValidBirthdate = (birthdate) => {
    const match = /^\d{2}\/\d{2}\/\d{4}$/.test(birthdate);
    if (!match) {
      return false;
    }

    const [day, month, year] = birthdate.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }

    return date <= new Date();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação local ANTES de enviar
    if (!form.name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    if (!form.email.trim()) {
      setError("E-mail é obrigatório");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("E-mail inválido. Use o formato: seu@email.com");
      return;
    }

    if (!form.password) {
      setError("Senha é obrigatória");
      return;
    }

    if (!form.birthdate) {
      setError("Data de nascimento é obrigatória");
      return;
    }

    if (!isValidBirthdate(form.birthdate)) {
      setError("Data de nascimento inválida. Use o formato: DD/MM/AAAA");
      return;
    }

    if (!isValidPassword(form.password)) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar");
      }

      alert("Usuário cadastrado com sucesso!");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <div 
          className="card fade-in" 
          style={{ 
            padding: "40px",
            background: isDark 
              ? "linear-gradient(135deg, #262626 0%, #1a1a1a 100%)"
              : "var(--surface)",
            border: isDark ? "1px solid rgba(167, 139, 250, 0.15)" : "none",
          }}
        >
          <h1 style={{ marginBottom: "24px", color: "var(--text-primary)" }}>Criar conta</h1>

          {error && (
            <p style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-secondary)" }}>Nome</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-secondary)" }}>E-mail</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "var(--text-secondary)" }}>Data de nascimento</label>
              <input
                type="text"
                name="birthdate"
                placeholder="DD/MM/AAAA"
                required
                value={form.birthdate}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "var(--text-secondary)" }}>Senha</label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontWeight: "600",
                background: "var(--primary-gradient)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
