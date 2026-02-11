import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDark } = useTheme();
  const [showForgot, setShowForgot] = useState(false);
  const [birthdate, setBirthdate] = useState(""); // d/m/Y
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");

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

  return (<>
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

          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <button onClick={() => { setShowForgot(true); setForgotError(''); setForgotSuccess(''); }} style={{ background: 'transparent', border: 'none', color: isDark ? '#a78bfa' : '#2563eb', cursor: 'pointer', fontWeight: 600 }}>
              Esqueci minha senha
            </button>
          </div>

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
      {showForgot && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: isDark ? '#111' : '#fff', padding: 20, borderRadius: 8, width: 420 }}>
            <h3 style={{ marginTop: 0 }}>Recuperar senha</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>Informe seu email, data de nascimento e nova senha.</p>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Data de nascimento (dd/mm/aaaa)</label>
              <input value={birthdate} onChange={e => setBirthdate(e.target.value)} placeholder="01/01/2000" style={{ width: '100%', padding: 8 }} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Nova senha</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Confirme a nova senha</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
            </div>

            {forgotError && <p style={{ color: '#dc2626' }}>{forgotError}</p>}
            {forgotSuccess && <p style={{ color: '#16a34a' }}>{forgotSuccess}</p>}

            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <button onClick={() => setShowForgot(false)} style={{ marginRight: 8 }}>Cancelar</button>
              <button onClick={async () => {
                setForgotError('');
                setForgotSuccess('');
                if (!email || !isValidEmail(email)) { setForgotError('Email inválido'); return; }
                const bdRegex = /^\d{2}\/\d{2}\/\d{4}$/;
                if (!bdRegex.test(birthdate)) { setForgotError('Data de nascimento inválida (dd/mm/aaaa)'); return; }
                if (newPassword.length < 6) { setForgotError('Senha deve ter no mínimo 6 caracteres'); return; }
                if (newPassword !== confirmPassword) { setForgotError('Senhas não conferem'); return; }

                setForgotLoading(true);
                try {
                  const res = await fetch('http://localhost:8000/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.toLowerCase().trim(), birthdate, new_password: newPassword })
                  });
                  const json = await res.json();
                  if (!res.ok) {
                    setForgotError(json.error || json.message || 'Erro ao atualizar senha');
                  } else {
                    setForgotSuccess('Senha alterada com sucesso. Faça login com a nova senha.');
                  }
                } catch (err) {
                  setForgotError('Erro ao conectar com o servidor');
                } finally {
                  setForgotLoading(false);
                }
              }}>{forgotLoading ? 'Enviando...' : 'Enviar'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Login;
