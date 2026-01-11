import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FACILITIES = [
    {
        id: 'padel',
        category: "SPORT & WELLNESS",
        title: "The Padel Club",
        subtitle: "Competición de Alto Nivel",
        desc: "Pistas panorámicas de cristal con iluminación técnica nocturna. Un espacio diseñado para el rendimiento deportivo en un entorno exclusivo.",
        stats: ["Reserva Digital", "Acceso Biométrico", "Torneos"],
        images: [
            "/images/comunidad_1.jpg",
            "/images/comunidad_2.jpg",
            "/images/comunidad_3.jpg"
        ]
    },
    {
        id: 'pool',
        category: "RELAXATION",
        title: "Infinity Wellness",
        subtitle: "Oasis Urbano",
        desc: "Piscina climatizada con tecnología de purificación salina. Solárium privado y control de aforo en tiempo real para garantizar tu tranquilidad.",
        stats: ["Climatizada", "Agua Salina", "Solárium"],
        images: [
            "/images/comunidad_4.jpg",
            "/images/comunidad_4.jpg",
            "/images/comunidad_4.jpg"
        ]
    },
    {
        id: 'gym',
        category: "PERFORMANCE",
        title: "Fitness Studio",
        subtitle: "Entrenamiento Inteligente",
        desc: "Equipamiento Technogym de última generación conectado a la nube. Espacios diáfanos con luz natural y monitorización de calidad del aire.",
        stats: ["24/7 Access", "Technogym", "Yoga Zone"],
        images: [
            "/images/gym_1.jpg",
            "/images/gym_2.jpg",
            "/images/gym_3.jpg"
        ]
    }
];

export function Landing() {
    const comp = useRef(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // HERO ANIMATIONS
            const tl = gsap.timeline();
            tl.from(".hero-text-reveal", {
                y: 100,
                opacity: 0,
                duration: 1.5,
                stagger: 0.1,
                ease: "power3.out"
            })
            .from(".hero-sub", {
                opacity: 0,
                y: 20,
                duration: 1,
                ease: "power2.out"
            }, "-=1");

            // SCROLLYTELLING
            const sections = gsap.utils.toArray(".facility-section");

            sections.forEach((section: any) => {
                const carousel = section.querySelector(".carousel-track");
                const images = section.querySelectorAll(".parallax-img");

                // Cálculo del ancho total para el scroll horizontal
                const scrollWidth = carousel.scrollWidth - window.innerWidth + 150;

                gsap.to(carousel, {
                    x: -scrollWidth,
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top top",
                        end: () => `+=${scrollWidth + 1000}`,
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                });

                // Parallax suave dentro de las cartas
                images.forEach((img: any) => {
                    gsap.fromTo(img,
                        {scale: 1.1, x: 20},
                        {
                            scale: 1,
                            x: -20,
                            scrollTrigger: {
                                trigger: section,
                                start: "top top",
                                end: `+=${scrollWidth + 1000}`,
                                scrub: 1
                            }
                        }
                    );
                });
            });

        }, comp);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={comp} className="bg-black text-slate-200 min-h-screen selection:bg-white/20 selection:text-white overflow-x-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
                .font-luxury { font-family: 'Playfair Display', serif; }
                .font-sans-clean { font-family: 'Inter', sans-serif; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* NAVBAR */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xl border-b border-white/5"/>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white text-black flex items-center justify-center rounded-full">
                        <span className="font-luxury font-bold text-lg">V</span>
                    </div>
                    <span className="font-sans-clean text-sm tracking-widest font-medium text-white/90">RESIDENCIAL</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="relative z-10 group flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white text-white hover:text-black backdrop-blur-md rounded-full border border-white/10 transition-all duration-300 font-sans-clean text-xs tracking-wide font-medium"
                >
                    <Lock size={14} className="group-hover:scale-90 transition-transform"/>
                    AREA CLIENTES
                </button>
            </nav>

            {/* HERO SECTION */}
            <section className="relative h-screen w-full flex flex-col justify-center px-6 md:px-24">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black"/>
                    <img
                        src="https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80"
                        className="w-full h-full object-cover opacity-60"
                        alt="Luxury Architecture"
                    />
                </div>

                <div className="max-w-4xl pt-20">
                    <div className="hero-sub flex items-center gap-3 mb-6">
                        <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
                        <span className="text-[#D4AF37] font-sans-clean text-xs tracking-[0.2em] uppercase">Premium Living</span>
                    </div>

                    <h1 className="font-luxury text-6xl md:text-8xl lg:text-9xl leading-[1.1] text-white mix-blend-overlay opacity-90">
                        <div className="overflow-hidden"><span className="hero-text-reveal inline-block">Beyond</span></div>
                        <div className="overflow-hidden"><span className="hero-text-reveal inline-block italic font-light">Expectation.</span></div>
                    </h1>

                    <p className="hero-sub mt-8 max-w-lg text-lg text-white/70 font-sans-clean font-light leading-relaxed">
                        Una experiencia residencial redefinida. Gestión integral, instalaciones de vanguardia y
                        servicios exclusivos en una sola plataforma.
                    </p>
                </div>

                <div className="absolute bottom-12 left-0 w-full flex justify-center">
                    <div className="animate-bounce text-white/30">
                        <ArrowRight className="rotate-90" size={20}/>
                    </div>
                </div>
            </section>

            <div ref={containerRef} className="bg-black">
                {FACILITIES.map((facility) => (
                    <section key={facility.id} className="facility-section relative h-screen w-full overflow-hidden flex flex-col justify-center bg-black border-t border-white/5">

                        {/* Texto Fijo Izquierda */}
                        <div className="absolute top-32 left-6 md:left-24 z-20 max-w-md pointer-events-none mix-blend-difference">
                            <span className="font-sans-clean text-[#D4AF37] text-xs tracking-[0.3em] uppercase mb-4 block">
                                {facility.category}
                            </span>
                            <h2 className="font-luxury text-5xl md:text-7xl mb-6 text-white leading-tight">
                                {facility.title}
                            </h2>
                            <p className="text-white/70 font-sans-clean font-light text-base leading-relaxed mb-8 border-l border-white/20 pl-6">
                                {facility.desc}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {facility.stats.map(stat => (
                                    <div key={stat} className="flex items-center gap-2 text-white/60">
                                        <Sparkles size={12} className="text-[#D4AF37]"/>
                                        <span className="font-sans-clean text-xs uppercase tracking-widest">{stat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Carrusel de Imágenes */}
                        <div className="carousel-track flex gap-12 pl-[45vw] pr-24 items-center h-full">
                            {facility.images.map((img, i) => (
                                <div key={i} className="carousel-card relative w-[75vw] md:w-[500px] aspect-[4/5] flex-shrink-0 group rounded-sm overflow-hidden">
                                    <div className="absolute inset-0 overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`${facility.title} ${i}`}
                                            className="parallax-img w-full h-full object-cover transition-transform duration-1000"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"/>
                                    <div className="absolute bottom-6 right-6 font-sans-clean text-xs text-white/50 tracking-widest">
                                        0{i + 1}
                                    </div>
                                </div>
                            ))}

                            {/* Card Final */}
                            <div className="carousel-card relative w-[300px] h-[400px] flex-shrink-0 flex items-center justify-center border border-white/10 rounded-sm hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="text-center p-8">
                                    <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] group-hover:text-black transition-all">
                                        <ArrowRight size={20}/>
                                    </div>
                                    <p className="font-luxury text-xl mb-2">Explorar más</p>
                                    <p className="font-sans-clean text-xs text-white/50">Ver disponibilidad</p>
                                </div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>

            {/* FOOTER */}
            <footer className="py-24 bg-black border-t border-white/10 flex flex-col items-center justify-center text-center px-6">
                <h3 className="font-luxury text-4xl mb-6">Experience the exceptional.</h3>
                <button
                    onClick={() => navigate('/login')}
                    className="px-8 py-4 bg-white text-black rounded-full font-sans-clean text-sm font-medium hover:bg-[#D4AF37] hover:text-white transition-colors duration-300"
                >
                    Acceder a la Plataforma
                </button>
                <p className="mt-12 text-white/20 text-xs font-sans-clean tracking-widest uppercase">
                    © 2026 Residencial Management System
                </p>
            </footer>
        </div>
    );
}