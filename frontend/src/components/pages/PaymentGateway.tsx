import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Calendar, User, Check, X, Download, ArrowLeft, Loader2 } from 'lucide-react';

export default function PaymentGateway() {
  const location = useLocation();
  const navigate = useNavigate();

  const { reservationData, displayData } = location.state || {};

  const [step, setStep] = useState('form'); // form, processing, success, error
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState<any>({});
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!reservationData || !displayData) {
      alert("No hay datos de reserva. Redirigiendo...");
      navigate('/dashboard');
    }
  }, [reservationData, displayData, navigate]);

  if (!displayData) return null;

  // Validacion datos
  const validateCard = () => {
    const newErrors: any = {};

    // Validar número (16 dígitos)
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (!cardNumber) newErrors.number = 'El número es obligatorio';
    else if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) newErrors.number = 'Número inválido (16 dígitos)';

    // Validar nombre
    if (!cardData.name.trim()) newErrors.name = 'El nombre es obligatorio';

    // Validar expiración (MM/YY)
    if (!cardData.expiry) newErrors.expiry = 'Obligatorio';
    else if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) newErrors.expiry = 'Formato MM/AA';

    // Validar CVV
    if (!cardData.cvv) newErrors.cvv = 'Obligatorio';
    else if (!/^\d{3,4}$/.test(cardData.cvv)) newErrors.cvv = '3-4 dígitos';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    if (field === 'number') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }
    if (field === 'expiry') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      if (formattedValue.length > 5) return;
    }
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  const completeReservation = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/api/v1/reservations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facility: reservationData.facility,
          start_time: reservationData.start_time,
          end_time: reservationData.end_time
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar la reserva');
      }

      setStep('success');

    } catch (error) {
      console.error(error);
      setStep('error');
    }
  };

  const simulatePayment = () => {
    setStep('processing');
    setProgress(0);
    // Simulamos carga y al terminar llamamos al backend
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeReservation();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = () => {
    if (validateCard()) {
      simulatePayment();
    }
  };

  const getCardType = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5')) return 'mastercard';
    return 'generic';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .input-field { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
        .input-field:focus { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.3); outline: none; }
        .input-field.error { border-color: rgba(239, 68, 68, 0.5); }
        .ticket-perforation { background-image: radial-gradient(circle, transparent 50%, rgba(255,255,255,0.05) 50%); background-size: 20px 20px; background-position: 0 0, 10px 10px; }
      `}</style>

      {/* Fondo */}
      <div className="fixed inset-0 z-0">
        <img src="/images/comunidad_2.jpg" alt="Background" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      <nav className="relative z-10 px-6 py-6 border-b border-white/10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Cancelar y volver</span>
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
        <div className="max-w-5xl mx-auto">

          {/* Formulario */}
          {step === 'form' && (
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-extralight mb-3">
                    Método de <span className="font-semibold">Pago</span>
                  </h1>
                  <p className="text-gray-400 font-light">Completa tu reserva de forma segura</p>
                </div>

                <div className="glass p-8 rounded-3xl space-y-6">
                  {/* ... Inputs de Tarjeta ... */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Número de tarjeta</label>
                    <div className="relative">
                      <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={cardData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className={`input-field w-full pl-12 pr-16 py-4 rounded-xl text-white ${errors.number ? 'error' : ''}`}
                      />
                      {cardData.number && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {getCardType(cardData.number) === 'visa' && <span className="text-blue-400 font-bold text-sm">VISA</span>}
                          {getCardType(cardData.number) === 'mastercard' && <span className="text-orange-400 font-bold text-sm">MC</span>}
                        </div>
                      )}
                    </div>
                    {errors.number && <p className="text-red-400 text-sm mt-1">{errors.number}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Nombre del titular</label>
                    <div className="relative">
                      <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => handleInputChange('name', e.target.value.toUpperCase())}
                        placeholder="JUAN PÉREZ"
                        className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white ${errors.name ? 'error' : ''}`}
                      />
                    </div>
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Expiración</label>
                      <div className="relative">
                        <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="text"
                          value={cardData.expiry}
                          onChange={(e) => handleInputChange('expiry', e.target.value)}
                          placeholder="MM/AA"
                          className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white ${errors.expiry ? 'error' : ''}`}
                        />
                      </div>
                      {errors.expiry && <p className="text-red-400 text-sm mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">CVV</label>
                      <div className="relative">
                        <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="password"
                          value={cardData.cvv}
                          onChange={(e) => handleInputChange('cvv', e.target.value)}
                          placeholder="123"
                          maxLength={4}
                          className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white ${errors.cvv ? 'error' : ''}`}
                        />
                      </div>
                      {errors.cvv && <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 cursor-pointer border-none"
                    >
                      <Lock size={20} />
                      Pagar {displayData.total?.toFixed(2)}€
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">Al confirmar, aceptas términos y condiciones.</p>
                  </div>
                </div>
              </div>

              {/* Resumen */}
              <div className="lg:col-span-2">
                <div className="glass p-8 rounded-3xl sticky top-8">
                  <h3 className="text-xl font-medium mb-6">Resumen de reserva</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Instalación</p>
                      <p className="text-lg font-medium">{displayData.facility}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Fecha y Hora</p>
                      <p className="font-medium">{displayData.date}</p>
                      <p className="text-sm text-gray-300">{displayData.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Duración</p>
                      <p className="font-medium">{displayData.duration}</p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>{displayData.price?.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>IVA (21%)</span>
                      <span>{displayData.tax?.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-xl font-medium pt-3 border-t border-white/10">
                      <span>Total</span>
                      <span>{displayData.total?.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Procesando */}
          {step === 'processing' && (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="glass p-12 rounded-3xl text-center max-w-md w-full">
                <div className="w-24 h-24 mx-auto mb-8 relative flex items-center justify-center">
                  <Loader2 size={48} className="animate-spin text-white" />
                </div>
                <h2 className="text-3xl font-light mb-4">Procesando <span className="font-semibold">pago...</span></h2>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-4">{progress}%</p>
              </div>
            </div>
          )}

          {/* Exito */}
          {step === 'success' && (
            <div className="max-w-2xl mx-auto">
              <div className="glass p-12 rounded-3xl text-center mb-8">
                <div className="w-24 h-24 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check size={48} className="text-green-400" />
                </div>
                <h2 className="text-4xl font-light mb-4">¡Pago <span className="font-semibold">exitoso!</span></h2>
                <p className="text-gray-400 text-lg mb-8">Tu reserva ha sido confirmada correctamente.</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 glass rounded-full hover:bg-white/10 transition cursor-pointer border-none">
                    <Download size={20} /> Ticket
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition cursor-pointer border-none font-medium">
                    Volver al Inicio
                  </button>
                </div>
              </div>

              {/* Ticket visual  */}
              <div className="glass p-8 rounded-3xl">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-lg">R</span>
                      </div>
                      <div>
                        <p className="font-semibold text-lg">RESIDENCIAL</p>
                        <p className="text-xs text-gray-400">Sistema de Reservas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Ticket #</p>
                      <p className="font-mono text-sm">REF-{Math.floor(Math.random() * 100000)}</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">INSTALACIÓN</p>
                      <p className="text-2xl font-semibold">{displayData.facility}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">FECHA</p>
                        <p className="text-lg font-medium">{displayData.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">HORARIO</p>
                        <p className="text-lg font-medium">{displayData.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-6 ticket-perforation">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">MÉTODO DE PAGO</p>
                        <p className="font-medium">•••• {cardData.number.slice(-4)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{displayData.total?.toFixed(2)}€</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {step === 'error' && (
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="glass p-12 rounded-3xl text-center max-w-md">
                <div className="w-24 h-24 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <X size={48} className="text-red-400" />
                </div>
                <h2 className="text-4xl font-light mb-4">Error en la <span className="font-semibold">Reserva</span></h2>
                <p className="text-gray-400 text-lg mb-8">
                  La pista ya está reservada en ese horario o hubo un error de conexión.
                </p>
                <button onClick={() => setStep('form')} className="w-full py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition cursor-pointer border-none">
                  Intentar nuevamente
                </button>
                <button onClick={() => navigate('/dashboard')} className="w-full mt-4 py-3 glass rounded-full hover:bg-white/10 transition cursor-pointer border-none">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}