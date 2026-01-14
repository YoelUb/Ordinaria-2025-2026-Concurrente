import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Importante: useNavigate
import { Calendar, User, Settings, LogOut, Home, Bell, Search, Plus, X, Loader2 } from 'lucide-react';

interface Reservation {
  id: number;
  facility: string;
  start_time: string;
  end_time: string;
  status?: string;
}

interface UserProfile {
  full_name: string;
  email: string;
  apartment: string;
  phone: string;
  postal_code?: string;
}

export default function Dashboard() {
  const navigate = useNavigate(); // Hook para redirigir
  const [activeTab, setActiveTab] = useState('home');
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Estados de datos
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario de reserva
  const [newResFacility, setNewResFacility] = useState('Pádel Court 1');
  const [newResDate, setNewResDate] = useState('');
  const [newResTime, setNewResTime] = useState('09:00');

  // Cargar datos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');

      // Si no hay token, redirigir inmediatamente
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Obtener perfil
        const userResponse = await fetch('http://localhost:8000/api/v1/users/me', { headers });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else if (userResponse.status === 401) {
            handleLogout(); // Token expirado o inválido
            return;
        }

        // Obtener reservas existentes
        const resResponse = await fetch('http://localhost:8000/api/v1/reservations/me', { headers });
        if (resResponse.ok) {
          const resData = await resResponse.json();
          setReservations(resData);
        }

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Función de Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Logica de redirecccion de pago
  const handleCreateReservation = () => {
    if (!newResDate || !newResTime) {
      alert("Por favor selecciona fecha y hora");
      return;
    }

    // Calcular fechas exactas
    const startDateTime = new Date(`${newResDate}T${newResTime}:00`);

    // Asumimos reserva de 1.5 horas
    const durationMinutes = 90;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    // Formatear hora fin para mostrarla
    const endTimeString = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;

    // Formatear datos para visualización
    const displayDate = startDateTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    const displayTime = `${newResTime} - ${endTimeString}`;

    // Calcular Precio
    const price = 15.00;
    const tax = price * 0.21;
    const total = price + tax;

    // Cerrar modal y redirigir pago
    setShowReserveModal(false);

    navigate('/payment', {
      state: {
        // Datos crudos para el backend
        reservationData: {
          facility: newResFacility,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        },
        // Datos bonitos para el usuario
        displayData: {
          facility: newResFacility,
          date: displayDate,
          time: displayTime,
          duration: '1 hora 30 min',
          price: price,
          tax: tax,
          total: total
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 p-6 z-50">
        <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold">R</span>
          </div>
          <span className="font-semibold text-lg">RESIDENCIAL</span>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'home', icon: <Home size={20} />, label: 'Inicio' },
            { id: 'reservations', icon: <Calendar size={20} />, label: 'Mis Reservas' },
            { id: 'book', icon: <Plus size={20} />, label: 'Nueva Reserva' },
            { id: 'profile', icon: <User size={20} />, label: 'Perfil' },
            { id: 'settings', icon: <Settings size={20} />, label: 'Configuración' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-light mb-2">
              {activeTab === 'home' && 'Bienvenido de nuevo'}
              {activeTab === 'reservations' && 'Mis Reservas'}
              {activeTab === 'book' && 'Nueva Reserva'}
              {activeTab === 'profile' && 'Mi Perfil'}
              {activeTab === 'settings' && 'Configuración'}
            </h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="glass p-3 rounded-full hover:bg-white/10 transition">
              <Search size={20} />
            </button>
            <button className="glass p-3 rounded-full hover:bg-white/10 transition relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="glass px-4 py-2 rounded-full flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                 {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium">{user?.full_name || 'Usuario'}</span>
            </div>
          </div>
        </header>

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Calendar className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Reservas totales</p>
                    <p className="text-3xl font-light">{reservations.length}</p>
                  </div>
                </div>
              </div>
               {/* Puedes añadir más tarjetas de estadísticas reales aquí */}
            </div>

            <div className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-light mb-6">Mis reservas recientes</h2>
              <div className="space-y-4">
                {reservations.length === 0 ? (
                    <p className="text-gray-400">No tienes reservas activas.</p>
                ) : (
                    reservations.slice(0, 3).map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                        <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <p className="font-medium">{res.facility}</p>
                            <p className="text-sm text-gray-400">
                                {new Date(res.start_time).toLocaleDateString()} • {new Date(res.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                           Confirmada
                        </span>
                    </div>
                    ))
                )}
              </div>
            </div>

             {/* Quick Actions (Acciones Rápidas) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Reservar Pádel', icon: '🎾', color: 'from-blue-500 to-cyan-500', facility: 'Pádel Court 1' },
                { label: 'Piscina', icon: '🏊', color: 'from-cyan-500 to-teal-500', facility: 'Piscina' },
                { label: 'Gimnasio', icon: '💪', color: 'from-purple-500 to-pink-500', facility: 'Gimnasio' },
                { label: 'Sala Común', icon: '🏠', color: 'from-orange-500 to-red-500', facility: 'Sala Común' }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => {
                      setNewResFacility(action.facility);
                      setShowReserveModal(true);
                  }}
                  className="glass p-6 rounded-2xl hover:bg-white/10 transition group cursor-pointer"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 transition`}>
                    {action.icon}
                  </div>
                  <p className="text-sm font-medium text-center">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RESERVATIONS TAB */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {reservations.map((res) => (
              <div key={res.id} className="glass p-6 rounded-2xl hover:bg-white/10 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-1">{res.facility}</h3>
                      <p className="text-gray-400 text-sm">
                        {new Date(res.start_time).toLocaleDateString()}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(res.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(res.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BOOK TAB */}
        {activeTab === 'book' && (
          <div className="space-y-8">
            <div className="glass p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-light mb-6">Realizar nueva reserva</h2>
              <button
                onClick={() => setShowReserveModal(true)}
                className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition text-lg cursor-pointer"
              >
                Abrir formulario de reserva
              </button>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && user && (
          <div className="max-w-4xl">
            <div className="glass p-8 rounded-2xl mb-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold">
                    {user.full_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-light mb-2">{user.full_name}</h2>
                  <p className="text-gray-400">Apartamento: {user.apartment}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <input type="email" value={user.email} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Teléfono</label>
                  <input type="text" value={user.phone || 'No registrado'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" readOnly />
                </div>
                 <div>
                  <label className="block text-sm text-gray-400 mb-2">CP</label>
                  <input type="text" value={user.postal_code || 'No registrado'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2" readOnly />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6">
            <div className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-light mb-6">Configuración</h2>
              <p className="text-gray-400">Opciones de usuario (Próximamente)</p>
            </div>
          </div>
        )}
      </main>

      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 rounded-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light">Nueva Reserva</h2>
              <button onClick={() => setShowReserveModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition cursor-pointer bg-transparent border-none">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Instalación</label>
                <select
                    value={newResFacility}
                    onChange={(e) => setNewResFacility(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition text-white"
                >
                  <option value="Pádel Court 1">Pista de Pádel 1</option>
                  <option value="Pádel Court 2">Pista de Pádel 2</option>
                  <option value="Piscina">Piscina</option>
                  <option value="Gimnasio">Gimnasio</option>
                  <option value="Sala Común">Sala Común</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Fecha</label>
                  <input
                    type="date"
                    value={newResDate}
                    onChange={(e) => setNewResDate(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition text-white scheme-dark"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hora Inicio</label>
                  <input
                    type="time"
                    value={newResTime}
                    onChange={(e) => setNewResTime(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-white/30 transition text-white scheme-dark"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                    onClick={() => setShowReserveModal(false)}
                    className="flex-1 py-3 glass rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                    onClick={handleCreateReservation}
                    className="flex-1 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer border-none"
                >
                  Ir al Pago (15.00€)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}