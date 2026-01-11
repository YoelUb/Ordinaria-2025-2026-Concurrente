import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, MapPin } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function Landing() {
  const comp = useRef(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      // 1. Animación del Hero (El título hace zoom al bajar)
      gsap.to(".hero-img", {
        scale: 1.2,
        scrollTrigger: {
          trigger: ".hero-section",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // 2. Animación de las Cards (Aparecen al hacer scroll)
      const sections = gsap.utils.toArray('.info-section');
      sections.forEach((section: any) => {
        gsap.from(section.querySelectorAll('.anim-text'), {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: section,
            start: "top 75%", // Empieza cuando la sección está al 75% de la vista
            toggleActions: "play none none reverse"
          }
        });

        gsap.from(section.querySelectorAll('.anim-img'), {
          x: 100, // Vienen desde la derecha
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
          }
        });
      });

    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={comp} className="relative w-full">
      {/* --- NAVBAR FLOTANTE --- */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 mix-blend-difference text-white">
        <div className="font-gta text-2xl tracking-widest">RESIDENCIAL <span className="text-r-yellow">V</span></div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 border border-white/30 px-6 py-2 rounded-full font-gta tracking-wider hover:bg-white hover:text-black transition-all"
        >
          <Lock size={16} /> ÁREA SOCIOS
        </button>
      </nav>

      {/* --- 1. HERO SECTION --- */}
      <div className="hero-section relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
            {/* Imagen de fondo de alta calidad */}
            <img
                src="https://images.unsplash.com/photo-1542259648-522c07c126d2?q=80&w=2069&auto=format&fit=crop"
                alt="City"
                className="hero-img w-full h-full object-cover brightness-50"
            />
        </div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-r-yellow font-gta tracking-[0.5em] text-xl mb-4 uppercase">Sistema de Gestión</h2>
          <h1 className="font-gta text-7xl md:text-9xl text-white leading-none mb-6">
            ORDEN Y <br /> PROGRESO
          </h1>
          <p className="max-w-xl mx-auto text-white/70 text-lg">
            La plataforma exclusiva para la gestión de instalaciones comunitarias.
            Reserva pistas, piscinas y zonas comunes con prioridad absoluta.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 animate-bounce">
            <span className="font-gta text-xs tracking-widest text-white/50">SCROLL DOWN</span>
        </div>
      </div>

      {/* --- 2. SECCIÓN PÁDEL (Imagen Derecha) --- */}
      <section className="info-section min-h-screen flex flex-col md:flex-row items-center bg-r-black border-t border-white/10">
        <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
            <div className="anim-text">
                <h3 className="text-r-yellow font-gta text-xl mb-2">01. DEPORTE</h3>
                <h2 className="font-gta text-6xl mb-6">PISTAS DE <br/>PÁDEL PRO</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    Dos pistas reglamentarias con iluminación LED nocturna.
                    Sistema de reserva en tiempo real para evitar conflictos entre vecinos.
                    El que reserva primero, juega. Sin excepciones.
                </p>
                <div className="flex gap-4 items-center text-sm font-bold uppercase tracking-widest">
                    <MapPin className="text-r-yellow" /> Zona Norte
                </div>
            </div>
        </div>
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1626224583764-847649623dbb?q=80&w=2070&auto=format&fit=crop"
                className="anim-img w-full h-full object-cover"
            />
        </div>
      </section>

      {/* --- 3. SECCIÓN PISCINA (Imagen Izquierda) --- */}
      <section className="info-section min-h-screen flex flex-col-reverse md:flex-row items-center bg-neutral-900">
        <div className="w-full md:w-1/2 h-[50vh] md:h-screen relative overflow-hidden">
            <img
                src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=2070&auto=format&fit=crop"
                className="anim-img w-full h-full object-cover"
            />
        </div>
        <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col justify-center text-right md:text-left">
            <div className="anim-text">
                <h3 className="text-blue-400 font-gta text-xl mb-2">02. RELAX</h3>
                <h2 className="font-gta text-6xl mb-6">PISCINA <br/>INFINITY</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    Control de aforo digital automatizado. Disfruta del verano sin aglomeraciones.
                    Consulta la ocupación en directo desde tu panel de control personal.
                </p>
                <button onClick={() => navigate('/login')} className="inline-flex items-center gap-2 text-white border-b border-r-yellow pb-1 hover:text-r-yellow transition-colors font-gta tracking-widest text-xl">
                    RESERVAR AHORA <ArrowRight size={20} />
                </button>
            </div>
        </div>
      </section>

      {/* --- 4. CTA FINAL (Estilo Apple Large Text) --- */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center bg-r-black px-4">
        <h2 className="font-gta text-5xl md:text-8xl mb-8 max-w-4xl mx-auto leading-tight">
            ¿LISTO PARA <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-r-yellow to-yellow-600">TOMAR EL CONTROL?</span>
        </h2>
        <button
            onClick={() => navigate('/login')}
            className="bg-white text-black font-gta text-2xl px-12 py-4 hover:bg-r-yellow hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
            INICIAR SESIÓN
        </button>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black py-12 border-t border-white/10 text-center">
        <p className="text-white/30 font-gta text-sm tracking-widest">© 2026 ORDINARIA CONCURRENTE. ALL RIGHTS RESERVED.</p>
      </footer>

      {/* Overlay de ruido global */}
      <div className="noise-overlay"></div>
    </div>
  );
}