import {useEffect, useState, useRef} from 'react';
import {ArrowDown, Lock, Calendar, Shield, Clock, ChevronLeft, ChevronRight, Loader2, RefreshCw} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

// Interfaz para los datos que vienen del Backend
interface Facility {
    id: number;
    name: string;
    price: number;
    capacity: number;
    icon?: string;
    color?: string;
    display_order?: number; // Para mantener el orden
}

// Configuración de visualización (Imágenes y textos que no están en BD)
const FACILITY_ASSETS: { [key: string]: { image: string, subtitle: string, specs: string[] } } = {
    'Pádel Court 1': {
        image: '/images/padel_1.jpg',
        subtitle: 'Pista Principal',
        specs: ['Iluminación LED', 'Superficie Pro', 'Vestuarios']
    },
    'Pádel Court 2': {
        image: '/images/padel_2.jpg',
        subtitle: 'Pista Secundaria',
        specs: ['Iluminación LED', 'Césped Premium', 'Parking']
    },
    'Piscina': {
        image: '/images/piscina_3.jpg',
        subtitle: 'Wellness Center',
        specs: ['28°C constante', 'Sistema salino', 'Solárium']
    },
    'Gimnasio': {
        image: '/images/gym_1.jpg',
        subtitle: 'Fitness Studio',
        specs: ['24/7 Access', 'Equipamiento Pro', 'A/C']
    },
    'Sauna': {
        image: '/images/sauna.jpg',
        subtitle: 'Event Space',
        specs: ['Capacidad 10 personas', 'Audio/Video', "Termostato regulable"]
    }
};

// Constantes configurables para el polling
const POLLING_CONFIG = {
    INTERVAL: 4000, // 4 segundos
    RETRY_DELAY: 2000, // 2 segundos para reintentos
    MAX_RETRIES: 3,
    BACKOFF_MULTIPLIER: 2,
};

export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);
    const [showNav, setShowNav] = useState(false);

    // --- ESTADOS PARA DATOS DINÁMICOS ---
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [errorCount, setErrorCount] = useState(0);
    const [isPollingActive] = useState(true);
    const [previousPrices, setPreviousPrices] = useState<{ [key: number]: number }>({});
    const [priceChangeNotification, setPriceChangeNotification] = useState<{
        show: boolean;
        message: string;
        type: 'increase' | 'decrease' | 'update';
    }>({
        show: false,
        message: '',
        type: 'update'
    });

    const carouselRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<number | null>(null);
    const retryTimeoutRef = useRef<number | null>(null);
    const navigate = useNavigate();

    // --- FUNCIÓN PARA CARGAR DATOS ---
    const fetchFacilities = async (isRetry = false, isManual = false) => {
        if (!isRetry && !isManual) setLoading(true);

        try {
            const response = await fetch('http://localhost:8000/api/v1/reservations/facilities', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                cache: 'no-store'
            });

            if (response.ok) {
                const data: Facility[] = await response.json();

                // Ordenar por display_order si existe, sino por id para mantener consistencia
                const sortedData = [...data].sort((a, b) => {
                    if (a.display_order !== undefined && b.display_order !== undefined) {
                        return a.display_order - b.display_order;
                    }
                    return a.id - b.id; // Fallback: ordenar por ID
                });

                // Detectar cambios de precios
                const priceChanges: { name: string, oldPrice: number, newPrice: number }[] = [];
                const newPriceMap: { [key: number]: number } = {};

                sortedData.forEach(fac => {
                    newPriceMap[fac.id] = fac.price;
                    if (previousPrices[fac.id] && previousPrices[fac.id] !== fac.price) {
                        priceChanges.push({
                            name: fac.name,
                            oldPrice: previousPrices[fac.id],
                            newPrice: fac.price
                        });
                    }
                });

                // Actualizar estado
                setFacilities(sortedData);
                setLastUpdate(new Date());
                setErrorCount(0);

                // Actualizar referencia de precios anteriores
                setPreviousPrices(newPriceMap);

                // Mostrar notificación si hay cambios de precio
                if (priceChanges.length > 0 && !isManual) {
                    const changeType = priceChanges.some(p => p.newPrice > p.oldPrice) ? 'increase' :
                        priceChanges.some(p => p.newPrice < p.oldPrice) ? 'decrease' : 'update';

                    let message = '';
                    if (priceChanges.length === 1) {
                        const change = priceChanges[0];
                        const diff = change.newPrice - change.oldPrice;
                        const symbol = diff > 0 ? '▲' : '▼';
                        message = `${change.name}: ${change.oldPrice}€ → ${change.newPrice}€ ${symbol}`;
                    } else {
                        message = `${priceChanges.length} precios actualizados`;
                    }

                    setPriceChangeNotification({
                        show: true,
                        message,
                        type: changeType
                    });

                    // Ocultar notificación después de 5 segundos
                    setTimeout(() => {
                        setPriceChangeNotification(prev => ({...prev, show: false}));
                    }, 5000);
                }

                // Si estamos en modo retry, reactivar polling normal
                if (isRetry && isPollingActive) {
                    startPolling();
                }

                // Cache en localStorage como fallback
                try {
                    localStorage.setItem('facilities_cache', JSON.stringify(sortedData));
                    localStorage.setItem('facilities_cache_time', Date.now().toString());
                } catch (e) {
                    console.warn('No se pudo guardar en cache:', e);
                }

            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error("Error cargando instalaciones:", error);

            // Intentar usar cache como fallback
            try {
                const cached = localStorage.getItem('facilities_cache');
                const cacheTime = localStorage.getItem('facilities_cache_time');

                if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 300000) { // 5 minutos
                    console.log('Usando datos cacheados como fallback');
                    const data = JSON.parse(cached);
                    setFacilities(data);
                }
            } catch (e) {
                console.warn('No se pudo cargar cache:', e);
            }

            // Manejo de errores con backoff exponencial
            const currentErrors = errorCount + 1;
            setErrorCount(currentErrors);

            if (currentErrors <= POLLING_CONFIG.MAX_RETRIES) {
                const delay = POLLING_CONFIG.RETRY_DELAY * Math.pow(POLLING_CONFIG.BACKOFF_MULTIPLIER, currentErrors - 1);

                console.log(`Reintentando en ${delay / 1000} segundos... (Intento ${currentErrors}/${POLLING_CONFIG.MAX_RETRIES})`);

                // Limpiar timeout anterior si existe
                if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);

                // Programar reintento
                retryTimeoutRef.current = setTimeout(() => {
                    fetchFacilities(true);
                }, delay);
            } else {
                console.error(`Máximo de reintentos alcanzado (${POLLING_CONFIG.MAX_RETRIES})`);
            }
        } finally {
            if (!isRetry && !isManual) setLoading(false);
        }
    };

    // --- POLLING INTELIGENTE ---
    const startPolling = () => {
        // Limpiar intervalos anteriores
        if (pollingRef.current) clearInterval(pollingRef.current);

        pollingRef.current = setInterval(() => {
            if (document.visibilityState === 'visible' && isPollingActive) {
                fetchFacilities();
            }
        }, POLLING_CONFIG.INTERVAL);
    };

    const stopPolling = () => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    };

    // --- CARGAR DATOS INICIAL Y CONFIGURAR POLLING ---
    useEffect(() => {
        // Carga inicial
        fetchFacilities();

        // Iniciar polling
        startPolling();

        // Optimización: Pausar polling cuando la pestaña no está activa
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                stopPolling();
            } else if (isPollingActive) {
                // Al volver a la pestaña, cargar datos inmediatamente
                fetchFacilities(false, true);
                startPolling();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Limpiar al desmontar
        return () => {
            stopPolling();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

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

    // Helpers para obtener precios dinámicos en las secciones estáticas
    const getPrice = (namePart: string) => {
        const found = facilities.find(f => f.name.toLowerCase().includes(namePart.toLowerCase()));
        return found ? `${found.price}€` : 'Consultar';
    };

    // Formatear fecha de última actualización
    const formatLastUpdate = () => {
        if (!lastUpdate) return 'Nunca';

        const now = new Date();
        const diffMs = now.getTime() - lastUpdate.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffMs / 60000);

        if (diffSecs < 10) return 'Justo ahora';
        if (diffSecs < 60) return `Hace ${diffSecs} segundos`;
        if (diffMins === 1) return 'Hace 1 minuto';
        if (diffMins < 60) return `Hace ${diffMins} minutos`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return 'Hace 1 hora';
        return `Hace ${diffHours} horas`;
    };

    return (
        <div className="bg-black text-white overflow-x-hidden">
            {/* Notificación de cambios de precio */}
            {priceChangeNotification.show && (
                <div
                    className={`fixed top-24 right-4 z-50 animate-fade-in ${priceChangeNotification.type === 'increase' ? 'bg-red-500/20 border-red-500/50' : priceChangeNotification.type === 'decrease' ? 'bg-green-500/20 border-green-500/50' : 'bg-blue-500/20 border-blue-500/50'} backdrop-blur-sm px-4 py-3 rounded-lg border flex items-center gap-3 shadow-xl`}>
                    <div
                        className={`w-3 h-3 rounded-full animate-pulse ${priceChangeNotification.type === 'increase' ? 'bg-red-500' : priceChangeNotification.type === 'decrease' ? 'bg-green-500' : 'bg-blue-500'}`}/>
                    <span className="text-sm font-medium">{priceChangeNotification.message}</span>
                    <button
                        onClick={() => setPriceChangeNotification(prev => ({...prev, show: false}))}
                        className="ml-2 text-white/70 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
            )}
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
                    <div className="flex justify-between items-center mb-16">
                        <div className="text-center md:text-left">
                            <p className="text-sm tracking-[0.3em] text-gray-500 mb-4 uppercase font-medium">Explora
                                nuestras instalaciones</p>
                            <h2 className="text-5xl md:text-7xl font-light mb-6 leading-tight">Todos los servicios.<br/><span
                                className="font-semibold">A tu alcance.</span></h2>
                        </div>
                        <div className="hidden md:flex items-center gap-3 text-sm text-gray-400">
                            <div
                                className={`w-2 h-2 rounded-full ${isPollingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}/>
                            <span>Actualización cada 4s</span>
                        </div>
                    </div>

                    {loading && facilities.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-white" size={48}/>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-sm text-gray-500">
                                    {facilities.length} instalaciones disponibles • Última
                                    actualización: {formatLastUpdate()}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => scrollCarousel('left')}
                                            className="glass p-3 rounded-full hover:bg-white/10 transition cursor-pointer border border-white/10 text-white">
                                        <ChevronLeft size={24}/></button>
                                    <button onClick={() => scrollCarousel('right')}
                                            className="glass p-3 rounded-full hover:bg-white/10 transition cursor-pointer border border-white/10 text-white">
                                        <ChevronRight size={24}/></button>
                                    <button onClick={() => fetchFacilities(false, true)}
                                            className="glass p-3 rounded-full hover:bg-white/10 transition cursor-pointer border border-white/10 text-white"
                                            title="Actualizar ahora"
                                            disabled={loading}>
                                        {loading ? (
                                            <Loader2 size={24} className="animate-spin"/>
                                        ) : (
                                            <RefreshCw size={24}/>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div ref={carouselRef}
                                 className="carousel-container flex gap-6 pb-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                                {facilities.map((fac) => {
                                    const assets = FACILITY_ASSETS[fac.name] || {
                                        image: '/images/comunidad_1.jpg',
                                        subtitle: 'Instalación',
                                        specs: ['Alta calidad']
                                    };

                                    return (
                                        <div key={fac.id}
                                             className="service-card glass rounded-2xl overflow-hidden w-[300px] sm:w-[350px] md:w-[380px] flex-shrink-0 border border-white/10 group hover:border-white/30 transition-all duration-300 snap-start">
                                            {/* Badge de precio actualizado */}
                                            <div className="absolute top-4 right-4 z-10">
                                                <div
                                                    className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs flex items-center gap-1">
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${isPollingActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                                    <span className="font-medium">Precio actual</span>
                                                </div>
                                            </div>

                                            <div className="relative h-64 overflow-hidden">
                                                <img src={assets.image} alt={fac.name}
                                                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                     loading="lazy"/>
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"/>
                                                <div className="absolute bottom-4 left-4 right-4">
                                                    <p className="text-xs tracking-widest text-gray-400 mb-1 uppercase">{assets.subtitle}</p>
                                                    <h3 className="text-2xl font-semibold">{fac.name}</h3>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="space-y-2 mb-4">
                                                    {assets.specs.map((sp, i) => (
                                                        <div key={i}
                                                             className="flex items-center gap-2 text-sm text-gray-400">
                                                            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                                            {sp}
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                                        Aforo máx: {fac.capacity} pers.
                                                    </div>
                                                </div>
                                                <div
                                                    className="flex justify-between items-center pt-4 border-t border-white/10">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-400">Precio por hora</span>
                                                        <span
                                                            className="text-2xl font-bold text-white">{fac.price}€</span>
                                                    </div>
                                                    <button onClick={handleReserveAction}
                                                            className="text-sm font-medium hover:text-gray-300 transition cursor-pointer bg-transparent border-none text-white group-hover:translate-x-2 transition-transform">
                                                        Reservar →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {facilities.length === 0 && !loading && (
                                <div className="text-center py-12 glass rounded-2xl border border-white/10">
                                    <p className="text-gray-400">No hay instalaciones disponibles en este momento.</p>
                                    <button onClick={() => fetchFacilities(false, true)}
                                            className="mt-4 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition">
                                        Reintentar
                                    </button>
                                </div>
                            )}

                            <div className="text-center mt-8 flex justify-between items-center text-sm text-gray-500">
                                <p>← Desliza para ver más →</p>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* SECCIÓN PÁDEL - PRECIOS DINÁMICOS */}
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
                                    Precio desde: <span
                                    className="text-white font-semibold">{getPrice('Pádel')} / hora</span>
                                    {isPollingActive }
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

            {/* SECCIÓN PISCINA - PRECIOS DINÁMICOS */}
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
                                    Precio actual: <span className="text-white font-semibold">{getPrice('Piscina')} / sesión</span>
                                    {isPollingActive}
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

            {/* SECCIÓN GIMNASIO - PRECIOS DINÁMICOS */}
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
                                    Cuota de mantenimiento: <span
                                    className="text-white font-semibold">{getPrice('Gimnasio')} / uso</span>
                                    {isPollingActive}
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

            {/* Seccion de envio */}
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
                    <div className="flex flex-col gap-2">
                        <p className="text-gray-500 text-sm font-light">© 2026 Sistema Residencial. Todos los derechos
                            reservados.</p>
                    </div>
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

            {/* Estilos CSS adicionales */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                /* Mejoras para el carrusel */
                .carousel-container {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .carousel-container::-webkit-scrollbar {
                    display: none;
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                /* Efecto glow para texto */
                .text-glow {
                    text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                }
                
                /* Efecto glass */
                .glass {
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.05);
                }
                
                /* Snap scrolling para el carrusel */
                .snap-x {
                    scroll-snap-type: x mandatory;
                }
                .snap-mandatory {
                    scroll-snap-stop: always;
                }
                .snap-start {
                    scroll-snap-align: start;
                }
                
                /* Transiciones suaves */
                .service-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .service-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
            `}</style>
        </div>
    );
}