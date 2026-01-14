import {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {CreditCard, Lock, Calendar, User, Check, X, Download, ArrowLeft, Loader2} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentGateway() {
    const location = useLocation();
    const navigate = useNavigate();

    const {reservationData, displayData} = location.state || {};

    const [step, setStep] = useState('form');
    const [cardData, setCardData] = useState({number: '', name: '', expiry: '', cvv: ''});
    const [errors, setErrors] = useState<any>({});
    const [progress, setProgress] = useState(0);

    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!reservationData || !displayData) {
            toast.error("No hay datos de reserva. Redirigiendo...");
            navigate('/dashboard');
        }
    }, [reservationData, displayData, navigate]);

    if (!displayData) return null;

    // Validacion datos estricta
    const validateCard = () => {
        const newErrors: any = {};

        // Validar número (16 dígitos)
        const cardNumber = cardData.number.replace(/\s/g, '');
        if (!cardNumber) newErrors.number = 'El número es obligatorio';
        else if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) newErrors.number = 'Número inválido (16 dígitos)';

        // Validar nombre (Sin números y mínimo 3 letras)
        const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;
        if (!cardData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio';
        } else if (cardData.name.length < 3) {
            newErrors.name = 'Mínimo 3 caracteres';
        } else if (!NAME_REGEX.test(cardData.name)) {
            newErrors.name = 'No se permiten números en el nombre';
        }

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

        if (field === 'name') {
            // Filtro instantáneo: borra cualquier número mientras escribe
            formattedValue = value.replace(/[0-9]/g, '').toUpperCase();
        }

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

        setCardData(prev => ({...prev, [field]: formattedValue}));
        if (errors[field]) setErrors((prev: any) => ({...prev, [field]: ''}));
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
            localStorage.setItem('paymentSuccess', 'true');
            // NO establecemos isProcessing a false aquí para evitar doble click accidental en la pantalla de éxito

        } catch (error: any) {
            console.error(error);
            setStep('error');
            toast.error(error.message);
            setIsProcessing(false); // Solo desbloqueamos si falla
        }
    };

    const simulatePayment = () => {
        setStep('processing');
        setProgress(0);

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
        if (isProcessing) return; // BLOQUEO DOBLE CLICK
        if (validateCard()) {
            setIsProcessing(true); // BLOQUEO INMEDIATO
            simulatePayment();
        } else {
            toast.error("Por favor, revisa los datos de la tarjeta");
        }
    };

    const getCardType = (number: string) => {
        const num = number.replace(/\s/g, '');
        if (num.startsWith('4')) return 'visa';
        if (num.startsWith('5')) return 'mastercard';
        return 'generic';
    };

    return (
        <div className="min-h-screen bg-brand-dark text-white overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Inter', sans-serif; }
                .glass { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
                .input-field { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; }
                .input-field:focus { border-color: rgba(255, 255, 255, 0.3); outline: none; }
                .input-field.error { border-color: rgba(239, 68, 68, 0.5); }
            `}</style>

            <div className="fixed inset-0 z-0">
                <img src="/images/comunidad_2.jpg" alt="Background" className="w-full h-full object-cover opacity-10"/>
                <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/95 to-brand-dark"/>
            </div>

            <nav className="relative z-10 px-6 py-6 border-b border-white/10">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        disabled={isProcessing && step !== 'success'}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer disabled:opacity-50"
                    >
                        <ArrowLeft size={20}/>
                        <span className="text-sm font-medium">Cancelar y volver</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">R</span>
                        </div>
                        <span className="font-semibold uppercase tracking-wider">Residencial</span>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 px-6 py-12">
                <div className="max-w-5xl mx-auto">
                    {step === 'form' && (
                        <div className="grid lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="lg:col-span-3">
                                <div className="mb-8">
                                    <h1 className="text-4xl md:text-5xl font-extralight mb-3">
                                        Método de <span className="font-semibold text-brand-primary">Pago</span>
                                    </h1>
                                    <p className="text-gray-400 font-light">Transacción segura encriptada punto a punto.</p>
                                </div>

                                <div className="glass p-8 rounded-3xl space-y-6 shadow-2xl">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-3 ml-1">Número de tarjeta</label>
                                        <div className="relative">
                                            <CreditCard size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                                            <input
                                                type="text"
                                                value={cardData.number}
                                                onChange={(e) => handleInputChange('number', e.target.value)}
                                                placeholder="1234 5678 9012 3456"
                                                className={`input-field w-full pl-12 pr-16 py-4 rounded-xl text-white ${errors.number ? 'error animate-shake' : ''}`}
                                                disabled={isProcessing}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                                                {getCardType(cardData.number) === 'visa' && <span className="text-blue-400 font-bold text-xs">VISA</span>}
                                                {getCardType(cardData.number) === 'mastercard' && <span className="text-orange-400 font-bold text-xs">MASTERCARD</span>}
                                            </div>
                                        </div>
                                        {errors.number && <p className="text-red-400 text-xs mt-2 ml-1 flex gap-1 items-center"><X size={12}/> {errors.number}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-3 ml-1">Nombre del titular</label>
                                        <div className="relative">
                                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                                            <input
                                                type="text"
                                                value={cardData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                placeholder="NOMBRE SIN NÚMEROS"
                                                className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white ${errors.name ? 'error animate-shake' : ''}`}
                                                disabled={isProcessing}
                                            />
                                        </div>
                                        {errors.name && <p className="text-red-400 text-xs mt-2 ml-1 flex gap-1 items-center"><X size={12}/> {errors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-3 ml-1">Expiración</label>
                                            <div className="relative">
                                                <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                                                <input
                                                    type="text"
                                                    value={cardData.expiry}
                                                    onChange={(e) => handleInputChange('expiry', e.target.value)}
                                                    placeholder="MM/AA"
                                                    className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white ${errors.expiry ? 'error animate-shake' : ''}`}
                                                    disabled={isProcessing}
                                                />
                                            </div>
                                            {errors.expiry && <p className="text-red-400 text-xs mt-2 ml-1">{errors.expiry}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-3 ml-1">CVV</label>
                                            <div className="relative">
                                                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
                                                <input
                                                    type="password"
                                                    value={cardData.cvv}
                                                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                                                    placeholder="123"
                                                    maxLength={4}
                                                    className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white ${errors.cvv ? 'error animate-shake' : ''}`}
                                                    disabled={isProcessing}
                                                />
                                            </div>
                                            {errors.cvv && <p className="text-red-400 text-xs mt-2 ml-1">{errors.cvv}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-200 transition flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? <><Loader2 className="animate-spin" size={20}/> Procesando...</> : <><Lock size={18}/> Pagar {displayData.total?.toFixed(2)}€</>}
                                        </button>
                                        <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-tighter">Certificado SSL 256 bits • PCI-DSS Compliant</p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="glass p-8 rounded-3xl sticky top-8 border-brand-primary/20">
                                    <h3 className="text-xl font-medium mb-6">Detalles de Reserva</h3>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-gray-400 text-xs mb-1 uppercase">Instalación</p>
                                                <p className="text-lg font-medium">{displayData.facility}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs mb-1 uppercase">Fecha y Hora</p>
                                            <p className="font-medium">{displayData.date}</p>
                                            <p className="text-sm text-brand-primary font-mono">{displayData.time}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-white/10 pt-6 space-y-3">
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Subtotal</span>
                                            <span>{displayData.price?.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400 text-sm">
                                            <span>Tasas / IVA</span>
                                            <span>{displayData.tax?.toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between text-2xl font-bold pt-3 border-t border-white/10 text-white">
                                            <span>Total</span>
                                            <span>{displayData.total?.toFixed(2)}€</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <div className="glass p-12 rounded-3xl text-center max-w-md w-full border-brand-primary/30">
                                <Loader2 size={64} className="animate-spin text-brand-primary mx-auto mb-8" />
                                <h2 className="text-3xl font-light mb-4 italic">Verificando <span className="font-bold not-italic">pago...</span></h2>
                                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mt-6">
                                    <div className="bg-brand-primary h-full transition-all duration-300" style={{width: `${progress}%`}}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
                            <div className="glass p-12 rounded-3xl text-center mb-8 border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                                <div className="w-20 h-20 mx-auto mb-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                                    <Check size={40} className="text-green-400" />
                                </div>
                                <h2 className="text-4xl font-bold mb-4 text-white">¡Reserva Confirmada!</h2>
                                <p className="text-gray-400 mb-8 font-light">Se ha enviado una copia del recibo a tu correo.</p>
                                <div className="flex gap-4 justify-center">
                                    <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-3 glass rounded-full hover:bg-white/10 transition cursor-pointer border-none font-medium">
                                        <Download size={18} /> Imprimir
                                    </button>
                                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full hover:bg-gray-200 transition cursor-pointer border-none font-bold">
                                        Ir al Panel
                                    </button>
                                </div>
                            </div>

                            <div className="glass p-8 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="font-bold text-lg mb-1">TICKET DE ACCESO</p>
                                        <p className="text-xs text-gray-500">RESIDENCIAL COMPLEJO</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase">Referencia</p>
                                        <p className="font-mono text-xs">#PK-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-6 mb-8">
                                    <div><p className="text-[10px] text-gray-500 uppercase">Instalación</p><p className="font-medium">{displayData.facility}</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase">Fecha</p><p className="font-medium">{displayData.date}</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase">Horario</p><p className="font-medium">{displayData.time}</p></div>
                                    <div><p className="text-[10px] text-gray-500 uppercase">Titular</p><p className="font-medium">{cardData.name}</p></div>
                                </div>

                                <div className="pt-6 border-t border-dashed border-white/20 flex justify-between items-center">
                                    <p className="text-xs font-mono">•••• •••• •••• {cardData.number.slice(-4)}</p>
                                    <p className="text-2xl font-black">{displayData.total?.toFixed(2)}€</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="flex items-center justify-center min-h-[500px]">
                            <div className="glass p-12 rounded-3xl text-center max-w-md border-red-500/30">
                                <div className="w-20 h-20 mx-auto mb-8 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/50">
                                    <X size={40} className="text-red-400" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Error en el Pago</h2>
                                <p className="text-gray-400 mb-8 font-light">La transacción ha sido rechazada por el banco o la pista ya no está disponible.</p>
                                <div className="space-y-3">
                                    <button onClick={() => setStep('form')} className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition cursor-pointer border-none">
                                        Reintentar Pago
                                    </button>
                                    <button onClick={() => navigate('/dashboard')} className="w-full py-4 glass rounded-full hover:bg-white/10 transition cursor-pointer border-none font-medium">
                                        Cancelar y Salir
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}