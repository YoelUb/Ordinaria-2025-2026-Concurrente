    import { Navigate, useLocation } from 'react-router-dom';
    import toast from 'react-hot-toast';

    // Interfaz para las props del componente
    interface ProtectedRouteProps {
      children: JSX.Element;
      requireAdmin?: boolean;
    }

    // Interfaz para el payload del JWT
    interface JwtPayload {
      sub: string;
      role?: string; // Asegúrate de que tu backend incluya el rol en el token
      exp: number;
      [key: string]: any;
    }

    // Función auxiliar para decodificar JWT sin librerías externas
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

      // 1. Verificación básica: ¿Existe el token?
      if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }

      // 2. Decodificar el token para verificaciones avanzadas
      const payload = parseJwt(token);

      if (!payload) {
        // Si el token no es válido o está corrupto
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
      }

      // 3. Verificar Expiración (exp está en segundos, Date.now en ms)
      const isExpired = payload.exp * 1000 < Date.now();
      if (isExpired) {
        localStorage.removeItem('token');
        toast.error('Tu sesión ha expirado. Ingresa nuevamente.');
        return <Navigate to="/login" replace />;
      }

      // 4. Verificar Rol de Admin (si se requiere)
      if (requireAdmin) {
        // Si el token no tiene el rol 'admin', redirigir al dashboard de usuario
        // NOTA: Esto asume que tu backend incluye el campo "role": "admin" en el JWT.
        // Si tu backend no lo hace, tendrás que guardar el rol en localStorage al hacer login
        // y leerlo desde ahí: const userRole = localStorage.getItem('role');

        if (payload.role !== 'admin') {
           toast.error('Acceso no autorizado.');
           return <Navigate to="/dashboard" replace />;
        }
      }

      // Si pasa todas las validaciones, renderizar el componente hijo
      return children;
    };