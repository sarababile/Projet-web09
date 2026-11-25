import { createContext, useContext, useState } from 'react';
import api, { session } from '../api/client';

const AuthContext = createContext(null);

/** Fournit l'utilisateur connecté et les actions d'authentification à toute l'application. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = session.get('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password, remember) => {
    const { data } = await api.post('/login', { email, password });
    session.save(data, remember);
    setUser(data.user);
  };

  const register = async (form, remember) => {
    const { data } = await api.post('/register', form);
    session.save(data, remember);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } finally {
      session.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Le hook est volontairement exporté avec son Provider (pratique courante).
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);