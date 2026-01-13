import { useState, useRef, useEffect } from 'react';
import { Camera, Save, X, Mail, Phone, Home, Edit2, User, Award, Calendar, Clock, ArrowLeft, Loader2 } from 'lucide-react';


export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartment: '',
    tower: 'Torre Norte',
    postalCode: '28001',
    address: 'Calle Principal 123, Madrid'
  });

  // Cargar los datos del backend
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/api/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            apartment: data.apartment || ''
          }));
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setShowImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Guardar los cambios del back
  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.name,
          phone: formData.phone,
          apartment: formData.apartment
        })
      });

      if (!response.ok) throw new Error('Error al actualizar');

      setIsEditing(false);
      alert('Información guardada correctamente');

    } catch (error) {
      console.error(error);
      alert('Error al guardar los cambios');
    }
  };

  const stats = [
    { icon: <Calendar size={20} />, value: '28', label: 'Reservas totales', color: 'from-blue-500 to-cyan-500' },
    { icon: <Clock size={20} />, value: '42h', label: 'Horas de uso', color: 'from-purple-500 to-pink-500' },
    { icon: <Award size={20} />, value: '3', label: 'Favoritas', color: 'from-orange-500 to-red-500' }
  ];

  const recentActivity = [
    { facility: 'Pádel Court 1', date: '2026-01-10', duration: '1.5h', status: 'completed' },
    { facility: 'Piscina', date: '2026-01-08', duration: '1.5h', status: 'completed' },
    { facility: 'Gimnasio', date: '2026-01-05', duration: '1h', status: 'completed' }
  ];

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
        .input-field {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
          outline: none;
        }
        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      {/* Fondo */}
      <div className="fixed inset-0 z-0">
        <img
           src="/images/comunidad_1.jpg"
           alt="Background"
           className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <nav className="relative z-10 px-6 py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
             onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Volver al dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="font-semibold">RESIDENCIAL</span>
          </div>
        </div>
      </nav>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-extralight mb-4">
              Mi <span className="font-semibold">Perfil</span>
            </h1>
            <p className="text-gray-400 font-light">
              Gestiona tu información personal y preferencias
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tarjeta de Usuario */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass p-8 rounded-3xl text-center">
                <div className="relative inline-block mb-6">
                  <div className="relative w-32 h-32 mx-auto">
                    {profileImage ? (
                      <img
                         src={profileImage}
                         alt="Profile"
                         className="w-full h-full rounded-full object-cover border-4 border-white/10"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-4 border-white/10 flex items-center justify-center text-4xl font-bold">
                        {formData.name.charAt(0)}
                      </div>
                    )}
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-lg cursor-pointer border-none"
                    >
                      <Camera size={20} />
                    </button>
                  </div>
                </div>
                <h2 className="text-2xl font-medium mb-2">{formData.name}</h2>
                <p className="text-gray-400 text-sm mb-1">
                  Apartamento {formData.apartment || '---'} • {formData.tower}
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Cuenta activa</span>
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Estadísticas
                </h3>
                <div className="space-y-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                          {stat.icon}
                        </div>
                        <span className="text-sm text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-xl font-light">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-8 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-light">Información Personal</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition cursor-pointer border-none"
                    >
                      <Edit2 size={18} />
                      <span className="font-medium">Editar</span>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 glass rounded-full hover:bg-white/10 transition cursor-pointer border-none"
                      >
                        <X size={18} />
                        <span className="font-medium">Cancelar</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition cursor-pointer border-none"
                      >
                        <Save size={18} />
                        <span className="font-medium">Guardar</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <User size={16} />
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="input-field w-full px-4 py-3 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <Mail size={16} />
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="input-field w-full px-4 py-3 rounded-xl text-white opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <Phone size={16} />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="input-field w-full px-4 py-3 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                        <Home size={16} />
                        Apartamento
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={formData.apartment}
                          onChange={(e) => handleChange('apartment', e.target.value)}
                          disabled={!isEditing}
                          placeholder="4B"
                          className="input-field w-full px-4 py-3 rounded-xl text-white"
                        />
                        <input
                          type="text"
                          value={formData.tower}
                          disabled={true}
                          className="input-field w-full px-4 py-3 rounded-xl text-white opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-3xl">
                <h3 className="text-2xl font-light mb-6">Actividad Reciente</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{activity.facility}</p>
                          <p className="text-sm text-gray-400">{activity.date} • {activity.duration}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                        Completada
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="glass p-8 rounded-3xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-light">Cambiar foto de perfil</h2>
              <button
                 onClick={() => setShowImageModal(false)}
                 className="p-2 hover:bg-white/10 rounded-lg transition cursor-pointer border-none bg-transparent"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-6">
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-white/40 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Camera size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 mb-4">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition cursor-pointer border-none"
                >
                  Seleccionar archivo
                </button>
              </div>
              <div className="text-sm text-gray-400 space-y-2">
                <p>• La imagen se guardará localmente (simulado)</p>
              </div>
              {profileImage && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setProfileImage(null);
                      setShowImageModal(false);
                    }}
                    className="flex-1 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition cursor-pointer border-none"
                  >
                    Eliminar foto
                  </button>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="flex-1 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-200 transition cursor-pointer border-none"
                  >
                    Confirmar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}