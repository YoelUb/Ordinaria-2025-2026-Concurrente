import {useEffect, useState, useRef} from 'react';
import {ArrowDown, Lock, Calendar, Shield, Clock, ChevronLeft, ChevronRight} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const [showNav, setShowNav] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // --- Lógica para redirección inteligente ---
    const handleReserveAction = () => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    // Scroll Detection
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrollY(window.scrollY);
                    setShowNav(window.scrollY > 400);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, {passive: true});
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
    };

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -400 : 400,
                behavior: 'smooth'
            });
        }
    };

    // --- SERVICIOS  ---
    const services = [
        {
            id: 1,
            title: 'Pádel Court 1',
            subtitle: 'Pista Principal',
            image: '/images/padel_1.jpg',
            specs: ['Iluminación LED', 'Superficie Pro', 'Vestuarios'],
            price: 'Desde 15€/hora'
        },
        {
            id: 2,
            title: 'Pádel Court 2',
            subtitle: 'Pista Secundaria',
            image: '/images/padel_2.jpg',
            specs: ['Iluminación LED', 'Césped Premium', 'Parking'],
            price: 'Desde 15€/hora'
        },
        {
            id: 3,
            title: 'Piscina Climatizada',
            subtitle: 'Wellness Center',
            image: '/images/piscina_3.jpg',
            specs: ['28°C constante', 'Sistema salino', 'Solárium'],
            price: 'Desde 8€/hora'
        },
        {
            id: 4,
            title: 'Gimnasio Premium',
            subtitle: 'Fitness Studio',
            image: '/images/gym_1.jpg',
            specs: ['24/7 Access', 'Equipamiento Pro', 'A/C'],
            price: 'Desde 5€/hora'
        },
        {
            id: 5,
            title: 'Sauna',
            subtitle: 'Event Space',
            image: '/images/sauna.jpg',
            specs: ['Capacidad 10 personas', 'Sistema de audio y video', "Termostato regulable"],
            price: 'Desde 10€/hora'
        }
    ];

    return (
        <div className="bg-black text-white overflow-x-hidden">
            <nav
                className={`fixed top-0 w-full z-50 transition-all duration-500 ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="glass px-6 py-4 mx-4 mt-4 rounded-full">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><span
                                className="text-black font-bold text-sm">R</span></div>
                            <span className="font-semibold">RESIDENCIAL</span>
                        </div>
                        <div className="hidden md:flex gap-8 text-sm font-medium">
                            <button onClick={() => scrollToSection('services')}
                                    className="hover:text-gray-400 transition bg-transparent border-none cursor-pointer text-white">Servicios
                            </button>
                            <button onClick={() => scrollToSection('facilities')}
                                    className="hover:text-gray-400 transition bg-transparent border-none cursor-pointer text-white">Instalaciones
                            </button>
                            <button onClick={() => scrollToSection('features')}
                                    className="hover:text-gray-400 transition bg-transparent border-none cursor-pointer text-white">Beneficios
                            </button>
                        </div>
                        <button onClick={handleReserveAction}
                                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition cursor-pointer border-none">
                            <Lock size={16}/>Acceder
                        </button>
                    </div>
                </div>
            </nav>

            <section className="relative h-[200vh]">
                <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0"
                         style={{transform: `scale(${1 + scrollY * 0.0003})`, transition: 'transform 0.1s linear'}}>
                        <img src="/images/comunidad_1.jpg" alt="Luxury" className="w-full h-full object-cover"
                             loading="eager"/>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80"/>
                    </div>
                    <div className="relative z-10 text-center px-6 max-w-5xl" style={{
                        opacity: Math.max(0, 1 - scrollY * 0.003),
                        transform: `translateY(${scrollY * 0.5}px)`
                    }}>
                        <p className="text-gray-400 text-sm tracking-[0.3em] uppercase mb-6 font-medium">Sistema de
                            Gestión Comunitaria</p>
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-extralight mb-8 leading-[0.9] text-glow">Elegancia.<br/><span
                            className="font-semibold">Simplicidad.</span></h1>
                        <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto mb-12 leading-relaxed">Gestiona
                            reservas de instalaciones deportivas<br className="hidden md:block"/> con la experiencia que
                            mereces.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={handleReserveAction}
                                    className="bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-200 transition shadow-2xl cursor-pointer border-none">Comenzar
                                ahora
                            </button>
                            <button onClick={() => scrollToSection('services')}
                                    className="glass px-8 py-4 rounded-full text-lg font-medium hover:bg-white/10 transition cursor-pointer text-white border border-white/10">Descubrir
                                más
                            </button>
                        </div>
                    </div>
                    <button onClick={() => scrollToSection('services')}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce bg-transparent border-none cursor-pointer"
                            style={{opacity: Math.max(0, 1 - scrollY * 0.005)}}><ArrowDown className="text-white/50"
                                                                                           size={32}/></button>
                </div>
            </section>

            <section id="services" className="py-32 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Explora
                            nuestras instalaciones</p>
                        <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">Todos los
                            servicios.<br/><span className="font-semibold">A tu alcance.</span></h2>
                    </div>
                    <div className="flex justify-end gap-3 mb-6">
                        <button onClick={() => scrollCarousel('left')}
                                className="glass p-3 rounded-full hover:bg-white/10 transition cursor-pointer border border-white/10 text-white">
                            <ChevronLeft size={24}/></button>
                        <button onClick={() => scrollCarousel('right')}
                                className="glass p-3 rounded-full hover:bg-white/10 transition cursor-pointer border border-white/10 text-white">
                            <ChevronRight size={24}/></button>
                    </div>
                    <div ref={carouselRef}
                         className="carousel-container flex gap-6 pb-6 overflow-x-auto scrollbar-hide">
                        {services.map((s) => (
                            <div key={s.id}
                                 className="service-card glass rounded-2xl overflow-hidden min-w-[350px] md:min-w-[400px] flex-shrink-0 border border-white/10">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={s.image} alt={s.title} className="w-full h-full object-cover"
                                         loading="lazy"/>
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"/>
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <p className="text-xs tracking-widest text-gray-400 mb-1 uppercase">{s.subtitle}</p>
                                        <h3 className="text-2xl font-semibold">{s.title}</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-2 mb-4">{s.specs.map((sp, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                            {sp}</div>
                                    ))}</div>
                                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                        <span className="text-sm font-medium text-gray-400">{s.price}</span>
                                        <button onClick={handleReserveAction}
                                                className="text-sm font-medium hover:text-gray-300 transition cursor-pointer bg-transparent border-none text-white">Reservar
                                            →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8"><p className="text-sm text-gray-500">← Desliza para ver más →</p>
                    </div>
                </div>
            </section>

            <section id="facilities" className="relative h-[200vh]">
                <div className="sticky top-0 h-screen flex items-center justify-center px-6">
                    <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
                        <div style={{
                            opacity: Math.max(0, Math.min(1, (scrollY - 1500) / 300)),
                            transform: `translateX(${Math.max(-50, -50 + (scrollY - 1500) / 10)}px)`
                        }}>
                            <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Deporte
                                Premium</p>
                            <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">Pistas de<br/><span
                                className="font-semibold">Pádel</span></h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed font-light">Tres pistas
                                profesionales con iluminación LED de última generación. Superficie de juego premium y
                                sistema de reserva inteligente.</p>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Iluminación nocturna profesional
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Reserva por horas o franjas
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Máximo 4 jugadores por reserva
                                </li>
                            </ul>
                        </div>
                        <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl" style={{
                            transform: `scale(${0.8 + Math.min(0.2, (scrollY - 1500) / 1500)})`,
                            opacity: Math.max(0, Math.min(1, (scrollY - 1500) / 400))
                        }}>
                            <img src="/images/padel_3.jpg" alt="Padel" className="w-full h-full object-cover"
                                 loading="lazy"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative h-[200vh] bg-gradient-to-b from-black to-gray-950">
                <div className="sticky top-0 h-screen flex items-center justify-center px-6">
                    <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
                        <div
                            className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl order-2 md:order-1"
                            style={{
                                transform: `scale(${0.8 + Math.min(0.2, (scrollY - 2500) / 1500)})`,
                                opacity: Math.max(0, Math.min(1, (scrollY - 2500) / 400))
                            }}>
                            <img src="/images/piscina_2.jpg" alt="Pool" className="w-full h-full object-cover"
                                 loading="lazy"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                        <div className="order-1 md:order-2" style={{
                            opacity: Math.max(0, Math.min(1, (scrollY - 2500) / 300)),
                            transform: `translateX(${Math.min(50, 50 - (scrollY - 2500) / 10)}px)`
                        }}>
                            <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Wellness &
                                Relax</p>
                            <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">Piscina<br/><span
                                className="font-semibold">Climatizada</span></h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed font-light">Disfruta todo el año de
                                nuestra piscina climatizada con tecnología de purificación salina y control de aforo
                                inteligente.</p>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Temperatura constante 28°C
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Sistema de purificación salina
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Reserva por turnos de 90 minutos
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section className="relative h-[200vh] bg-gradient-to-b from-gray-950 to-black">
                <div className="sticky top-0 h-screen flex items-center justify-center px-6">
                    <div className="max-w-7xl w-full grid md:grid-cols-2 gap-12 items-center">
                        <div style={{
                            opacity: Math.max(0, Math.min(1, (scrollY - 3500) / 300)),
                            transform: `translateX(${Math.max(-50, -50 + (scrollY - 3500) / 10)}px)`
                        }}>
                            <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Fitness &
                                Training</p>
                            <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">Gimnasio<br/><span
                                className="font-semibold">Completo</span></h2>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed font-light">Equipamiento de última
                                generación en un espacio diseñado para tu bienestar. Mancuernas, máquinas
                                cardiovasculares y zona de estiramientos.</p>
                            <ul className="space-y-3 text-gray-400">
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Acceso 24/7 para residentes
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Equipamiento profesional
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                    Ventilación y climatización óptima
                                </li>
                            </ul>
                        </div>
                        <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl" style={{
                            transform: `scale(${0.8 + Math.min(0.2, (scrollY - 3500) / 1500)})`,
                            opacity: Math.max(0, Math.min(1, (scrollY - 3500) / 400))
                        }}>
                            <img src="/images/gym_3.jpg" alt="Gym" className="w-full h-full object-cover"
                                 loading="lazy"/>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/*  Seccion de envio */}
            <section className="py-24 px-6 bg-gradient-to-b from-black to-gray-950">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-light mb-12">¿Cómo hago la reserva?</h2>

                    {/* Contenedor del Vídeo con Efecto Glass */}
                    <div
                        className="relative aspect-video w-full rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl group">
                        <video className="w-full h-full relative z-20" controls>
                            <source src="/videos/video.mp4" type="video/mp4"/>
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>

                    <p className="mt-8 text-gray-400 font-light text-lg">Descubre lo sencillo que es empezar a disfrutar
                        de tus instalaciones.</p>
                </div>
            </section>

            <section id="features" className="py-32 px-6 bg-black">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-light text-center mb-20 leading-tight">Diseñado
                        para<br/><span className="font-semibold">tu comodidad.</span></h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Calendar size={32}/>,
                                title: 'Reserva instantánea',
                                desc: 'Sistema intuitivo que permite reservar cualquier instalación en menos de 30 segundos desde tu móvil.'
                            },
                            {
                                icon: <Shield size={32}/>,
                                title: 'Totalmente seguro',
                                desc: 'Autenticación robusta y protección de datos con encriptación de extremo a extremo.'
                            },
                            {
                                icon: <Clock size={32}/>,
                                title: 'Siempre disponible',
                                desc: 'Accede y gestiona tus reservas 24/7 desde cualquier dispositivo, en cualquier lugar.'
                            }
                        ].map((f, i) => (
                            <div key={i}
                                 className="glass p-10 rounded-3xl hover:bg-white/10 transition-all duration-500 group border border-white/10">
                                <div
                                    className="text-white/70 mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                                <h3 className="text-2xl font-semibold mb-4">{f.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-950">
                <div className="max-w-7xl mx-auto">
                    <div className="glass p-16 rounded-3xl border border-white/10">
                        <div className="grid md:grid-cols-3 gap-12 text-center">
                            <div>
                                <div className="text-6xl md:text-7xl font-extralight mb-4">500+</div>
                                <p className="text-gray-400 text-lg font-light">Reservas mensuales</p></div>
                            <div>
                                <div className="text-6xl md:text-7xl font-extralight mb-4">98%</div>
                                <p className="text-gray-400 text-lg font-light">Tasa de satisfacción</p></div>
                            <div>
                                <div className="text-6xl md:text-7xl font-extralight mb-4">24/7</div>
                                <p className="text-gray-400 text-lg font-light">Disponibilidad total</p></div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="cta" className="py-32 px-6 text-center bg-gradient-to-b from-gray-950 to-black">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-light mb-8 leading-tight">Tu experiencia<br/><span
                        className="font-semibold">comienza aquí.</span></h2>
                    <p className="text-xl text-gray-400 mb-12 leading-relaxed font-light max-w-2xl mx-auto">Únete a una
                        comunidad que valora su tiempo y disfruta de instalaciones de primera clase.</p>
                    <button onClick={handleReserveAction}
                            className="bg-white text-black px-12 py-5 rounded-full text-xl font-medium hover:bg-gray-200 transition shadow-2xl inline-flex items-center gap-3 cursor-pointer border-none">
                        <Lock size={24}/>Acceder al sistema
                    </button>
                </div>
            </section>

            <footer className="border-t border-white/10 py-12 px-6 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm font-light">© 2026 Sistema Residencial. Todos los derechos
                        reservados.</p>
                    <div className="flex gap-6 text-sm text-gray-500 font-light">
                        <button onClick={() => window.location.href = '/privacy'}
                                className="hover:text-white transition bg-transparent border-none cursor-pointer text-gray-500">Privacidad
                        </button>
                        <button onClick={() => window.location.href = '/terms'}
                                className="hover:text-white transition bg-transparent border-none cursor-pointer text-gray-500">Términos
                        </button>
                        <button onClick={() => window.location.href = '/support'}
                                className="hover:text-white transition bg-transparent border-none cursor-pointer text-gray-500">Soporte
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}