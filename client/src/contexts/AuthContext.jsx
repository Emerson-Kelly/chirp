import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  async function fetchUser(jwt) {
    console.log(jwt);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchUser(token);
    else setLoading(false);
  }, [token]);

  function login(jwt) {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
