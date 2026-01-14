import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Settings, LogOut, Home, Bell, Search, Plus, X, Loader2, Save, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// --- Expresiones regulares como en el registro ---
const APARTMENT_REGEX = /^\d+\s*[A-Z]+$/;
const POSTAL_CODE_REGEX = /^\d{5}$/;
const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

// --- Tipos ---
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
  address?: string;
}

type PhotonFeature = {
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        state?: string;
    };
};

const TIME_SLOTS = [
    "09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30", "21:00"
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');

  // Referencia para evitar toast duplicado
  const toastShownRef = useRef(false);

  // Modales
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);

  // Estados de datos
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Formulario Reserva
  const [newResFacility, setNewResFacility] = useState('Pádel Court 1');
  const [newResDate, setNewResDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Formulario Completar Perfil
  const [profileForm, setProfileForm] = useState({ phone: '', address: '', apartment: '', postal_code: '' });

  // Autocompletado Photon
  const [addressSuggestions, setAddressSuggestions] = useState<PhotonFeature[]>([]);
  const [showAddressMenu, setShowAddressMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // --- 1. Cargar Datos ---
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

        // Perfil
        const userResponse = await fetch('http://localhost:8000/api/v1/users/me', { headers });
        if (userResponse.status === 401) { handleLogout(); return; }

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);

          // Verificar si faltan datos
          if (!userData.phone || !userData.address || !userData.apartment) {
             setProfileForm({
                 phone: userData.phone || '',
                 address: userData.address || '',
                 apartment: userData.apartment || '',
                 postal_code: userData.postal_code || ''
             });

             setShowCompleteProfile(true);

             if (!toastShownRef.current) {
                 toast("Por favor completa tu perfil para continuar", { icon: '📝', duration: 5000 });
                 toastShownRef.current = true;
             }
          }
        }

        // Reservas
        const resResponse = await fetch('http://localhost:8000/api/v1/reservations/me', { headers });
        if (resResponse.ok) {
          const resData = await resResponse.json();
          setReservations(resData);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // --- 2. Disponibilidad (Slots) ---
  useEffect(() => {
      if (!showReserveModal) return;

      const fetchAvailability = async () => {
          setLoadingSlots(true);
          setSelectedTimeSlot(null);
          try {
              const token = localStorage.getItem('token');
              const response = await fetch(
                  `http://localhost:8000/api/v1/reservations/availability?facility=${encodeURIComponent(newResFacility)}&date_str=${newResDate}`,
                  { headers: { 'Authorization': `Bearer ${token}` } }
              );

              if (response.ok) {
                  const data = await response.json();
                  const occupiedStartTimes = data.map((slot: any) => slot.start);
                  setBusySlots(occupiedStartTimes);
              }
          } catch (error) {
              console.error(error);
          } finally {
              setLoadingSlots(false);
          }
      };

      fetchAvailability();
  }, [newResFacility, newResDate, showReserveModal]);

  // --- 3. Autocompletado Photon ---
  useEffect(() => {
    if (profileForm.address.length < 3 || !showAddressMenu) { setAddressSuggestions([]); return; }
    const timeoutId = setTimeout(async () => {
        try {
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(profileForm.address)}&limit=5`);
            if (response.ok) {
                const data = await response.json();
                setAddressSuggestions(data.features || []);
            }
        } catch (error) { console.error(error); }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [profileForm.address, showAddressMenu]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setAddressSuggestions([]);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAddress = (feature: PhotonFeature) => {
    const p = feature.properties;
    const fullAddress = `${p.street || p.name || ""} ${p.housenumber || ""}, ${p.city || ""}`;

    setProfileForm(prev => ({
        ...prev,
        address: fullAddress,
        postal_code: p.postcode || prev.postal_code
    }));
    setAddressSuggestions([]);
    setShowAddressMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- 4. GUARDAR PERFIL CON VALIDACIÓN REGEX ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();

      // 1. Validar campos vacíos
      if(!profileForm.phone.trim() || !profileForm.apartment.trim() || !profileForm.address.trim()) {
          toast.error("Todos los campos son obligatorios.");
          return;
      }

      // 2. Validar Teléfono
      const cleanPhone = profileForm.phone.replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
          toast.error("Teléfono inválido (mínimo 9 dígitos).");
          return;
      }

      // 3. Validar Apartamento (Numero + Letra Mayúscula)
      // Aseguramos mayúscula antes de testear
      const upperApartment = profileForm.apartment.toUpperCase();
      if (!APARTMENT_REGEX.test(upperApartment)) {
          toast.error("El apartamento debe ser Nº y Letra (Ej: 4B).");
          return;
      }

      // 4. Validar Código Postal (5 dígitos)
      if (!POSTAL_CODE_REGEX.test(profileForm.postal_code)) {
          toast.error("El código postal debe tener 5 dígitos.");
          return;
      }

      setUpdatingProfile(true);
      const loadingToast = toast.loading("Validando datos...");

      try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:8000/api/v1/users/me', {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  phone: cleanPhone,
                  address: profileForm.address,
                  apartment: upperApartment, // Enviamos ya en mayúsculas
                  postal_code: profileForm.postal_code
              })
          });

          if(response.ok) {
              const updatedUser = await response.json();
              setUser(updatedUser);
              setShowCompleteProfile(false);
              toast.success("¡Perfil completado correctamente!", { id: loadingToast });
          } else {
              throw new Error("No se pudo actualizar");
          }
      } catch(err) {
          toast.error("Error al conectar con el servidor", { id: loadingToast });
      } finally {
          setUpdatingProfile(false);
      }
  };

  // --- 5. Crear Reserva ---
  const handleCreateReservation = () => {
    if (!selectedTimeSlot) { toast.error("Selecciona un horario disponible"); return; }

    if (!user?.apartment || !user?.phone) {
        toast.error("Datos incompletos. Revisa tu perfil.");
        setShowCompleteProfile(true);
        return;
    }

    const startDateTime = new Date(`${newResDate}T${selectedTimeSlot}:00`);
    const durationMinutes = 90;
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);
    const endTimeString = `${endDateTime.getHours().toString().padStart(2, '0')}:${endDateTime.getMinutes().toString().padStart(2, '0')}`;
    const displayDate = startDateTime.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const price = 15.00;
    const tax = price * 0.21;
    const total = price + tax;

    setShowReserveModal(false);
    navigate('/payment', {
      state: {
        reservationData: {
          facility: newResFacility,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        },
        displayData: {
          facility: newResFacility,
          date: displayDate,
          time: `${selectedTimeSlot} - ${endTimeString}`,
          duration: '1h 30m',
          price, tax, total
        }
      }
    });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={48} /></div>;

  return (
    <div className="min-h-screen bg-black text-white relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/10 p-6 z-40">
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-none cursor-pointer ${
                activeTab === item.id
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 bg-transparent'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none">
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
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
            <button className="glass p-3 rounded-full hover:bg-white/10 transition bg-transparent border-none cursor-pointer"><Search size={20} className="text-white"/></button>
            <button className="glass p-3 rounded-full hover:bg-white/10 transition relative bg-transparent border-none cursor-pointer">
              <Bell size={20} className="text-white"/>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div
                onClick={() => setActiveTab('profile')}
                className="glass px-4 py-2 rounded-full flex items-center gap-3 cursor-pointer hover:bg-white/10 transition"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold">
                 {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium">{user?.full_name || 'Usuario'}</span>
            </div>
          </div>
        </header>

        {/* --- TABS --- */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center"><Calendar className="text-blue-400" size={24} /></div>
                  <div><p className="text-gray-400 text-sm">Reservas totales</p><p className="text-3xl font-light">{reservations.length}</p></div>
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-2xl">
              <h2 className="text-2xl font-light mb-6">Mis reservas recientes</h2>
              <div className="space-y-4">
                {reservations.length === 0 ? <p className="text-gray-400">No tienes reservas activas.</p> :
                    reservations.slice(0, 3).map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center"><Calendar size={20} /></div>
                            <div>
                                <p className="font-medium">{res.facility}</p>
                                <p className="text-sm text-gray-400">{new Date(res.start_time).toLocaleDateString()} • {new Date(res.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Confirmada</span>
                    </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{ label: 'Reservar Pádel', icon: '🎾', color: 'from-blue-500 to-cyan-500', facility: 'Pádel Court 1' },
                { label: 'Piscina', icon: '🏊', color: 'from-cyan-500 to-teal-500', facility: 'Piscina' },
                { label: 'Gimnasio', icon: '💪', color: 'from-purple-500 to-pink-500', facility: 'Gimnasio' },
                { label: 'Sala Común', icon: '🏠', color: 'from-orange-500 to-red-500', facility: 'Sala Común' }
              ].map((action, i) => (
                <button key={i} onClick={() => { setNewResFacility(action.facility); setShowReserveModal(true); }} className="glass p-6 rounded-2xl hover:bg-white/10 transition group cursor-pointer border-none bg-transparent text-white">
                  <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto group-hover:scale-110 transition`}>{action.icon}</div>
                  <p className="text-sm font-medium text-center">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {reservations.map((res) => (
              <div key={res.id} className="glass p-6 rounded-2xl hover:bg-white/10 transition">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center"><Calendar size={24} /></div>
                    <div>
                      <h3 className="text-xl font-medium mb-1">{res.facility}</h3>
                      <p className="text-gray-400 text-sm">{new Date(res.start_time).toLocaleDateString()} {new Date(res.start_time).toLocaleTimeString()} - {new Date(res.end_time).toLocaleTimeString()}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'book' && (
          <div className="space-y-8">
            <div className="glass p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-light mb-6">Realizar nueva reserva</h2>
              <button onClick={() => setShowReserveModal(true)} className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition text-lg cursor-pointer border-none">Abrir formulario</button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && user && (
          <div className="max-w-4xl glass p-8 rounded-2xl mb-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl font-bold">{user.full_name?.charAt(0)}</div>
                <div><h2 className="text-2xl font-light mb-2">{user.full_name}</h2><p className="text-gray-400">Apartamento: {user.apartment}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm text-gray-400 mb-2">Email</label><input type="email" value={user.email} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" readOnly /></div>
                <div><label className="block text-sm text-gray-400 mb-2">Teléfono</label><input type="text" value={user.phone || 'No registrado'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" readOnly /></div>
                <div><label className="block text-sm text-gray-400 mb-2">Dirección</label><input type="text" value={user.address || 'No registrado'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" readOnly /></div>
                <div><label className="block text-sm text-gray-400 mb-2">CP</label><input type="text" value={user.postal_code || 'No registrado'} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white" readOnly /></div>
              </div>
          </div>
        )}
      </main>

      {/* --- MODAL RESERVA --- */}
      {showReserveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 rounded-2xl max-w-2xl w-full border border-white/10 h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light">Nueva Reserva</h2>
              <button onClick={() => setShowReserveModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition cursor-pointer bg-transparent border-none text-white"><X size={24} /></button>
            </div>

            <div className="space-y-6">
              <div><label className="block text-sm text-gray-400 mb-2">Instalación</label><select value={newResFacility} onChange={e => setNewResFacility(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white"><option>Pádel Court 1</option><option>Pádel Court 2</option><option>Piscina</option><option>Gimnasio</option><option>Sala Común</option></select></div>
              <div><label className="block text-sm text-gray-400 mb-2">Fecha</label><input type="date" value={newResDate} onChange={e => setNewResDate(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white scheme-dark" /></div>

              <div>
                  <label className="block text-sm text-gray-400 mb-3">Horarios Disponibles (90 min)</label>
                  {loadingSlots ? (
                      <div className="flex justify-center py-4"><Loader2 className="animate-spin text-purple-500" /></div>
                  ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {TIME_SLOTS.map((slot) => {
                              const isBusy = busySlots.includes(slot);
                              const isSelected = selectedTimeSlot === slot;
                              return (
                                  <button
                                      key={slot}
                                      disabled={isBusy}
                                      onClick={() => setSelectedTimeSlot(slot)}
                                      className={`
                                          py-3 rounded-xl border transition flex flex-col items-center justify-center gap-1 cursor-pointer
                                          ${isBusy 
                                              ? 'bg-red-500/10 border-red-500/30 text-red-400 opacity-50 cursor-not-allowed' 
                                              : isSelected
                                                  ? 'bg-white text-black border-white'
                                                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                                          }
                                      `}
                                  >
                                      <span className="font-medium text-sm">{slot}</span>
                                      <span className="text-[10px] uppercase font-bold">{isBusy ? 'Ocupado' : 'Libre'}</span>
                                  </button>
                              );
                          })}
                      </div>
                  )}
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                <button onClick={() => setShowReserveModal(false)} className="flex-1 py-3 glass rounded-lg hover:bg-white/10 transition cursor-pointer text-white">Cancelar</button>
                <button
                    onClick={handleCreateReservation}
                    disabled={!selectedTimeSlot}
                    className="flex-1 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ir al Pago (15.00€)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL COMPLETAR PERFIL --- */}
      {showCompleteProfile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[60] p-6">
          <div className="glass p-8 rounded-2xl max-w-md w-full border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.15)] animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30"><User size={32} className="text-purple-400" /></div>
                <h2 className="text-2xl font-semibold text-white">Completa tu perfil</h2>
                <div className="flex items-center gap-2 justify-center mt-3 text-amber-300 bg-amber-900/20 py-2 px-3 rounded-lg border border-amber-500/20"><AlertCircle size={16} /><p className="text-xs font-medium">Requerido para acceder a las reservas</p></div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">Teléfono móvil</label>
                    <input required type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white placeholder-gray-600" placeholder="600 123 456"/>
                </div>

                <div className="relative" ref={wrapperRef}>
                    <label className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">Dirección</label>
                    <div className="relative mt-1">
                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input required type="text" value={profileForm.address} onChange={e => {setProfileForm({...profileForm, address: e.target.value}); setShowAddressMenu(true);}} className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white placeholder-gray-600" placeholder="Empieza a escribir tu calle..." autoComplete="off"/>
                    </div>
                    {addressSuggestions.length > 0 && showAddressMenu && (
                        <ul className="absolute z-50 w-full mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                            {addressSuggestions.map((item, idx) => (
                                <li key={idx} onClick={() => handleSelectAddress(item)} className="px-4 py-3 hover:bg-purple-900/30 cursor-pointer border-b border-white/5 last:border-0 text-sm text-gray-300 hover:text-white transition-colors">{item.properties.street || item.properties.name} {item.properties.housenumber}, {item.properties.city}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">Apartamento</label>
                        <input required type="text" value={profileForm.apartment} onChange={e => setProfileForm({...profileForm, apartment: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white uppercase placeholder-gray-600" placeholder="Ej: 4B"/>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider ml-1 font-semibold">C. Postal</label>
                        <input required type="text" value={profileForm.postal_code} onChange={e => setProfileForm({...profileForm, postal_code: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition text-white placeholder-gray-600" placeholder="28000"/>
                    </div>
                </div>

                <button type="submit" disabled={updatingProfile} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer shadow-lg shadow-purple-900/20">
                    {updatingProfile ? <Loader2 className="animate-spin" /> : <><Save size={20}/> Guardar Datos</>}
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}