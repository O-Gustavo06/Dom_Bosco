import { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      // Verifica se o token ainda é válido
      try {
        const tokenParts = savedToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationTime = payload.exp * 1000; // Converter para milissegundos
          
          if (expirationTime < Date.now()) {
            // Token expirado, limpar localStorage
            console.log("Token expirado detectado, limpando...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
          } else {
            // Token válido
            setToken(savedToken);
            const savedUser = localStorage.getItem("user");
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
          }
        }
      } catch (error) {
        // Token inválido, limpar
        console.error("Erro ao validar token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao fazer login");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  };

  const register = async (name, email, password, birthdate) => {
    const response = await fetch("http://localhost:8000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, birthdate })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Erro ao registrar");
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: localStorage.getItem("token"),
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {}
    };
  }
  return context;
}
