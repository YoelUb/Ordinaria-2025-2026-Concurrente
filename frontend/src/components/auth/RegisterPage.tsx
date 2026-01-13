import {useState} from 'react';
import {Lock, Mail, Eye, EyeOff, User, Phone, ArrowRight, Home, AlertCircle, MapPin} from 'lucide-react';
import {signInWithPopup} from "firebase/auth";
import {auth, googleProvider, githubProvider} from "../../config/Firebase";
import {useNavigate} from 'react-router-dom';

// Expresiones Regulares
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/; // Solo letras y espacios
const APARTMENT_REGEX = /^\d+\s*[a-zA-Z]+$/; // Número seguido de letra
const POSTAL_CODE_REGEX = /^\d{5}$/; // Exactamente 5 dígitos

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

    // Estado para errores individuales por campo
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    // --- Validación de formulario ---
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Validación Nombre: Sin números
        if (!formData.name.trim() || formData.name.length < 3) {
            newErrors.name = "Mínimo 3 caracteres.";
        } else if (!NAME_REGEX.test(formData.name)) {
            newErrors.name = "El nombre no puede contener números.";
        }

        // Validación Dirección
        if (!formData.address.trim()) {
            newErrors.address = "La dirección es obligatoria.";
        }

        // Validación Código Postal
        if (!POSTAL_CODE_REGEX.test(formData.postalCode)) {
            newErrors.postalCode = "Código postal inválido (5 dígitos).";
        }

        // Validación Apartamento: Número y Letra
        if (!formData.apartment.trim()) {
            newErrors.apartment = "El apartamento es obligatorio.";
        } else if (!APARTMENT_REGEX.test(formData.apartment)) {
            newErrors.apartment = "Formato inválido (Ej: 4B, 12A).";
        }

        // Validación Email
        if (!EMAIL_REGEX.test(formData.email)) {
            newErrors.email = "Introduce un correo electrónico válido.";
        }

        // Validación Teléfono
        const cleanPhone = formData.phone.replace(/[\s-]/g, '');
        if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
            newErrors.phone = "Teléfono inválido (mínimo 9 dígitos).";
        }

        // Validación Contraseña
        if (!PASSWORD_REGEX.test(formData.password)) {
            newErrors.password = "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número.";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        // Limpiar error del campo específico al escribir
        if (errors[field]) {
            setErrors(prev => ({...prev, [field]: ''}));
        }
    };

    // Registro social
    const authenticateWithBackendSocial = async (firebaseToken: string) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login/social', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token: firebaseToken}),
            });

            if (!response.ok) throw new Error('Error en el backend');
            const data = await response.json();

            localStorage.setItem('token', data.access_token);
            return true;
        } catch (error) {
            console.error("Error backend:", error);
            alert("Error conectando con el servidor.");
            return false;
        }
    };

    const handleSocialLogin = async (provider: any) => {
        if (!acceptTerms) {
            alert('Por favor, acepta los términos y condiciones para continuar.');
            return;
        }

        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
            const success = await authenticateWithBackendSocial(token);

            if (success) {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error(error);
            alert('Error en registro social: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

   const handleSubmit = async () => {
    // Validar antes de enviar
    if (!validateForm()) return;

    // Verificar términos
    if (!acceptTerms) {
        alert('Debes aceptar los términos y condiciones');
        return;
    }

    setIsLoading(true);
    try {
        // Preparar datos para el backend
        // NOTA: Asegúrate de que el backend acepte 'address' y 'postal_code'
        const payload = {
            email: formData.email,
            full_name: formData.name,
            password: formData.password,
            apartment: formData.apartment,
            phone: formData.phone,
            address: formData.address,          // Nuevo campo enviado
            postal_code: formData.postalCode,   // Nuevo campo enviado
            is_active: false
        };

        const response = await fetch('http://localhost:8000/api/v1/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.detail?.includes("email") || errorData.detail?.includes("registrado")) {
                setErrors(prev => ({...prev, email: "Este email ya está registrado."}));
                throw new Error("Email duplicado");
            }
            throw new Error(errorData.detail || 'Error al registrar usuario');
        }

        const data = await response.json();
        console.log("Usuario creado:", data);

        localStorage.setItem('pendingVerificationEmail', formData.email);
        alert('¡Cuenta creada con éxito! Revisa tu correo para obtener el código de verificación.');
        navigate('/verify-email');

    } catch (error: any) {
        console.error("Error registro:", error);
        if (error.message !== "Email duplicado") {
            alert('Ocurrió un error: ' + error.message);
        }
    } finally {
        setIsLoading(false);
    }
};

    const getInputClass = (fieldName: string) => `
    w-full pl-12 pr-4 py-4 rounded-xl text-white border-2
    ${errors[fieldName]
        ? 'bg-red-500/10 border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-500/20 animate-shake'
        : 'bg-white/5 border-white/10 focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10'
    } 
    focus:outline-none transition-all duration-200
  `;

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden relative">
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

            <div className="fixed inset-0 z-0">
                <img
                    src="/images/comunidad_3.jpg"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
            </div>

            <nav className="relative z-10 px-6 py-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 hover:opacity-70 transition bg-transparent border-none cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">R</span>
                        </div>
                        <span className="font-semibold">RESIDENCIAL</span>
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
                    >
                        ¿Ya tienes cuenta? <span className="font-medium">Inicia sesión</span>
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
                        <h1 className="text-5xl md:text-6xl font-extralight mb-4">
                            Únete a<br/>
                            <span className="font-semibold">la comunidad.</span>
                        </h1>
                        <p className="text-gray-400 font-light">
                            Crea tu cuenta y disfruta de todas las instalaciones
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl space-y-6">

                        {/* FILA 1: NOMBRE Y TELÉFONO */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Nombre */}
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
                                {errors.name && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Teléfono */}
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
                                {errors.phone && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FILA 2: DIRECCIÓN Y CÓDIGO POSTAL */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Dirección</label>
                                <div className="relative">
                                    <MapPin size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.address ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleChange('address', e.target.value)}
                                        className={getInputClass('address')}
                                        placeholder="C/ Ejemplo 123"
                                    />
                                </div>
                                {errors.address && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.address}</p>
                                    </div>
                                )}
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
                                {errors.postalCode && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.postalCode}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FILA 3: APARTAMENTO Y EMAIL */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Apartamento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Apartamento (Nº y Letra)</label>
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
                                {errors.apartment && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.apartment}</p>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Correo electrónico</label>
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
                                {errors.email && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FILA 4: CONTRASEÑAS */}
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
                                        className={`${getInputClass('password')} pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.password}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Confirmar contraseña</label>
                                <div className="relative">
                                    <Lock size={20}
                                          className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-500'}`}/>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                        className={`${getInputClass('confirmPassword')} pr-12`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2 flex items-start gap-2 animate-fade-in">
                                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                                        <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Términos y Botones (Sin cambios estructurales) */}
                        <div className="pt-4">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={acceptTerms}
                                    onChange={(e) => setAcceptTerms(e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-600 bg-transparent cursor-pointer mt-0.5 accent-white"
                                />
                                <span className="text-sm text-gray-400 group-hover:text-white transition leading-relaxed">
                                    Acepto los{' '}
                                    <button type="button" onClick={() => navigate('/terms')} className="text-white font-medium hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 underline decoration-transparent hover:decoration-white">
                                        términos y condiciones
                                    </button>
                                    {' '}y la{' '}
                                    <button type="button" onClick={() => navigate('/privacy')} className="text-white font-medium hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 underline decoration-transparent hover:decoration-white">
                                        política de privacidad
                                    </button>
                                </span>
                            </label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-white text-black py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none"
                        >
                            {isLoading ? (
                                <span>Procesando...</span>
                            ) : (
                                <>
                                    <span>Crear cuenta</span>
                                    <ArrowRight size={20}/>
                                </>
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"/>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-black text-gray-500">o regístrate con</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin(googleProvider)}
                                className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin(githubProvider)}
                                className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                                </svg>
                                <span className="text-sm font-medium">GitHub</span>
                            </button>
                        </div>

                        <div className="text-center mt-8">
                            <p className="text-sm text-gray-500">
                                ¿Problemas con el registro?{' '}
                                <button type="button" onClick={() => navigate('/support')} className="text-white hover:text-gray-300 transition font-medium bg-transparent border-none cursor-pointer underline decoration-transparent hover:decoration-white">
                                    Contacta con la administración
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}