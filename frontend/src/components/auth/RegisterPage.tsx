import {useState, useEffect, useRef} from 'react';
import {Lock, Mail, Eye, EyeOff, User, Phone, ArrowRight, Home, AlertCircle, MapPin, Loader2} from 'lucide-react';
import {signInWithPopup} from "firebase/auth";
import {auth, googleProvider, githubProvider} from "../../config/Firebase";
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';

// --- Expresiones Regulares ---
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;
const APARTMENT_REGEX = /^\d+\s*[A-Z]+$/;
const POSTAL_CODE_REGEX = /^\d{5}$/;
const PHONE_REGEX = /^(6|7)[0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type PhotonFeature = {
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        country?: string;
        state?: string;
    };
};

export default function RegisterPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        postalCode: '',
        apartment: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<PhotonFeature[]>([]);
    const [showAddressMenu, setShowAddressMenu] = useState(false);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // --- Manejador de cambios con Filtro de Números en Nombre ---
    const handleChange = (field: string, value: string) => {
        let finalValue = value;

        // BLINDAJE: Si es el nombre, eliminamos números en tiempo real
        if (field === 'name') {
            finalValue = value.replace(/[0-9]/g, '');
        }

        // Convertir apartamento a mayúsculas automáticamente
        if (field === 'apartment') {
            finalValue = value.toUpperCase();
        }

        setFormData(prev => ({...prev, [field]: finalValue}));
        if (field === 'address') setShowAddressMenu(true);
        if (errors[field]) setErrors(prev => ({...prev, [field]: ''}));
    };

    // --- Autocompletado Photon ---
    useEffect(() => {
        if (formData.address.length < 3 || !showAddressMenu) {
            setAddressSuggestions([]);
            return;
        }
        const timeoutId = setTimeout(async () => {
            setLoadingAddress(true);
            try {
                const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(formData.address)}&limit=5`);
                if (response.ok) {
                    const data = await response.json();
                    setAddressSuggestions(data.features || []);
                }
            } catch (error) {
                console.error("Error address", error);
            } finally {
                setLoadingAddress(false);
            }
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [formData.address, showAddressMenu]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setAddressSuggestions([]);
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectAddress = (feature: PhotonFeature) => {
        const p = feature.properties;
        const streetPart = p.street || p.name || "";
        const numberPart = p.housenumber ? ` ${p.housenumber}` : "";
        const cityPart = p.city ? `, ${p.city}` : "";
        const fullAddress = `${streetPart}${numberPart}${cityPart}`;
        setFormData(prev => ({...prev, address: fullAddress, postalCode: p.postcode || prev.postalCode}));
        setAddressSuggestions([]);
        setShowAddressMenu(false);
    };

    // --- Validaciones de Formulario ---
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Validar Nombre
        if (!formData.name.trim() || formData.name.length < 3) {
            newErrors.name = "Mínimo 3 caracteres.";
        } else if (!NAME_REGEX.test(formData.name)) {
            newErrors.name = "Solo letras permitidas.";
        }

        // Validar Email
        if (!formData.email.trim()) {
            newErrors.email = "El email es obligatorio.";
        } else if (!EMAIL_REGEX.test(formData.email)) {
            newErrors.email = "Formato de email inválido.";
        }

        // Validar Dirección (No solo números)
        if (!formData.address.trim() || formData.address.length < 5) {
            newErrors.address = "Dirección demasiado corta.";
        } else if (/^\d+$/.test(formData.address)) {
            newErrors.address = "Escribe una calle válida.";
        }

        // Validar Apartamento
        if (!APARTMENT_REGEX.test(formData.apartment)) {
            newErrors.apartment = "Formato inválido (Ej: 4B).";
        }

        // Validar Teléfono
        const cleanPhone = formData.phone.replace(/[\s-]/g, '');
        if (!PHONE_REGEX.test(cleanPhone)) {
            newErrors.phone = "Teléfono de 9 a 15 dígitos.";
        }

        // Validar CP
        if (!POSTAL_CODE_REGEX.test(formData.postalCode)) {
            newErrors.postalCode = "CP de 5 dígitos.";
        }

        // Validar Passwords
        if (formData.password.length < 8) {
            newErrors.password = "Mínimo 8 caracteres.";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const authenticateWithBackendSocial = async (firebaseToken: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login/social', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token: firebaseToken}),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Error en el servidor');
            localStorage.setItem('token', data.access_token);
            return true;
        } catch (error: any) {
            throw error;
        }
    };

    const handleSocialLogin = async (provider: any) => {
        if (!acceptTerms) {
            toast.error('Acepta los términos y condiciones.');
            return;
        }
        if (!provider) {
            toast("Próximamente", {icon: '🚧'});
            return;
        }
        setIsLoading(true);
        const loadingToast = toast.loading('Conectando...');
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            await authenticateWithBackendSocial(token);
            toast.success("¡Bienvenido!", {id: loadingToast});
            navigate('/dashboard');
        } catch (error: any) {
            toast.error("Error al registrarse", {id: loadingToast});
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Revisa los errores en el formulario");
            return;
        }
        if (!acceptTerms) {
            toast.error('Acepta los términos y condiciones');
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading('Creando cuenta...');

        try {
            const payload = {
                email: formData.email,
                full_name: formData.name,
                password: formData.password,
                apartment: formData.apartment,
                phone: formData.phone,
                address: formData.address,
                postal_code: formData.postalCode,
                is_active: false
            };

            const response = await fetch('http://localhost:8000/api/v1/users/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error en el registro');
            }

            localStorage.setItem('pendingVerificationEmail', formData.email);
            toast.success('¡Registro casi listo! Verifica tu email.', {id: loadingToast});
            navigate('/verify-email');
        } catch (error: any) {
            toast.error(error.message, {id: loadingToast});
        } finally {
            setIsLoading(false);
        }
    };

    const getInputClass = (fieldName: string) => `w-full pl-12 pr-4 py-4 rounded-xl text-white border-2 ${errors[fieldName] ? 'bg-red-500/10 border-red-500 animate-shake' : 'bg-white/5 border-white/10 focus:border-white/30'} focus:outline-none transition-all duration-200`;

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <style>{`
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
            <div className="fixed inset-0 z-0">
                <img src="/images/comunidad_3.jpg" alt="Background" className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
            </div>

            <nav className="relative z-10 px-6 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button onClick={() => navigate('/')}
                            className="flex items-center gap-2 bg-transparent border-none cursor-pointer">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">R</span>
                        </div>
                        <span className="font-semibold text-white">RESIDENCIAL</span>
                    </button>
                    <button onClick={() => navigate('/login')}
                            className="text-sm text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
                        ¿Ya tienes cuenta? <span className="font-medium text-white">Inicia sesión</span>
                    </button>
                </div>
            </nav>

            <div className="relative z-10 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-12">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
                            <User size={28}/>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extralight mb-4 text-white">Únete a<br/><span
                            className="font-semibold">la comunidad.</span></h1>
                    </div>

                    <div
                        className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl">
                        {/* Fila 1: Nombre y Teléfono */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre completo</label>
                                <div className="relative">
                                    <User size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.name ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className={getInputClass('name')}
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                                {errors.name && <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                    size={14}/> {errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Teléfono</label>
                                <div className="relative">
                                    <Phone size={20}
                                           className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.phone ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className={getInputClass('phone')}
                                        placeholder="+34 600 000 000"
                                    />
                                </div>
                                {errors.phone && <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                    size={14}/> {errors.phone}</div>}
                            </div>
                        </div>

                        {/* Fila 2: Dirección y CP */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 relative" ref={wrapperRef}>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Dirección</label>
                                <div className="relative">
                                    <MapPin size={20}
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.address ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        className={getInputClass('address')}
                                        placeholder="Busca tu calle..."
                                        autoComplete="off"
                                    />
                                    {loadingAddress &&
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={18}
                                                                                                            className="animate-spin text-gray-400"/>
                                        </div>}
                                </div>
                                {addressSuggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((item, index) => (
                                            <li key={index} onClick={() => handleSelectAddress(item)}
                                                className="px-4 py-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 transition-colors">
                                                <div
                                                    className="text-white text-sm font-medium">{item.properties.name || item.properties.street} {item.properties.housenumber}</div>
                                                <div
                                                    className="text-gray-400 text-xs mt-0.5">{item.properties.postcode} {item.properties.city}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.address &&
                                    <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                        size={14}/> {errors.address}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">C. Postal</label>
                                <div className="relative">
                                    <MapPin size={20}
                                            className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.postalCode ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={(e) => handleChange('postalCode', e.target.value)}
                                        className={getInputClass('postalCode')}
                                        placeholder="28001"
                                        maxLength={5}
                                    />
                                </div>
                                {errors.postalCode &&
                                    <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                        size={14}/> {errors.postalCode}</div>}
                            </div>
                        </div>

                        {/* Fila 3: Apartamento y Email */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Apartamento (Nº y
                                    Letra)</label>
                                <div className="relative">
                                    <Home size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.apartment ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="text"
                                        value={formData.apartment}
                                        onChange={(e) => handleChange('apartment', e.target.value)}
                                        className={getInputClass('apartment')}
                                        placeholder="4B"
                                    />
                                </div>
                                {errors.apartment &&
                                    <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                        size={14}/> {errors.apartment}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Correo
                                    electrónico</label>
                                <div className="relative">
                                    <Mail size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className={getInputClass('email')}
                                        placeholder="tu@email.com"
                                    />
                                </div>
                                {errors.email && <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                    size={14}/> {errors.email}</div>}
                            </div>
                        </div>

                        {/* Fila 4: Passwords */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Contraseña</label>
                                <div className="relative">
                                    <Lock size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className={getInputClass('password')}
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer">
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                {errors.password &&
                                    <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                        size={14}/> {errors.password}</div>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar</label>
                                <div className="relative">
                                    <Lock size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className={getInputClass('confirmPassword')}
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white bg-transparent border-none cursor-pointer">
                                        {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                {errors.confirmPassword &&
                                    <div className="text-red-300 text-sm mt-1 ml-1 flex gap-1"><AlertCircle
                                        size={14}/> {errors.confirmPassword}</div>}
                            </div>
                        </div>

                        {/* Checkbox y Botones */}
                        <div className="pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-600 bg-transparent cursor-pointer mt-0.5 accent-white"
                                />
                                <span
                                    className="text-sm text-gray-400 group-hover:text-white transition leading-relaxed">
                                    Acepto los términos y la política de privacidad.
                                </span>
                            </label>
                        </div>

                        <button onClick={handleSubmit} disabled={isLoading}
                                className="w-full bg-white text-black py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-2 border-none cursor-pointer">
                            {isLoading ? <Loader2 className="animate-spin"/> : <><span>Crear cuenta</span><ArrowRight
                                size={20}/></>}
                        </button>

                        {/* Sociales */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"/>
                            </div>
                            <div className="relative flex justify-center text-sm"><span
                                className="px-4 bg-black text-gray-500">o regístrate con</span></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Google */}
                            <button type="button" onClick={() => handleSocialLogin(googleProvider)}
                                    className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer bg-transparent text-white">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="text-sm font-medium hidden sm:block">Google</span>
                            </button>

                            {/* Facebook */}
                            <button type="button" onClick={() => handleSocialLogin(null)}
                                    className="py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer bg-transparent text-white">
                                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span className="text-sm font-medium hidden sm:block">Facebook</span>
                            </button>

                            {/* GitHub */}
                            <button type="button" onClick={() => handleSocialLogin(githubProvider)}
                                    className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer bg-transparent text-white">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                                </svg>
                                <span className="text-sm font-medium hidden sm:block">GitHub</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}