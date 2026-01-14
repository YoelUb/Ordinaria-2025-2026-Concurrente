import { useState } from 'react';
import {
  LayoutDashboard, Users, Calendar, DollarSign, Settings, LogOut,
  TrendingUp, TrendingDown, Eye, Edit, Trash2, Search, Filter,
  Download, Home, Activity, Mail, X, Bell,
   CreditCard, BarChart3, Shield
} from 'lucide-react';

// Interfaz del usuario
interface UserData {
  id: number;
  name: string;
  email: string;
  apartment: string;
  tower: string;
  status: string;
  reservations: number;
  joined: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);

  // 2. CORREGIMOS EL USESTATE PARA QUE ACEPTE 'UserData' O 'null'
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications] = useState([
    { id: 1, title: 'Nueva reserva', message: 'Juan Pérez ha reservado Pádel Court 1', time: 'Hace 5 min', read: false, icon: 'calendar' },
    { id: 2, title: 'Pago recibido', message: 'María García ha pagado 15€ por reserva', time: 'Hace 2 horas', read: false, icon: 'credit-card' },
    { id: 3, title: 'Instalación disponible', message: 'Gimnasio está libre para limpieza', time: 'Hace 1 día', read: true, icon: 'home' },
    { id: 4, title: 'Usuario nuevo', message: 'Nuevo residente registrado en la plataforma', time: 'Hace 2 días', read: true, icon: 'user' },
  ]);

  const stats = {
    totalUsers: 342,
    activeReservations: 28,
    monthlyRevenue: 4250,
    occupancyRate: 78,
    trends: { users: 12, reservations: -5, revenue: 18, occupancy: 8 }
  };

  const recentReservations = [
    { id: 1, user: 'Juan Pérez', facility: 'Pádel Court 1', date: '2026-01-15', time: '18:00', status: 'confirmed', price: 15 },
    { id: 2, user: 'María García', facility: 'Piscina', date: '2026-01-15', time: '10:00', status: 'confirmed', price: 0 },
    { id: 3, user: 'Carlos López', facility: 'Gimnasio', date: '2026-01-15', time: '07:00', status: 'pending', price: 0 },
    { id: 4, user: 'Ana Martín', facility: 'Pádel Court 2', date: '2026-01-16', time: '19:00', status: 'confirmed', price: 15 },
    { id: 5, user: 'Pedro Ruiz', facility: 'Sala Común', date: '2026-01-17', time: '16:00', status: 'pending', price: 0 },
    { id: 6, user: 'Laura Sánchez', facility: 'Piscina', date: '2026-01-18', time: '14:00', status: 'cancelled', price: 0 }
  ];

  // TypeScript ahora sabe que este array cumple con la interfaz UserData
  const users: UserData[] = [
    { id: 1, name: 'Juan Pérez García', email: 'juan.perez@email.com', apartment: '4B', tower: 'Norte', status: 'active', reservations: 12, joined: '2024-01-15' },
    { id: 2, name: 'María García López', email: 'maria.garcia@email.com', apartment: '3A', tower: 'Sur', status: 'active', reservations: 8, joined: '2024-02-20' },
    { id: 3, name: 'Carlos López Ruiz', email: 'carlos.lopez@email.com', apartment: '2C', tower: 'Norte', status: 'inactive', reservations: 0, joined: '2024-03-10' },
    { id: 4, name: 'Ana Martín Díaz', email: 'ana.martin@email.com', apartment: '5A', tower: 'Sur', status: 'active', reservations: 15, joined: '2024-01-05' },
    { id: 5, name: 'Pedro Ruiz Torres', email: 'pedro.ruiz@email.com', apartment: '1B', tower: 'Norte', status: 'active', reservations: 6, joined: '2024-04-12' }
  ];

  const facilities = [
    { id: 1, name: 'Pádel Court 1', type: 'Deportiva', occupancy: 85, revenue: 1250, bookings: 42 },
    { id: 2, name: 'Pádel Court 2', type: 'Deportiva', occupancy: 72, revenue: 980, bookings: 35 },
    { id: 3, name: 'Piscina', type: 'Wellness', occupancy: 68, revenue: 0, bookings: 58 },
    { id: 4, name: 'Gimnasio', type: 'Fitness', occupancy: 45, revenue: 0, bookings: 125 },
    { id: 5, name: 'Sala Común', type: 'Social', occupancy: 30, revenue: 0, bookings: 8 }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getNotificationIcon = (iconType: string) => {
    switch(iconType) {
      case 'calendar': return <Calendar size={16} />;
      case 'credit-card': return <CreditCard size={16} />;
      case 'home': return <Home size={16} />;
      case 'user': return <Users size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-72 glass border-r border-white/10 p-6 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-lg">RESIDENCIAL</span>
            <p className="text-xs text-gray-500">Panel de Administración</p>
          </div>
        </div>

        <nav className="space-y-2 mb-12">
          {[
            { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Panel General' },
            { id: 'users', icon: <Users size={20} />, label: 'Usuarios' },
            { id: 'reservations', icon: <Calendar size={20} />, label: 'Reservas' },
            { id: 'facilities', icon: <Home size={20} />, label: 'Instalaciones' },
            { id: 'revenue', icon: <DollarSign size={20} />, label: 'Ingresos' },
            { id: 'settings', icon: <Settings size={20} />, label: 'Configuración' }
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
          <div className="glass p-4 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">A</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Admin User</p>
                <p className="text-xs text-gray-500">admin@residencial.com</p>
              </div>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-light mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {activeTab === 'overview' && 'Panel General'}
              {activeTab === 'users' && 'Gestión de Usuarios'}
              {activeTab === 'reservations' && 'Gestión de Reservas'}
              {activeTab === 'facilities' && 'Instalaciones'}
              {activeTab === 'revenue' && 'Ingresos'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="glass p-3 rounded-xl hover:bg-white/10 transition relative border border-white/10"
              >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-14 w-96 glass rounded-2xl p-4 shadow-xl z-50 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">Notificaciones</h3>
                    <button className="text-sm text-gray-400 hover:text-white transition">
                      Marcar todas como leídas
                    </button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl transition-all cursor-pointer ${
                          notification.read 
                            ? 'bg-white/5 hover:bg-white/10' 
                            : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            notification.read ? 'bg-white/10' : 'bg-blue-500/20'
                          }`}>
                            {getNotificationIcon(notification.icon)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{notification.title}</p>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition border border-white/10">
              <Download size={20} />
              <span className="text-sm font-medium">Exportar</span>
            </button>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-400" size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stats.trends.users > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.trends.users > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(stats.trends.users)}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Usuarios</p>
                <p className="text-3xl font-light">{stats.totalUsers}</p>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="text-green-400" size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stats.trends.reservations > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.trends.reservations > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(stats.trends.reservations)}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Reservas Activas</p>
                <p className="text-3xl font-light">{stats.activeReservations}</p>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="text-purple-400" size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stats.trends.revenue > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.trends.revenue > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(stats.trends.revenue)}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Ingresos (Mes)</p>
                <p className="text-3xl font-light">{stats.monthlyRevenue}€</p>
              </div>

              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="text-orange-400" size={24} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stats.trends.occupancy > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stats.trends.occupancy > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{Math.abs(stats.trends.occupancy)}%</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-1">Ocupación Media</p>
                <p className="text-3xl font-light">{stats.occupancyRate}%</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass p-8 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-light">Reservas Recientes</h2>
                  <button className="text-sm text-gray-400 hover:text-white transition">Ver todas →</button>
                </div>
                <div className="space-y-3">
                  {recentReservations.slice(0, 5).map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
                          {res.user.split(' ')[0][0]}{res.user.split(' ')[1][0]}
                        </div>
                        <div>
                          <p className="font-medium">{res.user}</p>
                          <p className="text-sm text-gray-400">{res.facility} • {res.date} {res.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {res.price > 0 && <span className="text-sm font-medium">{res.price}€</span>}
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(res.status)}`}>
                          {getStatusText(res.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-light mb-6">Ocupación Hoy</h2>
                <div className="space-y-4">
                  {facilities.map((fac) => (
                    <div key={fac.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{fac.name}</span>
                        <span className="text-sm text-gray-400">{fac.occupancy}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" style={{ width: `${fac.occupancy}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white focus:outline-none border border-white/10"
                />
              </div>
              <button className="glass px-4 py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition border border-white/10">
                <Filter size={20} />
                <span>Filtros</span>
              </button>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition">
                + Nuevo Usuario
              </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-white/10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Usuario</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Apartamento</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Reservas</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Estado</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                            {user.name.split(' ')[0][0]}{user.name.split(' ')[1][0]}
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">Desde {formatDate(user.joined)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><span className="text-sm">{user.apartment} - {user.tower}</span></td>
                      <td className="p-4"><span className="text-sm text-gray-400">{user.email}</span></td>
                      <td className="p-4"><span className="text-sm font-medium">{user.reservations}</span></td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setShowUserModal(true); }}
                            className="p-2 hover:bg-white/10 rounded-lg transition"
                          >
                            <Eye size={18} />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition">
                            <Trash2 size={18} />
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

        {/* Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-sm font-medium">
                  Todas
                </button>
                <button className="px-4 py-2 glass rounded-xl text-sm hover:bg-white/10 transition border border-white/10">
                  Confirmadas
                </button>
                <button className="px-4 py-2 glass rounded-xl text-sm hover:bg-white/10 transition border border-white/10">
                  Pendientes
                </button>
                <button className="px-4 py-2 glass rounded-xl text-sm hover:bg-white/10 transition border border-white/10">
                  Canceladas
                </button>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl font-medium hover:opacity-90 transition">
                + Nueva Reserva
              </button>
            </div>

            <div className="grid gap-4">
              {recentReservations.map((res) => (
                <div key={res.id} className="glass p-6 rounded-2xl hover:bg-white/10 transition border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Calendar size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium mb-1">{res.facility}</h3>
                        <p className="text-gray-400 text-sm mb-1">{res.user}</p>
                        <p className="text-gray-400 text-sm">{res.date} • {res.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {res.price > 0 && (
                        <div className="text-right mr-4">
                          <p className="text-sm text-gray-400">Precio</p>
                          <p className="text-xl font-medium">{res.price}€</p>
                        </div>
                      )}
                      <span className={`px-4 py-2 rounded-full text-sm ${getStatusColor(res.status)}`}>
                        {getStatusText(res.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Facilities Tab */}
        {activeTab === 'facilities' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac) => (
              <div key={fac.id} className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-medium">{fac.name}</h3>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">{fac.type}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Ocupación</span>
                      <span className="text-sm font-medium">{fac.occupancy}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full" style={{ width: `${fac.occupancy}%` }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Reservas</p>
                      <p className="text-lg font-medium">{fac.bookings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Ingresos</p>
                      <p className="text-lg font-medium">{fac.revenue}€</p>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 px-4 py-3 glass rounded-xl text-sm hover:bg-white/10 transition">
                  Gestionar Instalación
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Ingresos Hoy</p>
                <p className="text-3xl font-light mb-2">245€</p>
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp size={16} />+12% vs ayer
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Ingresos Semana</p>
                <p className="text-3xl font-light mb-2">1,280€</p>
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp size={16} />+8% vs semana pasada
                </p>
              </div>
              <div className="glass p-6 rounded-2xl border border-white/10">
                <p className="text-gray-400 text-sm mb-2">Ingresos Mes</p>
                <p className="text-3xl font-light mb-2">4,250€</p>
                <p className="text-sm text-green-400 flex items-center gap-1">
                  <TrendingUp size={16} />+18% vs mes pasado
                </p>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light">Desglose por Instalación</h2>
                <button className="text-sm text-gray-400 hover:text-white transition">
                  <BarChart3 size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {facilities.filter(f => f.revenue > 0).map((fac) => (
                  <div key={fac.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <DollarSign size={24} />
                      </div>
                      <div>
                        <p className="font-medium">{fac.name}</p>
                        <p className="text-sm text-gray-400">{fac.bookings} reservas</p>
                      </div>
                    </div>
                    <p className="text-2xl font-light">{fac.revenue}€</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6">
            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-light mb-6">Configuración General</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Notificaciones por email</p>
                    <p className="text-sm text-gray-400">Recibir alertas de nuevas reservas</p>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r from-blue-500 to-purple-500 transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Sistema de recordatorios</p>
                    <p className="text-sm text-gray-400">Enviar recordatorios de reservas</p>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r from-blue-500 to-purple-500 transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Pagos automáticos</p>
                    <p className="text-sm text-gray-400">Habilitar pagos con tarjeta</p>
                  </div>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r from-blue-500 to-purple-500 transition"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl border border-white/10">
              <h2 className="text-2xl font-light mb-6">Configuración de Instalaciones</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {facilities.map(fac => (
                  <div key={fac.id} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{fac.name}</span>
                      <span className="text-sm text-gray-400">{fac.type}</span>
                    </div>
                    <button className="w-full px-4 py-2 glass rounded-lg text-sm hover:bg-white/10 transition">
                      Configurar Horarios
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light">Detalles del Usuario</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl font-bold">
                {selectedUser.name.split(' ')[0][0]}{selectedUser.name.split(' ')[1][0]}
              </div>
              <div>
                <h3 className="text-xl font-medium mb-1">{selectedUser.name}</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-sm text-gray-400">Miembro desde {formatDate(selectedUser.joined)}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Información de Contacto</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <Mail size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <Home size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-400">Residencia</p>
                        <p className="font-medium">Torre {selectedUser.tower}, Apartamento {selectedUser.apartment}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm text-gray-400 mb-2">Estadísticas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Reservas Totales</p>
                      <p className="text-2xl font-light">{selectedUser.reservations}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Estado</p>
                      <p className="text-2xl font-light">{selectedUser.status === 'active' ? 'Activo' : 'Inactivo'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <p className="text-sm text-gray-300 mb-2">Última Actividad</p>
                  <p className="font-medium">Hace 2 días</p>
                </div>
              </div>
            </div>

            <h4 className="text-sm text-gray-400 mb-3">Reservas Recientes</h4>
            <div className="mb-8">
              {recentReservations
                .filter(res => res.user === selectedUser.name.split(' ')[0] + ' ' + selectedUser.name.split(' ')[1])
                .slice(0, 3)
                .map(res => (
                  <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-2 hover:bg-white/10 transition">
                    <div>
                      <p className="font-medium">{res.facility}</p>
                      <p className="text-sm text-gray-400">{res.date} • {res.time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {res.price > 0 && <span className="font-medium">{res.price}€</span>}
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(res.status)}`}>
                        {getStatusText(res.status)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition">
                Editar Usuario
              </button>
              <button className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition">
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}