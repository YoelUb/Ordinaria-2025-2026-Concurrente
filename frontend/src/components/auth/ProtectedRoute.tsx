import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: JSX.Element;
  requireAdmin?: boolean;
}

interface JwtPayload {
  sub: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Decodificar payload si existe token
  const payload = token ? parseJwt(token) : null;

  // Calcular condiciones
  const isTokenMissing = !token;
  const isInvalidToken = token && !payload;
  const isExpired = payload && (payload.exp * 1000 < Date.now());
  const isUnauthorized = requireAdmin && payload && payload.role !== 'admin';

  // EFECTOS: Manejar las notificaciones y limpieza fuera del render
  useEffect(() => {
    if (isInvalidToken) {
      localStorage.removeItem('token');
    }
    if (isExpired) {
      localStorage.removeItem('token');
      // Usamos setTimeout 0 para asegurar que ocurra en el siguiente ciclo
      setTimeout(() => toast.error('Tu sesión ha expirado. Ingresa nuevamente.'), 0);
    }
    if (isUnauthorized) {
      setTimeout(() => toast.error('Acceso no autorizado.'), 0);
    }
  }, [isInvalidToken, isExpired, isUnauthorized]);

  // RENDERIZADO: Redirecciones
  if (isTokenMissing || isInvalidToken || isExpired) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isUnauthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};