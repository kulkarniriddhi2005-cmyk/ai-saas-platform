import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "../api/authApi.js";
import * as aiApi from "../api/aiApi.js";

const TOKEN_KEY = "quickai_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!token);

  const setToken = useCallback((t) => {
    setTokenState(t);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    authApi.setAuthToken(t);
    aiApi.setAiAuthToken(t);
  }, []);

  useEffect(() => {
    authApi.setAuthToken(token);
    aiApi.setAiAuthToken(token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await authApi.fetchMe();
        if (!cancelled) setUser(data.user);
      } catch (err) {
        const status = err.response?.status;
        if (!cancelled && (status === 401 || status === 403)) {
          setUser(null);
          setTokenState(null);
          localStorage.removeItem(TOKEN_KEY);
          authApi.setAuthToken(null);
          aiApi.setAiAuthToken(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(
    async (payload) => {
      const data = await authApi.login(payload);
      setToken(data.token);
      setUser(data.user);
      return data;
    },
    [setToken]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      return data;
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const updateAccount = useCallback(async (payload) => {
    const data = await authApi.updateMe(payload);
    setUser(data.user);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      updateAccount,
      logout,
      setToken,
    }),
    [user, token, loading, login, register, updateAccount, logout, setToken]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
