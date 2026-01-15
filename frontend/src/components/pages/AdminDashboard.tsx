import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, Users, Calendar, DollarSign, Settings, LogOut,
    Eye, Trash2, Search, Home, Activity, X, Shield, Loader2, Edit, Save
} from 'lucide-react';

// --- Interfaces ---
interface UserData {
    id: number;
    full_name: string;
    email: string;
    apartment: string;
    phone?: string;
    role: string;
    is_active: boolean;
    created_at: string;
    avatar_url?: string;
}

interface ReservationData {
    id: number;
    facility: string;
    start_time: string;
    end_time: string;
    price: number;
    user_id: number;
    user?: { full_name: string; email: string };
    status?: string;
}

interface AdminStats {
    total_reservations: number;
    total_earnings: number;
    popular_facility: string;
}

interface Facility {
    id: number;
    name: string;
    price: number;
    capacity: number;
    icon?: string;
    color?: string;
}

interface DashboardFacility extends Facility {
    revenue: number;
    bookings: number;
    occupancy: number;
    type: string;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Estados de datos CON VALORES POR DEFECTO
    const [users, setUsers] = useState<UserData[]>([]);
    const [reservations, setReservations] = useState<ReservationData[]>([]);
    const [facilities, setFacilities] = useState<DashboardFacility[]>([]);
    const [backendStats, setBackendStats] = useState<AdminStats>({
        total_reservations: 0,
        total_earnings: 0,
        popular_facility: 'N/A'
    });

    // Estado para la hora de la última actualización (Visual)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Estado de carga (Solo para la primera vez)
    const [loading, setLoading] = useState(true);
    const [updatingFacility, setUpdatingFacility] = useState(false);

    // Modales y UI
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [editForm, setEditForm] = useState({price: 0, capacity: 0});

    // --- FUNCIÓN PURA DE OBTENCIÓN DE DATOS CON MANEJO ROBUSTO DE ERRORES ---
    const fetchAllData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const headers = {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'};

        try {
            // Peticiones en paralelo con timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

            const [statsRes, usersRes, resRes, facRes] = await Promise.allSettled([
                fetch('http://localhost:8000/api/v1/reservations/stats', {headers, signal: controller.signal}),
                fetch('http://localhost:8000/api/v1/users', {headers, signal: controller.signal}),
                fetch('http://localhost:8000/api/v1/reservations', {headers, signal: controller.signal}),
                fetch('http://localhost:8000/api/v1/reservations/facilities', {headers, signal: controller.signal})
            ]);

            clearTimeout(timeoutId);

            // Procesamos Stats con validación robusta
            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                try {
                    const statsData = await statsRes.value.json();
                    setBackendStats({
                        total_reservations: statsData.total_reservations || 0,
                        total_earnings: Number(statsData.total_earnings) || 0,
                        popular_facility: statsData.popular_facility || 'N/A'
                    });
                } catch (error) {
                    console.warn("Error procesando estadísticas:", error);
                    // Mantener valores por defecto
                }
            }

            // Procesamos Usuarios con validación robusta
            if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                try {
                    const usersData = await usersRes.value.json();
                    // FILTRAR elementos null/undefined y asegurar estructura
                    const validUsers = (Array.isArray(usersData) ? usersData : [])
                        .filter(user => user != null && typeof user === 'object')
                        .map(user => ({
                            id: Number(user.id) || 0,
                            full_name: String(user.full_name || 'Usuario Sin Nombre'),
                            email: String(user.email || ''),
                            apartment: String(user.apartment || 'N/A'),
                            phone: user.phone ? String(user.phone) : undefined,
                            role: String(user.role || 'user'),
                            is_active: Boolean(user.is_active),
                            created_at: String(user.created_at || new Date().toISOString()),
                            avatar_url: user.avatar_url ? String(user.avatar_url) : undefined
                        }));
                    setUsers(validUsers);
                } catch (error) {
                    console.warn("Error procesando usuarios:", error);
                    setUsers([]);
                }
            }

            // Procesamos Reservas con validación robusta
            let reservationsData: ReservationData[] = [];
            if (resRes.status === 'fulfilled' && resRes.value.ok) {
                try {
                    const rawReservations = await resRes.value.json();
                    // FILTRAR elementos null/undefined y asegurar estructura
                    const validReservations = (Array.isArray(rawReservations) ? rawReservations : [])
                        .filter(res => res != null && typeof res === 'object')
                        .map(res => ({
                            id: Number(res.id) || 0,
                            facility: String(res.facility || 'Instalación Desconocida'),
                            start_time: String(res.start_time || new Date().toISOString()),
                            end_time: String(res.end_time || new Date().toISOString()),
                            price: Number(res.price) || 0,
                            user_id: Number(res.user_id) || 0,
                            user: res.user && typeof res.user === 'object' ? {
                                full_name: String(res.user.full_name || 'Usuario'),
                                email: String(res.user.email || '')
                            } : undefined,
                            status: res.status ? String(res.status) : undefined
                        }));
                    reservationsData = validReservations;
                    setReservations(validReservations);
                } catch (error) {
                    console.warn("Error procesando reservas:", error);
                    setReservations([]);
                }
            }

            // Procesamos Instalaciones con validación robusta
            if (facRes.status === 'fulfilled' && facRes.value.ok) {
                try {
                    const rawFacilities = await facRes.value.json();
                    // FILTRAR elementos null/undefined y asegurar estructura
                    const validRawFacilities = (Array.isArray(rawFacilities) ? rawFacilities : [])
                        .filter(fac => fac != null && typeof fac === 'object');

                    const processedFacilities = validRawFacilities.map(fac => {
                        const facReservations = reservationsData.filter(r =>
                            r && r.facility === fac.name
                        );
                        const revenue = facReservations.reduce((acc, curr) =>
                            acc + (Number(curr?.price) || 0), 0
                        );
                        const bookings = facReservations.length;

                        let type = 'General';
                        const name = String(fac.name || '');
                        if (name.includes('Pádel') || name.includes('Gimnasio')) type = 'Deportiva';
                        else if (name.includes('Piscina') || name.includes('Sauna')) type = 'Wellness';
                        else if (name.includes('Sala')) type = 'Social';

                        return {
                            id: Number(fac.id) || 0,
                            name: name,
                            price: Number(fac.price) || 0,
                            capacity: Number(fac.capacity) || 0,
                            icon: fac.icon ? String(fac.icon) : undefined,
                            color: fac.color ? String(fac.color) : undefined,
                            revenue: revenue,
                            bookings: bookings,
                            type: type,
                            occupancy: Math.min(100, Math.round(bookings * 2))
                        };
                    });
                    setFacilities(processedFacilities);
                } catch (error) {
                    console.warn("Error procesando instalaciones:", error);
                    setFacilities([]);
                }
            }

            // Actualizamos la hora para dar feedback visual de que el polling funciona
            setLastUpdated(new Date());

        } catch (error) {
            console.error("Error en polling:", error);
            // No mostrar error al usuario para no interrumpir la experiencia
        }
    }, [navigate]);

    // --- EFFECT: LÓGICA DE CARGA E INTERVALO ---
    useEffect(() => {
        let isMounted = true;

        const initLoad = async () => {
            setLoading(true); // Pantalla negra SOLO al entrar
            await fetchAllData();
            if (isMounted) setLoading(false); // Se quita y no vuelve
        };

        // 1. Carga inicial
        initLoad();

        // 2. Intervalo cada 4 segundos
        const intervalId = setInterval(() => {
            fetchAllData(); // Esto ya NO activa el loading, solo refresca datos y hora
        }, 4000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [fetchAllData]);

    // --- Funciones auxiliares ROBUSTAS ---
    const filteredUsers = users.filter(user => {
        if (!user) return false;
        const name = String(user.full_name || '').toLowerCase();
        const email = String(user.email || '').toLowerCase();
        const apartment = String(user.apartment || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query) || apartment.includes(query);
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                method: 'DELETE',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                setShowUserModal(false);
                toast.success("Usuario eliminado");
            } else {
                toast.error("Error al eliminar");
            }
        } catch (e) {
            toast.error("Error de conexión");
        }
    };

    const handleEditFacility = (facility: Facility) => {
        if (!facility) return;
        setEditingFacility(facility);
        setEditForm({
            price: Number(facility.price) || 0,
            capacity: Number(facility.capacity) || 0
        });
    };

    const handleSaveFacility = async () => {
        if (!editingFacility) return;
        setUpdatingFacility(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/api/v1/reservations/facilities/${editingFacility.id}?price=${editForm.price}&capacity=${editForm.capacity}`, {
                method: 'PUT',
                headers: {'Authorization': `Bearer ${token}`}
            });
            if (response.ok) {
                toast.success(`Actualizado correctamente`);
                setEditingFacility(null);
                fetchAllData();
            } else {
                throw new Error("Error");
            }
        } catch (error) {
            toast.error("Error al guardar");
        } finally {
            setUpdatingFacility(false);
        }
    };

    // Funciones de formato ROBUSTAS
    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    const formatTime = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Hora inválida';
            return date.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'});
        } catch {
            return 'Hora inválida';
        }
    };

    // Función para formatear números de forma segura
    const safeNumber = (value: any, defaultValue: number = 0): number => {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
    };

    // Función para formatear moneda de forma segura
    const safeCurrency = (value: any): string => {
        const num = safeNumber(value, 0);
        return `${num.toFixed(2)}€`;
    };

    // --- RENDER ---
    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Loader2 className="animate-spin text-purple-500" size={48}/>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Inter', sans-serif; }
                .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
            `}</style>

            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/10 p-6 z-50">
                <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Shield size={20} className="text-white"/>
                    </div>
                    <div>
                        <span className="font-semibold text-lg">ADMIN</span>
                        <p className="text-xs text-gray-500">Panel de Control</p>
                    </div>
                </div>

                <nav className="space-y-2 mb-12">
                    {[
                        {id: 'overview', icon: <LayoutDashboard size={20}/>, label: 'Panel General'},
                        {id: 'users', icon: <Users size={20}/>, label: 'Usuarios'},
                        {id: 'reservations', icon: <Calendar size={20}/>, label: 'Reservas'},
                        {id: 'facilities', icon: <Home size={20}/>, label: 'Instalaciones'},
                        {id: 'revenue', icon: <DollarSign size={20}/>, label: 'Ingresos'},
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                activeTab === item.id
                                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer">
                        <LogOut size={20}/>
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-72 p-8">
                {/* Header con Indicador de Polling */}
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-light mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {activeTab === 'overview' && 'Panel General'}
                            {activeTab === 'users' && 'Gestión de Usuarios'}
                            {activeTab === 'reservations' && 'Gestión de Reservas'}
                            {activeTab === 'facilities' && 'Gestión de Instalaciones'}
                            {activeTab === 'revenue' && 'Reporte de Ingresos'}
                            {activeTab === 'settings' && 'Configuración'}
                        </h1>
                        <p className="text-gray-400">
                            {new Date().toLocaleDateString('es-ES', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
                        </p>
                    </div>

                    {/* INDICADOR DE STATUS EN VIVO */}
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Estado: En línea</p>
                            <p className="text-xs text-white font-mono">
                                Actualizado: {lastUpdated.toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}
                            </p>
                        </div>
                    </div>
                </header>

                {/* CONTENIDO DE LAS PESTAÑAS */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="glass p-6 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <Users className="text-blue-400" size={24}/>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Total Usuarios</p>
                                <p className="text-3xl font-light">{users.length}</p>
                            </div>
                            <div className="glass p-6 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <Calendar className="text-green-400" size={24}/>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Reservas Totales</p>
                                <p className="text-3xl font-light">{backendStats?.total_reservations || 0}</p>
                            </div>
                            <div className="glass p-6 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <DollarSign className="text-purple-400" size={24}/>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Ingresos Totales</p>
                                <p className="text-3xl font-light">{safeCurrency(backendStats?.total_earnings)}</p>
                            </div>
                             <div className="glass p-6 rounded-2xl border border-white/10">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <Activity className="text-orange-400" size={24}/>
                                </div>
                                <p className="text-gray-400 text-sm mb-1">Más Popular</p>
                                <p className="text-lg font-light truncate">{backendStats?.popular_facility || 'N/A'}</p>
                            </div>
                        </div>

                         <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 glass p-8 rounded-2xl border border-white/10">
                                <h2 className="text-2xl font-light mb-6">Últimas Reservas</h2>
                                <div className="space-y-3">
                                    {Array.isArray(reservations) && reservations
                                        .filter(res => res != null) // Filtro defensivo
                                        .slice(0, 5)
                                        .map((res) => (
                                        <div key={res.id || `res-${Math.random()}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                                                    <Calendar size={16}/>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{res.user ? res.user.full_name : `Usuario #${res.user_id}`}</p>
                                                    <p className="text-sm text-gray-400">{res.facility} • {formatDate(res.start_time)} {formatTime(res.start_time)}</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-medium">{safeCurrency(res.price)}</span>
                                        </div>
                                    ))}
                                    {(!reservations || reservations.length === 0) && (
                                        <p className="text-gray-500 text-center">No hay reservas recientes.</p>
                                    )}
                                </div>
                            </div>
                            <div className="glass p-8 rounded-2xl border border-white/10">
                                <h2 className="text-2xl font-light mb-6">Ingresos por Pista</h2>
                                <div className="space-y-4">
                                    {Array.isArray(facilities) && facilities
                                        .filter(fac => fac != null) // Filtro defensivo
                                        .map((fac) => {
                                            const revenue = safeNumber(fac.revenue);
                                            const totalEarnings = safeNumber(backendStats?.total_earnings);
                                            const percentage = totalEarnings > 0 ? (revenue / totalEarnings) * 100 : 0;

                                            return (
                                                <div key={fac.id || `fac-${Math.random()}`}>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-sm font-medium">{fac.name || 'Instalación'}</span>
                                                        <span className="text-sm text-gray-400">{safeCurrency(revenue)}</span>
                                                    </div>
                                                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
                                                            style={{width: `${Math.min(100, percentage)}%`}}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    {(!facilities || facilities.length === 0) && (
                                        <p className="text-gray-500 text-center">No hay datos de instalaciones.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                     <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                                <input
                                    type="text"
                                    placeholder="Buscar usuarios..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white focus:outline-none border border-white/10"
                                />
                            </div>
                        </div>
                        <div className="glass rounded-2xl overflow-hidden border border-white/10">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-sm text-gray-400">Usuario</th>
                                    <th className="text-left p-4 text-sm text-gray-400">Email</th>
                                    <th className="text-left p-4 text-sm text-gray-400">Rol</th>
                                    <th className="text-left p-4 text-sm text-gray-400">Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Array.isArray(filteredUsers) && filteredUsers
                                    .filter(user => user != null) // Filtro defensivo adicional
                                    .map((user) => (
                                    <tr key={user.id || `user-${Math.random()}`} className="border-b border-white/5 hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url ? (
                                                    <img
                                                        src={user.avatar_url}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        alt={user.full_name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                        }}
                                                    />
                                                ) : null}
                                                <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold ${user.avatar_url ? 'hidden' : ''}`}>
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{user.full_name || 'Usuario'}</p>
                                                    <p className="text-xs text-gray-500">{user.apartment || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">{user.email || 'N/A'}</td>
                                        <td className="p-4 uppercase text-sm">{user.role || 'user'}</td>
                                        <td className="p-4 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                            >
                                                <Eye size={18}/>
                                            </button>
                                            <button
                                                onClick={() => user.id && handleDeleteUser(user.id)}
                                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!filteredUsers || filteredUsers.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            {searchQuery ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'reservations' && (
                    <div className="space-y-4">
                        {Array.isArray(reservations) && reservations
                            .filter(res => res != null) // Filtro defensivo
                            .map((res) => (
                            <div key={res.id || `reservation-${Math.random()}`} className="glass p-6 rounded-2xl flex justify-between items-center border border-white/10 hover:bg-white/5 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                                        <Calendar size={20}/>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-lg">{res.facility || 'Reserva'}</h3>
                                        <p className="text-sm text-gray-400">
                                            {res.user?.full_name || `Usuario #${res.user_id}`} • {formatDate(res.start_time)} {formatTime(res.start_time)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-xl">{safeCurrency(res.price)}</span>
                                    <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                                        {res.status === 'cancelled' ? 'Cancelada' : 'Confirmada'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {(!reservations || reservations.length === 0) && (
                            <div className="glass p-8 rounded-2xl border border-white/10 text-center">
                                <p className="text-gray-500">No hay reservas para mostrar.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'facilities' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(facilities) && facilities
                            .filter(fac => fac != null) // Filtro defensivo
                            .map((fac) => (
                            <div key={fac.id || `facility-${Math.random()}`} className="glass p-6 rounded-2xl border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-medium">{fac.name || 'Instalación'}</h3>
                                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{fac.type || 'General'}</span>
                                </div>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Precio hora</span>
                                        <span className="font-bold">{safeNumber(fac.price)}€</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Aforo máx</span>
                                        <span className="font-bold">{safeNumber(fac.capacity)} pers.</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1 rounded-full mt-2">
                                        <div
                                            className="bg-blue-500 h-1 rounded-full"
                                            style={{width: `${Math.min(100, safeNumber(fac.occupancy))}%`}}
                                        ></div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleEditFacility(fac)}
                                    className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"
                                >
                                    <Edit size={16}/> Gestionar
                                </button>
                            </div>
                        ))}
                        {(!facilities || facilities.length === 0) && (
                            <div className="md:col-span-2 lg:col-span-3 glass p-8 rounded-2xl border border-white/10 text-center">
                                <p className="text-gray-500">No hay instalaciones disponibles.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'revenue' && (
                    <div className="glass p-8 rounded-2xl border border-white/10">
                        <h2 className="text-2xl font-light mb-6">Detalle de Ingresos</h2>
                        <div className="space-y-2">
                            {Array.isArray(facilities) && facilities
                                .filter(fac => fac != null && safeNumber(fac.revenue) > 0)
                                .map(fac => (
                                <div key={fac.id || `revenue-${Math.random()}`} className="flex justify-between py-4 border-b border-white/5 items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                            <DollarSign size={14}/>
                                        </div>
                                        <span>{fac.name || 'Instalación'}</span>
                                    </div>
                                    <span className="text-xl font-light">{safeCurrency(fac.revenue)}</span>
                                </div>
                            ))}
                            {(!facilities || facilities.filter(f => safeNumber(f?.revenue) > 0).length === 0) && (
                                <p className="text-gray-500 text-center py-8">No hay ingresos registrados.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="glass p-8 rounded-2xl border border-white/10 text-center py-20">
                        <Settings size={64} className="mx-auto mb-6 text-gray-700"/>
                        <h3 className="text-xl font-medium mb-2">Configuración del Sistema</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Para gestionar precios y aforos, por favor dirígete a la pestaña de "Instalaciones".</p>
                    </div>
                )}
            </main>

            {/* Modales */}
            {editingFacility && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
                    <div className="glass p-8 rounded-3xl max-w-md w-full border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-medium">Editar {editingFacility.name}</h2>
                            <button onClick={() => setEditingFacility(null)}><X size={20} className="text-gray-500"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Precio (€/hora)</label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={e => setEditForm({...editForm, price: safeNumber(e.target.value, 0)})}
                                    className="w-full p-3 glass rounded-xl text-white outline-none focus:border-blue-500 border border-white/10"
                                    min="0"
                                    step="0.5"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setEditingFacility(null)} className="px-5 py-2.5 glass rounded-xl text-sm hover:bg-white/10 transition">Cancelar</button>
                            <button onClick={handleSaveFacility} disabled={updatingFacility} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition">
                                {updatingFacility ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}

             {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="glass p-8 rounded-3xl max-w-lg w-full border border-white/10">
                        <div className="flex justify-between items-center mb-6">
                             <h2 className="text-2xl font-light">Ficha de Usuario</h2>
                             <button onClick={() => setShowUserModal(false)}><X size={24} className="text-gray-500"/></button>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
                                {selectedUser.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-medium">{selectedUser.full_name || 'Usuario'}</h3>
                                <p className="text-gray-400">{selectedUser.email || 'Sin email'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase mb-1">Apartamento</p>
                                <p className="font-medium">{selectedUser.apartment || 'N/A'}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase mb-1">Rol</p>
                                <p className="font-medium uppercase">{selectedUser.role || 'user'}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase mb-1">Estado</p>
                                <p className={`font-medium ${selectedUser.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                    {selectedUser.is_active ? 'Activo' : 'Bloqueado'}
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl">
                                <p className="text-xs text-gray-500 uppercase mb-1">Miembro desde</p>
                                <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button onClick={() => setShowUserModal(false)} className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}