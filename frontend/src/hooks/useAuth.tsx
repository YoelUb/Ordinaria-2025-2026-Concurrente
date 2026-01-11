import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      try {
        // Intentamos obtener los datos del usuario usando el token
        const response = await api.get('/auth/me');

        setIsAuthenticated(true);
        setUser(response.data || { email: 'usuario@validado.com' });
      } catch (error) {
        console.error("Token expirado o inválido", error);
        // Si falla la validación, cerramos sesión
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    validateToken();
  }, []);

  const login = (token: string, email: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser({ email });
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  return { isAuthenticated, user, login, logout };
}