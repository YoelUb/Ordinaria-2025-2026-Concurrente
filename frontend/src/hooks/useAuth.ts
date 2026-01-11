import { useState, useEffect } from 'react';
import { api } from '../services/api';


export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Validar el token con el backend
      setIsAuthenticated(true);
      setUser({ email: 'vecino@comunidad.com' });
    }
  }, []);

  const login = (token: string, email: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
}