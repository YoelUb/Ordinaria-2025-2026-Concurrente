import { useEffect, useState, useRef } from 'react';
import { ArrowDown, Lock, Calendar, Shield, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/Landing.css';

export function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const feature3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      setShowNav(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const services = [
    {
      id: 1,
      title: 'Pádel Court 1',
      subtitle: 'Pista Principal',
      image: '/images/padel.jpg',
      specs: ['Iluminación LED', 'Superficie Pro', 'Vestuarios'],
      price: 'Desde 15€/hora'
    },
    {
      id: 2,
      title: 'Pádel Court 2',
      subtitle: 'Pista Secundaria',
      image: '/images/padel.jpg',
      specs: ['Iluminación LED', 'Césped Premium', 'Parking'],
      price: 'Desde 15€/hora'
    },
    {
      id: 3,
      title: 'Piscina Climatizada',
      subtitle: 'Wellness Center',
      image: '/images/piscina.jpg',
      specs: ['28°C constante', 'Sistema salino', 'Solárium'],
      price: 'Acceso incluido'
    },
    {
      id: 4,
      title: 'Gimnasio Premium',
      subtitle: 'Fitness Studio',
      image: '/images/gym.jpg',
      specs: ['24/7 Access', 'Equipamiento Pro', 'A/C'],
      price: 'Acceso incluido'
    },
    {
      id: 5,
      title: 'Sala Común',
      subtitle: 'Event Space',
      image: '/images/piscina.jpg',
      specs: ['Capacidad 50p', 'A/V System', 'Catering'],
      price: 'Bajo reserva'
    },
    {
      id: 6,
      title: 'Zona Infantil',
      subtitle: 'Kids Area',
      image: '/images/padel.jpg',
      specs: ['Supervisión', 'Juegos seguros', 'Aire libre'],
      price: 'Acceso libre'
    }
  ];

  return (
    // Añadimos la clase "landing-body" que definimos en el CSS
    <div className="landing-body">

      {/* Navegación Flotante */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="glass px-6 py-4 mx-4 mt-4 rounded-full">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">R</span>
              </div>
              <span className="font-semibold tracking-tight">RESIDENCIAL</span>
            </div>

            <div className="hidden md:flex gap-8 text-sm font-medium">
              <button onClick={() => scrollToSection('services')} className="hover:text-gray-400 transition">Servicios</button>
              <button onClick={() => scrollToSection('facilities')} className="hover:text-gray-400 transition">Instalaciones</button>
              <button onClick={() => scrollToSection('features')} className="hover:text-gray-400 transition">Beneficios</button>
            </div>

            <button
              onClick={() => window.location.href = '/login'}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
              <Lock size={16} />
              Acceder
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              transform: `scale(${1 + scrollY * 0.0003})`,
              transition: 'transform 0.1s linear'
            }}
          >
            <img
              src="/images/piscina.jpg"
              alt="Luxury Building"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />
          </div>

          <div
            className="relative z-10 text-center px-6 max-w-5xl"
            style={{
              opacity: Math.max(0, 1 - scrollY * 0.003),
              transform: `translateY(${scrollY * 0.5}px)`
            }}
          >
            <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mb-6 font-medium">
              Sistema de Gestión Comunitaria
            </p>

            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-extralight mb-8 leading-[0.9] text-glow">
              Elegancia.<br/>
              <span className="font-semibold">Simplicidad.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
              Gestiona reservas de instalaciones deportivas<br className="hidden md:block"/> con la experiencia que mereces.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-200 transition shadow-2xl"
              >
                Comenzar ahora
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="glass px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition"
              >
                Descubrir más
              </button>
            </div>
          </div>

          <button
            onClick={() => scrollToSection('services')}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
            style={{ opacity: Math.max(0, 1 - scrollY * 0.005) }}
          >
            <ArrowDown className="text-white/50" size={32} />
          </button>
        </div>
      </section>

      {/* Carrusel */}
      <section id="services" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Explora nuestras instalaciones</p>
            <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
              Todos los servicios.<br/>
              <span className="font-semibold">A tu alcance.</span>
            </h2>
          </div>

          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => scrollCarousel('left')}
              className="glass p-3 rounded-full hover:bg-white/10 transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="glass p-3 rounded-full hover:bg-white/10 transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div
            ref={carouselRef}
            className="carousel-container flex gap-6 pb-6"
          >
            {services.map((service) => (
              <div
                key={service.id}
                className="service-card glass rounded-2xl overflow-hidden min-w-[350px] md:min-w-[400px] flex-shrink-0"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs tracking-widest text-gray-400 mb-1 uppercase">{service.subtitle}</p>
                    <h3 className="text-2xl font-semibold">{service.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-2 mb-4">
                    {service.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                        {spec}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-sm font-medium text-gray-400">{service.price}</span>
                    <button
                      onClick={() => window.location.href = '/reservations'}
                      className="text-sm font-medium hover:text-gray-300 transition"
                    >
                      Reservar →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">← Desliza para ver más →</p>
          </div>
        </div>
      </section>

      {/* Feature 1: Pádel */}
      <section id="facilities" ref={feature1Ref} className="relative h-[200vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center px-6">
          <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div
              className="z-20"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollY - 1500) / 300)),
                transform: `translateX(${Math.max(-50, -50 + (scrollY - 1500) / 10)}px)`
              }}
            >
              <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Deporte Premium</p>
              <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
                Pistas de<br/>
                <span className="font-semibold">Pádel</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed font-light">
                Tres pistas profesionales con iluminación LED de última generación.
                Superficie de juego premium y sistema de reserva inteligente.
              </p>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Iluminación nocturna profesional
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  Reserva por horas o franjas
                </li>
              </ul>
            </div>

            <div
              className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl image-reveal"
              style={{
                transform: `scale(${0.8 + Math.min(0.2, (scrollY - 1500) / 1500)})`,
                opacity: Math.max(0, Math.min(1, (scrollY - 1500) / 400))
              }}
            >
              <img
                src="/images/padel.jpg"
                alt="Padel Court"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Piscina */}
      <section ref={feature2Ref} className="relative h-[200vh] bg-gradient-to-b from-black to-gray-950">
        <div className="sticky top-0 h-screen flex items-center justify-center px-6">
          <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div
              className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl image-reveal order-2 md:order-1"
              style={{
                transform: `scale(${0.8 + Math.min(0.2, (scrollY - 2500) / 1500)})`,
                opacity: Math.max(0, Math.min(1, (scrollY - 2500) / 400))
              }}
            >
              <img
                src="/images/piscina.jpg"
                alt="Pool"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>

            <div
              className="z-20 order-1 md:order-2"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollY - 2500) / 300)),
                transform: `translateX(${Math.min(50, 50 - (scrollY - 2500) / 10)}px)`
              }}
            >
              <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Wellness & Relax</p>
              <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
                Piscina<br/>
                <span className="font-semibold">Climatizada</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed font-light">
                Disfruta todo el año de nuestra piscina climatizada con tecnología
                de purificación salina y control de aforo inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Gimnasio */}
      <section ref={feature3Ref} className="relative h-[200vh] bg-gradient-to-b from-gray-950 to-black">
        <div className="sticky top-0 h-screen flex items-center justify-center px-6">
          <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
            <div
              className="z-20"
              style={{
                opacity: Math.max(0, Math.min(1, (scrollY - 3500) / 300)),
                transform: `translateX(${Math.max(-50, -50 + (scrollY - 3500) / 10)}px)`
              }}
            >
              <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Fitness & Training</p>
              <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
                Gimnasio<br/>
                <span className="font-semibold">Completo</span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed font-light">
                Equipamiento de última generación en un espacio diseñado para tu bienestar.
                Mancuernas, máquinas cardiovasculares y zona de estiramientos.
              </p>
            </div>

            <div
              className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl image-reveal"
              style={{
                transform: `scale(${0.8 + Math.min(0.2, (scrollY - 3500) / 1500)})`,
                opacity: Math.max(0, Math.min(1, (scrollY - 3500) / 400))
              }}
            >
              <img
                src="/images/gym.jpg"
                alt="Gym"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-light text-center mb-20 leading-tight">
            Diseñado para<br/>
            <span className="font-semibold">tu comodidad.</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Calendar size={32} />,
                title: 'Reserva instantánea',
                desc: 'Sistema intuitivo que permite reservar cualquier instalación en menos de 30 segundos desde tu móvil.'
              },
              {
                icon: <Shield size={32} />,
                title: 'Totalmente seguro',
                desc: 'Autenticación robusta y protección de datos con encriptación de extremo a extremo.'
              },
              {
                icon: <Clock size={32} />,
                title: 'Siempre disponible',
                desc: 'Accede y gestiona tus reservas 24/7 desde cualquier dispositivo, en cualquier lugar.'
              }
            ].map((feature, i) => (
              <div key={i} className="glass p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 group">
                <div className="text-white/70 mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="glass p-16 rounded-3xl">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div>
                <div className="text-6xl md:text-7xl font-extralight mb-4">500+</div>
                <p className="text-gray-400 text-lg font-light">Reservas mensuales</p>
              </div>
              <div>
                <div className="text-6xl md:text-7xl font-extralight mb-4">98%</div>
                <p className="text-gray-400 text-lg font-light">Tasa de satisfacción</p>
              </div>
              <div>
                <div className="text-6xl md:text-7xl font-extralight mb-4">24/7</div>
                <p className="text-gray-400 text-lg font-light">Disponibilidad total</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-32 px-6 text-center bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-light mb-8 leading-tight">
            Tu experiencia<br/>
            <span className="font-semibold">comienza aquí.</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed font-light max-w-2xl mx-auto">
            Únete a una comunidad que valora su tiempo y disfruta de instalaciones de primera clase con la mejor tecnología.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-white text-black px-12 py-5 rounded-full text-xl font-medium hover:bg-gray-200 transition shadow-2xl inline-flex items-center gap-3"
          >
            <Lock size={24} />
            Acceder al sistema
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm font-light">© 2026 Sistema Residencial. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm text-gray-500 font-light">
            <button className="hover:text-white transition">Privacidad</button>
            <button className="hover:text-white transition">Términos</button>
            <button className="hover:text-white transition">Soporte</button>
          </div>
        </div>
      </footer>
    </div>
  );
}