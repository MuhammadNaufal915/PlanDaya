import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi, getToken, setToken, clearAuth, getUser, setUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState]     = useState(getUser);
  const [loading, setLoading]    = useState(true);
  const [initialized, setInit]   = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      authApi.me()
        .then(res => {
          setUserState(res.data);
          setUser(res.data);
        })
        .catch(() => clearAuth())
        .finally(() => { setLoading(false); setInit(true); });
    } else {
      setLoading(false);
      setInit(true);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    setUserState(res.data.user);
    return res;
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await authApi.register({ name, email, password, password_confirmation });
    setToken(res.data.token);
    setUser(res.data.user);
    setUserState(res.data.user);
    return res;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    setUserState(null);
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
