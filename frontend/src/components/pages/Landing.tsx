import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, MapPin, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FACILITIES = [
  {
    id: 'padel',
    title: "ZONA PÁDEL",
    subtitle: "Competición Nocturna",
    desc: "Pistas reglamentarias con iluminación LED y césped de competición WPT.",
    stats: ["4 Jugadores", "90 Minutos", "Iluminación Pro"],
    images: [
      "https://images.unsplash.com/photo-1626224583764-847649623dbb?auto=format&fit=crop&q=80", // Placeholder
      "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 'pool',
    title: "INFINITY POOL",
    subtitle: "Oasis Urbano",
    desc: "Control de aforo digital. Agua salina climatizada y zona de solárium exclusiva.",
    stats: ["Aforo Limitado", "Agua Salina", "Chill Out"],
    images: [
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1532517891316-72a08e5c03a7?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 'gym',
    title: "IRON GYM",
    subtitle: "Alto Rendimiento",
    desc: "Equipamiento de última generación Technogym. Zona de peso libre y cardio con vistas.",
    stats: ["24 Horas", "Climatizado", "Technogym"],
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80"
    ]
  }
];

export function Landing() {
  const comp = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {

      const tl = gsap.timeline();
      tl.from(".hero-title-char", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power4.out"
      })
      .from(".hero-subtitle", {
        opacity: 0,
        y: 20,
        duration: 0.8
      }, "-=0.5");

      const sections = gsap.utils.toArray(".facility-section");

      sections.forEach((section: any) => {
        const carousel = section.querySelector(".carousel-track");
        const cards = section.querySelectorAll(".carousel-card");

        const scrollWidth = carousel.scrollWidth - window.innerWidth + 100; // +100 padding

        gsap.to(carousel, {
          x: -scrollWidth,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${scrollWidth}`,
            pin: true,
            scrub: 1, 
            invalidateOnRefresh: true,
          }
        });

        // Animación parallax interna de las imágenes
        cards.forEach((card: any) => {
           gsap.fromTo(card.querySelector("img"),
             { scale: 1.2 },
             {
               scale: 1,
               scrollTrigger: {
                 trigger: section,
                 start: "top top",
                 end: `+=${scrollWidth}`,
                 scrub: true
               }
             }
           );
        });
      });

    }, comp);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={comp} className="bg-[#050505] text-white min-h-screen selection:bg-[#FFAB00] selection:text-black overflow-x-hidden">

      {/* NAVBAR FLOTANTE */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex justify-between items-center mix-blend-difference">
        <div className="font-gta text-2xl tracking-widest">RESIDENCIAL <span className="text-[#FFAB00]">V</span></div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 border border-white/20 px-6 py-2 bg-black/50 backdrop-blur-md rounded-sm font-gta tracking-wider hover:bg-[#FFAB00] hover:text-black hover:border-[#FFAB00] transition-all duration-300"
        >
          <Lock size={16} /> ACCESO SOCIOS
        </button>
      </nav>


      <section className="relative h-screen flex flex-col justify-center px-6 md:px-24 border-b border-white/10">
        <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
            <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
                className="w-full h-full object-cover opacity-30 grayscale"
                alt="Background"
            />
        </div>

        <div className="max-w-5xl">
            <p className="hero-subtitle text-[#FFAB00] font-mono tracking-[0.3em] mb-4 text-sm md:text-base">SISTEMA INTEGRAL DE GESTIÓN</p>
            <h1 className="font-gta text-7xl md:text-[10rem] leading-[0.85] uppercase mix-blend-screen">
                <div className="overflow-hidden"><span className="hero-title-char inline-block">Control</span></div>
                <div className="overflow-hidden text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                    <span className="hero-title-char inline-block">Total</span>
                </div>
            </h1>
        </div>

        <div className="absolute bottom-12 left-6 md:left-24 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-[1px] bg-white/50"></div>
            <span className="font-mono text-xs text-white/50 tracking-widest">SCROLL TO EXPLORE</span>
        </div>
      </section>

      {/* 2. INSTALACIONES (HORIZONTAL SCROLL) */}
      <div ref={containerRef}>
        {FACILITIES.map((facility, index) => (
          <section key={facility.id} className="facility-section relative h-screen w-full overflow-hidden flex flex-col justify-center border-t border-white/10 bg-[#050505]">

            {/* Título de la sección*/}
            <div className="absolute top-24 left-6 md:left-24 z-20 max-w-sm pointer-events-none">
                <div className="flex items-center gap-2 text-[#FFAB00] mb-2">
                    <MapPin size={16} />
                    <span className="font-mono text-xs tracking-widest">INSTALACIÓN 0{index + 1}</span>
                </div>
                <h2 className="font-gta text-6xl md:text-8xl leading-none mb-6">{facility.title}</h2>
                <p className="text-white/60 text-lg leading-relaxed mb-6">{facility.desc}</p>

                <div className="flex flex-wrap gap-3">
                    {facility.stats.map(stat => (
                        <span key={stat} className="px-3 py-1 border border-white/20 text-xs font-mono uppercase tracking-wider text-white/80">
                            {stat}
                        </span>
                    ))}
                </div>
            </div>

            {/* Carrusel de Imágenes */}
            <div className="carousel-track flex gap-8 pl-[40vw] pr-24 items-center h-full">
                {facility.images.map((img, i) => (
                    <div key={i} className="carousel-card relative w-[80vw] md:w-[600px] h-[60vh] flex-shrink-0 group overflow-hidden border border-white/10 bg-[#111]">
                        <img
                            src={img}
                            alt={`${facility.title} ${i}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent