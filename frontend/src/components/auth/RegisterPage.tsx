import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Phone, ArrowRight, Home } from 'lucide-react';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../../config/Firebase";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartment: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Registro social ---
  const authenticateWithBackendSocial = async (firebaseToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: firebaseToken }),
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
        alert(`¡Cuenta creada y sesión iniciada!`);
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error(error);
      alert('Error en registro social: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Registro normal
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);
    try {
      // Llamada al endpoint de creación de usuario en FastAPI
      const response = await fetch('http://localhost:8000/api/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          full_name: formData.name,
          password: formData.password,
          apartment: formData.apartment,
          phone: formData.phone,
          is_active: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar usuario');
      }

      const data = await response.json();
      console.log("Usuario creado:", data);

      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      window.location.href = '/login';

    } catch (error: any) {
      console.error("Error registro:", error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 rounded-xl text-white bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all";

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="fixed inset-0 z-0">
        <img
          src="/images/comunidad_3.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 hover:opacity-70 transition bg-transparent border-none cursor-pointer"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="font-semibold">RESIDENCIAL</span>
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-sm text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
          >
            ¿Ya tienes cuenta? <span className="font-medium">Inicia sesión</span>
          </button>
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 glass rounded-full mb-6">
              <User size={28} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extralight mb-4 text-glow">
              Únete a<br/>
              <span className="font-semibold">la comunidad.</span>
            </h1>
            <p className="text-gray-400 font-light">
              Crea tu cuenta y disfruta de todas las instalaciones
            </p>
          </div>

          <div className="glass p-8 rounded-3xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={inputClasses}
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Número de apartamento
                </label>
                <div className="relative">
                  <Home size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => handleChange('apartment', e.target.value)}
                    className={inputClasses}
                    placeholder="3B"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={inputClasses}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Teléfono
              </label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={inputClasses}
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`${inputClasses} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`${inputClasses} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

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
                  <button
                    type="button"
                    onClick={() => window.location.href = '/terms'}
                    className="text-white font-medium hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 underline decoration-transparent hover:decoration-white"
                  >
                    términos y condiciones
                  </button>
                  {' '}y la{' '}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/privacy'}
                    className="text-white font-medium hover:text-gray-300 bg-transparent border-none cursor-pointer p-0 underline decoration-transparent hover:decoration-white"
                  >
                    política de privacidad
                  </button>
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !acceptTerms}
              className="w-full bg-white text-black py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {isLoading ? (
                <span>Creando cuenta...</span>
              ) : (
                <>
                  <span>Crear cuenta</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Login social */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-gray-500">
                  o regístrate con
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin(googleProvider)}
                className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin(githubProvider)}
                className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                ¿Problemas con el registro?{' '}
                <button type="button" onClick={() => window.location.href = '/support'} className="text-white hover:text-gray-300 transition font-medium bg-transparent border-none cursor-pointer underline decoration-transparent hover:decoration-white">
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