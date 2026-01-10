import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
      <Link to="/" className="font-gta text-2xl text-white tracking-wider">
        RESIDENCIAL <span className="text-rockstar-yellow">V</span>
      </Link>

      <nav className="flex gap-6 font-gta text-sm tracking-widest">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="hover:text-rockstar-yellow transition-colors">Panel</Link>
            <Link to="/reservations" className="hover:text-rockstar-yellow transition-colors">Reservar</Link>
            <button onClick={logout} className="text-white/50 hover:text-white transition-colors">Salir</button>
          </>
        ) : (
          <Link to="/login" className="text-rockstar-yellow hover:text-white transition-colors">Acceder</Link>
        )}
      </nav>
    </header>
  );
}