import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import toast from "react-hot-toast";
import { auth, googleProvider, githubProvider } from "../../config/Firebase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login social
  const authenticateWithBackendSocial = async (firebaseToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: firebaseToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error en el backend');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      return true;
    } catch (error) {
      console.error("Error backend social:", error);
      toast.error("Error al conectar con el servidor.");
      return false;
    }
  };

  const handleSocialLogin = async (provider: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Iniciando sesión...');

    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const success = await authenticateWithBackendSocial(token);

      if (success) {
        toast.success("¡Bienvenido!", { id: loadingToast });
        navigate('/dashboard');
      } else {
        toast.dismiss(loadingToast);
      }
    } catch (error: any) {
      console.error(error);
      toast.error('Error: ' + error.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  // Login normal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Verificando credenciales...');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Credenciales incorrectas');
      }

      // Guardamos el token
      localStorage.setItem('token', data.access_token);

      // Éxito y redirección
      toast.success('¡Bienvenido de vuelta!', { id: loadingToast });
      navigate('/dashboard');

    } catch (error: any) {
      console.error("Error login:", error);
      toast.error(error.message || "Error al iniciar sesión", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col">
      {/* Fondo */}
      <div className="fixed inset-0 z-0">
        <img
           src="/images/comunidad_1.jpg"
           alt="Background"
           className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      {/* Menu */}
      <nav className="relative z-10 px-6 py-6 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
             onClick={() => navigate('/')}
             className="flex items-center gap-2 hover:opacity-70 transition cursor-pointer bg-transparent border-none"
          >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg text-white">RESIDENCIAL</span>
          </button>
          <button
             onClick={() => navigate('/register')}
             className="text-sm text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
          >
            ¿No tienes cuenta? <span className="font-medium text-white">Regístrate</span>
          </button>
        </div>
      </nav>

      {/* Formulario Login */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extralight mb-4 text-white">
              Bienvenido<br/>
              <span className="font-semibold">de vuelta.</span>
            </h1>
            <p className="text-gray-400 font-light">
              Accede a tu cuenta para gestionar tus reservas
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl">
            {/* Campo email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail
                   size={20}
                   className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-white bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none transition-all placeholder-gray-600"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Campo contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock
                   size={20}
                   className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl text-white bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 focus:outline-none transition-all placeholder-gray-600"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Opciones extra */}
            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                   type="checkbox"
                   className="w-4 h-4 rounded border-gray-600 bg-transparent cursor-pointer accent-white"
                />
                <span className="text-gray-400 group-hover:text-white transition">
                  Recordarme
                </span>
              </label>
              <button
                type="button"
                className="text-gray-400 hover:text-white transition font-medium bg-transparent border-none cursor-pointer p-0"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg shadow-white/5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Accediendo...</span>
                </>
              ) : (
                <>
                  <span>Acceder</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black/50 backdrop-blur-sm text-gray-500 rounded-full">
                  o continúa con
                </span>
              </div>
            </div>

            {/* Botones sociales */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSocialLogin(googleProvider)}
                disabled={isLoading}
                className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium text-white">Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin(githubProvider)}
                disabled={isLoading}
                className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                <span className="text-sm font-medium text-white">GitHub</span>
              </button>
            </div>

            {/* Footer links */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                ¿Necesitas ayuda?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/support')}
                  className="text-white hover:text-gray-300 transition font-medium bg-transparent border-none cursor-pointer underline decoration-transparent hover:decoration-white"
                >
                  Contacta con soporte
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}