import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    LayoutDashboard, Users, Calendar, DollarSign, LogOut,
    Eye, Trash2, Search, Home, Activity, X, Shield, Loader2, Edit,
    Menu, ChevronRight, ChevronLeft
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

    // Estados de UI
    const [sidebarOpen, setSidebarOpen] = useState(false); // Para móvil
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Para escritorio

    // Estados de datos
    const [users, setUsers] = useState<UserData[]>([]);
    const [reservations, setReservations] = useState<ReservationData[]>([]);
    const [facilities, setFacilities] = useState<DashboardFacility[]>([]);
    const [backendStats, setBackendStats] = useState<AdminStats>({
        total_reservations: 0,
        total_earnings: 0,
        popular_facility: 'N/A'
    });

    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [updatingFacility, setUpdatingFacility] = useState(false);

    // Modales y Formularios
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
    const [editForm, setEditForm] = useState({ price: 0, capacity: 0 });

    // Logica de datos
    const fetchAllData = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const [statsRes, usersRes, resRes, facRes] = await Promise.allSettled([
                fetch('http://localhost:8000/api/v1/reservations/stats', { headers, signal: controller.signal }),
                fetch('http://localhost:8000/api/v1/users', { headers, signal: controller.signal }),
                fetch('http://localhost:8000/api/v1/reservations', { headers, signal: controller.signal }),
                fetch('http://localhost:8000/api/v1/reservations/facilities', { headers, signal: controller.signal })
            ]);

            clearTimeout(timeoutId);

            let computedStats: AdminStats = {
                total_reservations: 0,
                total_earnings: 0,
                popular_facility: 'N/A'
            };

            // Stats Backend
            if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
                try {
                    const d = await statsRes.value.json();
                    computedStats = {
                        total_reservations: d.total_reservations || 0,
                        total_earnings: Number(d.total_earnings) || 0,
                        popular_facility: d.popular_facility || 'N/A'
                    };
                } catch (e) { console.warn(e); }
            }

            // Usuarios
            if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
                try {
                    const d = await usersRes.value.json();
                    const validUsers = (Array.isArray(d) ? d : []).map(u => ({
                        id: Number(u.id),
                        full_name: String(u.full_name || 'Usuario'),
                        email: String(u.email || ''),
                        apartment: String(u.apartment || 'N/A'),
                        role: String(u.role || 'user'),
                        is_active: Boolean(u.is_active),
                        created_at: String(u.created_at || new Date().toISOString()),
                        avatar_url: u.avatar_url
                    }));
                    setUsers(validUsers);
                } catch (e) { setUsers([]); }
            }

            // Reservas
            let reservationsData: ReservationData[] = [];
            if (resRes.status === 'fulfilled' && resRes.value.ok) {
                try {
                    const raw = await resRes.value.json();
                    reservationsData = (Array.isArray(raw) ? raw : []).map(r => ({
                        id: Number(r.id),
                        facility: String(r.facility),
                        start_time: String(r.start_time),
                        end_time: String(r.end_time),
                        price: Number(r.price) || 0,
                        user_id: Number(r.user_id),
                        user: r.user ? { full_name: r.user.full_name, email: r.user.email } : undefined
                    }));
                    setReservations(reservationsData);
                    computedStats.total_reservations = reservationsData.length;
                } catch (e) { setReservations([]); }
            }

            // Instalaciones e Ingresos
            if (facRes.status === 'fulfilled' && facRes.value.ok) {
                try {
                    const rawFac = await facRes.value.json();
                    const pricesMap: Record<string, number> = {};
                    rawFac.forEach((f: any) => { if (f.name) pricesMap[f.name] = Number(f.price) || 0; });

                    const processedFac = rawFac.map((fac: any) => {
                        const facRes = reservationsData.filter(r => r.facility === fac.name);
                        const revenue = facRes.reduce((acc, curr) => {
                            const val = Number(curr.price) || 0;
                            return acc + (val > 0 ? val : (pricesMap[fac.name] || 0));
                        }, 0);

                        let type = 'General';
                        if (fac.name?.includes('Pádel') || fac.name?.includes('Gym')) type = 'Deportiva';
                        else if (fac.name?.includes('Piscina')) type = 'Wellness';

                        return {
                            ...fac,
                            revenue,
                            bookings: facRes.length,
                            type,
                            occupancy: Math.min(100, facRes.length * 2)
                        };
                    });

                    setFacilities(processedFac);
                    computedStats.total_earnings = processedFac.reduce((acc: number, f: any) => acc + f.revenue, 0);
                } catch (e) { setFacilities([]); }
            }

            setBackendStats(computedStats);
            setLastUpdated(new Date());

        } catch (error) {
            console.error("Polling error", error);
        }
    }, [navigate]);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            await fetchAllData();
            if (mounted) setLoading(false);
        };
        init();
        const interval = setInterval(fetchAllData, 4000);
        return () => { mounted = false; clearInterval(interval); };
    }, [fetchAllData]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm("¿Eliminar usuario?")) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8000/api/v1/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== userId));
                setShowUserModal(false);
                toast.success("Eliminado");
            }
        } catch (e) { toast.error("Error"); }
    };

    const handleSaveFacility = async () => {
        if (!editingFacility) return;
        setUpdatingFacility(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8000/api/v1/reservations/facilities/${editingFacility.id}?price=${editForm.price}&capacity=${editForm.capacity}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Guardado");
                setEditingFacility(null);
                fetchAllData();
            }
        } catch (e) { toast.error("Error"); }
        finally { setUpdatingFacility(false); }
    };

    // Formatters
    const safeCurrency = (val: any) => `${Number(val || 0).toFixed(2)}€`;
    const formatDate = (s: string) => new Date(s).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    const filteredUsers = users.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Loader2 className="animate-spin text-purple-500" size={48} />
        </div>
    );

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
            <style>{`
                .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }
            `}</style>

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col glass border-r border-white/10 transition-all duration-300
                    lg:relative lg:z-auto
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
                    ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
                `}
            >
                {/* Logo Area */}
                <div className={`p-4 flex items-center ${sidebarCollapsed ? 'lg:justify-center' : 'justify-between'}`}>
                    <div
                        className="flex items-center gap-3"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                            <Shield size={16} className="text-white" />
                        </div>
                        <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                            <span className="font-semibold text-sm block">ADMIN</span>
                            <span className="text-[10px] text-gray-400">Panel de Control</span>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                    {[
                        { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Panel' },
                        { id: 'users', icon: <Users size={20} />, label: 'Usuarios' },
                        { id: 'reservations', icon: <Calendar size={20} />, label: 'Reservas' },
                        { id: 'facilities', icon: <Home size={20} />, label: 'Instalaciones' },
                        { id: 'revenue', icon: <DollarSign size={20} />, label: 'Ingresos' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
                                ${activeTab === item.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                ${sidebarCollapsed ? 'justify-center' : ''}
                            `}
                            title={sidebarCollapsed ? item.label : ''}
                        >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                                {item.label}
                            </span>
                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <LogOut size={20} />
                        <span className={`${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>Salir</span>
                    </button>

                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden lg:flex w-full items-center justify-center p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                        {sidebarCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* MAIN CONTENT - Aquí está la clave del layout responsivo */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-black/95 relative">

                {/* Header Fijo */}
                <header className="flex-shrink-0 border-b border-white/10 bg-black/50 backdrop-blur-md px-6 py-4 flex justify-between items-center z-30">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white p-1 hover:bg-white/10 rounded">
                            <Menu size={24}/>
                        </button>
                        <div>
                            <h1 className="text-xl font-light text-white tracking-wide">
                                {activeTab === 'overview' && 'Panel General'}
                                {activeTab === 'users' && 'Gestión de Usuarios'}
                                {activeTab === 'reservations' && 'Reservas'}
                                {activeTab === 'facilities' && 'Instalaciones'}
                                {activeTab === 'revenue' && 'Reporte Financiero'}
                            </h1>
                            <p className="text-xs text-gray-500 hidden sm:block">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </div>
                        <span className="text-xs font-mono text-gray-300">
                            {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </header>

                {/* Área de Scroll - Contenido Principal */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* --- TAB: OVERVIEW --- */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Usuarios', val: users.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                                        { label: 'Reservas', val: backendStats.total_reservations, icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/20' },
                                        { label: 'Ingresos', val: safeCurrency(backendStats.total_earnings), icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/20' },
                                        { label: 'Top Pista', val: backendStats.popular_facility, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/20' }
                                    ].map((stat, i) => (
                                        <div key={i} className="glass p-5 rounded-xl flex items-center justify-between group hover:border-white/20 transition">
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{stat.label}</p>
                                                <p className="text-2xl font-light text-white truncate max-w-[150px]" title={String(stat.val)}>{stat.val}</p>
                                            </div>
                                            <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center ${stat.color} group-hover:scale-110 transition`}>
                                                <stat.icon size={24} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 glass rounded-xl border border-white/10 flex flex-col">
                                        <div className="p-5 border-b border-white/10 flex justify-between items-center">
                                            <h3 className="font-medium">Últimas Reservas</h3>
                                            <button onClick={() => setActiveTab('reservations')} className="text-xs text-blue-400 hover:underline">Ver todas</button>
                                        </div>
                                        <div className="p-2 overflow-y-auto max-h-[300px]">
                                            {reservations.slice(0, 5).map(res => (
                                                <div key={res.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-400">
                                                            <Calendar size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{res.user?.full_name}</p>
                                                            <p className="text-xs text-gray-500">{res.facility} • {formatDate(res.start_time)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass rounded-xl border border-white/10 flex flex-col">
                                        <div className="p-5 border-b border-white/10">
                                            <h3 className="font-medium">Rendimiento</h3>
                                        </div>
                                        <div className="p-5 space-y-4 overflow-y-auto max-h-[300px]">
                                            {facilities.map(fac => (
                                                <div key={fac.id}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-300">{fac.name}</span>
                                                        <span className="text-gray-500">{safeCurrency(fac.revenue)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                                        <div className="bg-blue-500 h-full rounded-full" style={{width: `${(fac.revenue / (backendStats.total_earnings || 1)) * 100}%`}}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* --- TAB: USERS --- */}
                        {activeTab === 'users' && (
                            <div className="glass rounded-xl border border-white/10 flex flex-col h-full max-h-[calc(100vh-140px)]">
                                <div className="p-4 border-b border-white/10 flex gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre o email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-white/5 sticky top-0 backdrop-blur-md z-10">
                                            <tr>
                                                <th className="p-4 text-xs font-medium text-gray-400">Usuario</th>
                                                <th className="p-4 text-xs font-medium text-gray-400 hidden sm:table-cell">Contacto</th>
                                                <th className="p-4 text-xs font-medium text-gray-400">Estado</th>
                                                <th className="p-4 text-xs font-medium text-gray-400 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {filteredUsers.map(user => (
                                                <tr key={user.id} className="hover:bg-white/5 transition">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                                                                {user.full_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{user.full_name}</p>
                                                                <p className="text-xs text-gray-500">{user.role}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 hidden sm:table-cell">
                                                        <p className="text-sm text-gray-300">{user.email}</p>
                                                        <p className="text-xs text-gray-500">{user.apartment}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setSelectedUser(user); setShowUserModal(true); }} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition">
                                                                <Eye size={16} />
                                                            </button>
                                                            <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition">
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* --- TAB: RESERVATIONS --- */}
                        {activeTab === 'reservations' && (
                             <div className="space-y-4">
                                 {reservations.map(res => (
                                     <div key={res.id} className="glass p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition">
                                         <div className="flex gap-4">
                                             <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                                 <Calendar className="text-gray-400" size={20} />
                                             </div>
                                             <div>
                                                 <h3 className="font-medium text-white">{res.facility}</h3>
                                                 <p className="text-sm text-gray-400">{res.user?.full_name} • <span className="text-gray-500">{formatDate(res.start_time)}</span></p>
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                             <div className="text-right">
                                                 <p className="text-xs text-green-400">Confirmada</p>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                                 {reservations.length === 0 && <p className="text-center text-gray-500 py-10">No hay reservas registradas.</p>}
                             </div>
                        )}

                        {/* --- TAB: FACILITIES --- */}
                        {activeTab === 'facilities' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {facilities.map(fac => (
                                    <div key={fac.id} className="glass p-6 rounded-xl border border-white/10 flex flex-col justify-between group">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400">
                                                    <Home size={20} />
                                                </div>
                                                <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{fac.type}</span>
                                            </div>
                                            <h3 className="text-lg font-medium mb-1">{fac.name}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                                                <span>{safeCurrency(fac.price)}/h</span>
                                                <span>•</span>
                                                <span>Max: {fac.capacity}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setEditingFacility(fac); setEditForm({ price: fac.price, capacity: fac.capacity }); }}
                                            className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} /> Gestionar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- TAB: REVENUE --- */}
                        {activeTab === 'revenue' && (
                            <div className="glass p-8 rounded-xl border border-white/10 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4">
                                    <DollarSign size={32} />
                                </div>
                                <h2 className="text-3xl font-light text-white mb-2">{safeCurrency(backendStats.total_earnings)}</h2>
                                <p className="text-gray-400 mb-8">Ingresos Totales Acumulados</p>

                                <div className="max-w-lg mx-auto space-y-3 text-left">
                                    {facilities.filter(f => f.revenue > 0).map(fac => (
                                        <div key={fac.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                                            <span className="text-sm font-medium">{fac.name}</span>
                                            <span className="text-sm text-gray-300">{safeCurrency(fac.revenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- MODALES (Fuera del flujo principal, fixed y z-index alto) --- */}

            {/* Modal Editar Instalación */}
            {editingFacility && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium">Editar {editingFacility.name}</h3>
                            <button onClick={() => setEditingFacility(null)}><X size={20} className="text-gray-500 hover:text-white" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Precio por hora (€)</label>
                                <input
                                    type="number"
                                    value={editForm.price}
                                    onChange={e => setEditForm({...editForm, price: Number(e.target.value)})}
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setEditingFacility(null)} className="flex-1 py-2 rounded bg-white/5 hover:bg-white/10 text-sm">Cancelar</button>
                                <button
                                    onClick={handleSaveFacility}
                                    disabled={updatingFacility}
                                    className="flex-1 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    {updatingFacility && <Loader2 className="animate-spin" size={14} />} Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Usuario */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold mb-3">
                                {selectedUser.full_name.charAt(0)}
                            </div>
                            <h3 className="text-xl font-medium">{selectedUser.full_name}</h3>
                            <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/5 p-3 rounded text-center">
                                <p className="text-xs text-gray-500">Apartamento</p>
                                <p className="font-medium">{selectedUser.apartment}</p>
                            </div>
                            <div className="bg-white/5 p-3 rounded text-center">
                                <p className="text-xs text-gray-500">Rol</p>
                                <p className="font-medium uppercase">{selectedUser.role}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowUserModal(false)} className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}