import { useState, useRef, useEffect } from 'react';
import { Mail, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function VerificationCodePage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Simular obtener el email del usuario que se acaba de registrar
  useEffect(() => {
    // En producción, obtener de localStorage, context, o parámetros de URL
    const userEmail = localStorage.getItem('pendingVerificationEmail') || 'usuario@ejemplo.com';
    setEmail(userEmail);
  }, []);

  // Timer para reenvío
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Manejo de cambio en inputs
  const handleChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(''); // Limpiar error al escribir

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejo de tecla borrar
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Manejo de pegado
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newCode[idx] = char;
    });
    setCode(newCode);

    // Focus en el último input llenado o el siguiente vacío
    const nextEmpty = newCode.findIndex(c => !c);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  // Verificar código
  const handleVerify = async () => {
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Por favor, introduce los 6 dígitos del código.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: fullCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Código inválido');
      }

      // Verificación exitosa
      localStorage.removeItem('pendingVerificationEmail');

      // Mostrar mensaje de éxito brevemente
      setError('');

      // Redirigir al login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);

    } catch (error: any) {
      console.error("Error verificación:", error);
      setError(error.message || 'Código incorrecto. Por favor, inténtalo de nuevo.');
      // Limpiar el código para reintentar
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código
  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) {
        throw new Error('Error al reenviar el código');
      }

      setResendTimer(60); // 60 segundos de espera
      setError('');

    } catch (error: any) {
      console.error("Error reenvío:", error);
      setError('No se pudo reenviar el código. Inténtalo más tarde.');
    } finally {
      setIsResending(false);
    }
  };

  // Auto-verificar cuando se completen los 6 dígitos
  useEffect(() => {
    if (code.every(digit => digit !== '') && !isLoading) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animaciones */}
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
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        
        /* Ocultar flechas de input number */
        input[type="text"]::-webkit-outer-spin-button,
        input[type="text"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

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
        </div>
      </nav>

      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-lg rounded-full mb-6 border border-white/20">
              <Mail size={28} />
            </div>
            <h1 className="text-5xl md:text-6xl font-extralight mb-4">
              Verifica tu<br/>
              <span className="font-semibold">correo.</span>
            </h1>
            <p className="text-gray-400 font-light">
              Hemos enviado un código de 6 dígitos a<br/>
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl space-y-6">

            {/* Código de verificación */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-4 text-center">
                Introduce el código de verificación
              </label>

              <div className="flex gap-3 justify-center mb-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className={`
                      w-14 h-16 text-center text-2xl font-bold rounded-xl
                      border-2 bg-white/5 text-white
                      focus:outline-none focus:ring-2 transition-all duration-200
                      ${error 
                        ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20 animate-shake' 
                        : 'border-white/10 focus:border-white/30 focus:ring-white/10'
                      }
                      ${digit ? 'border-white/30' : ''}
                    `}
                  />
                ))}
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2 animate-fade-in">
                  <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5"/>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Mensaje de carga */}
              {isLoading && !error && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center gap-2 animate-fade-in">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-blue-300 text-sm">Verificando código...</p>
                </div>
              )}
            </div>

            {/* Botón verificar (opcional, ya que auto-verifica) */}
            <button
              onClick={handleVerify}
              disabled={isLoading || code.join('').length !== 6}
              className="w-full bg-white text-black py-4 rounded-full font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              {isLoading ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <span>Verificar código</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Reenviar código */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500 mb-3">
                ¿No recibiste el código?
              </p>
              <button
                onClick={handleResend}
                disabled={isResending || resendTimer > 0}
                className="text-white hover:text-gray-300 transition font-medium bg-transparent border-none cursor-pointer underline decoration-transparent hover:decoration-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Reenviando...</span>
                  </>
                ) : resendTimer > 0 ? (
                  <span>Reenviar en {resendTimer}s</span>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Reenviar código</span>
                  </>
                )}
              </button>
            </div>

            {/* Tips */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                💡 <span className="text-gray-300">Tip:</span> Revisa tu carpeta de spam si no encuentras el correo.
                El código expira en 15 minutos.
              </p>
            </div>

            {/* Link de ayuda */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                ¿Problemas con la verificación?{' '}
                <button
                  type="button"
                  onClick={() => window.location.href = '/support'}
                  className="text-white hover:text-gray-300 transition font-medium bg-transparent border-none cursor-pointer underline decoration-transparent hover:decoration-white"
                >
                  Contacta con soporte
                </button>
              </p>
            </div>
          </div>

          {/* Cambiar email */}
          <div className="text-center mt-6">
            <button
              onClick={() => window.location.href = '/register'}
              className="text-sm text-gray-500 hover:text-gray-300 transition bg-transparent border-none cursor-pointer"
            >
              ¿Email incorrecto? Volver al registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}