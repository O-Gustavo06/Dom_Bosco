import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDark } = useTheme();

  // Validação de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validação local ANTES de enviar
    if (!email.trim()) {
      setError("E-mail é obrigatório");
      return;
    }

    if (!isValidEmail(email)) {
      setError("E-mail inválido. Use o formato: seu@email.com");
      return;
    }

    if (!password) {
      setError("Senha é obrigatória");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "E-mail ou senha inválidos");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch {
      setError("Erro ao conectar com o servidor");
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
            padding: "48px",
            background: isDark 
              ? "linear-gradient(135deg, #262626 0%, #1a1a1a 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: isDark ? "1px solid rgba(167, 139, 250, 0.15)" : "none",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div
              style={{
                fontSize: "64px",
                marginBottom: "20px",
                padding: "20px",
                background:
                  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "20px",
              }}
            >
              🔐
            </div>

            <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-primary)" }}>
              Bem-vindo de volta
            </h1>

            <p style={{ color: "var(--text-secondary)" }}>
              Entre com suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "var(--text-secondary)" }}>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ color: "var(--text-secondary)" }}>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%" }}
              />
            </div>

            {error && (
              <p style={{ color: "#dc2626", marginBottom: "16px" }}>
                {error}
              </p>
            )}

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
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border-color)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              Não tem uma conta?{" "}
              <Link
                to="/register"
                style={{
                  color: isDark ? "#a78bfa" : "#2563eb",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
