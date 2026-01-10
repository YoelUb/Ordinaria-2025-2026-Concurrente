import { useNavigate } from 'react-router-dom';
import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      <Background image="https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=2070&auto=format&fit=crop" />
      <Header />

      <main className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-24 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h2 className="font-gta text-xl md:text-2xl text-white/80 tracking-[0.5em] mb-4">
            SISTEMA DE GESTIÓN
          </h2>
          <h1 className="font-gta text-7xl md:text-9xl mb-8 leading-none">
            RESERVAS <br/>
            <span className="text-rockstar-yellow">COMUNITARIAS</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
            Gestiona el acceso a las instalaciones deportivas y zonas comunes.
            Sin esperas. Sin conflictos. Estricto orden de llegada.
          </p>

          <div className="flex gap-4">
            <button onClick={() => navigate('/login')} className="btn-primary">
              ACCEDER
            </button>
            <button onClick={() => navigate('/reservations')} className="btn-ghost">
              VER DISPONIBILIDAD
            </button>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-6 left-6 md:left-24 text-xs font-mono text-white/30 uppercase">
        System v.2.0.26 | Secure Connection
      </footer>
    </div>
  );
}