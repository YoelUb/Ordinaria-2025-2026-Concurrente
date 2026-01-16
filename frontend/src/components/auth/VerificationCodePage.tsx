import React, { useState, useRef, useEffect } from 'react';
import { Mail, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function VerificationCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Obtener email del usuario
  useEffect(() => {
    const userEmail = localStorage.getItem('pendingVerificationEmail');
    if (userEmail) {
      setEmail(userEmail);
    } else {
      // Si no hay email, redirigir al registro (acceso no autorizado)
      navigate('/register');
      toast.error("No hay un proceso de verificación pendiente.");
    }
  }, [navigate]);

  // Timer para reenvío
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Manejo de inputs
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return; // Solo números

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus siguiente
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Manejo de inputs (Borrar)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Manejo de inputs (Pegar código completo)
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, idx) => {
      if (idx < 6) newCode[idx] = char;
    });
    setCode(newCode);

    const nextEmpty = newCode.findIndex(c => !c);
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  // Verificar código back
  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('El código debe tener 6 dígitos.');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Verificando código...');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: fullCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Código inválido');
      }

      // Éxito
      toast.success("¡Cuenta verificada! Redirigiendo...", { id: loadingToast });
      localStorage.removeItem('pendingVerificationEmail');

      setTimeout(() => navigate('/login'), 1500);

    } catch (error: any) {
      console.error("Error verificación:", error);
      toast.error(error.message, { id: loadingToast });
      // Limpiar inputs para reintentar
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código back
  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    const loadingToast = toast.loading('Enviando nuevo código...');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      });

      if (!response.ok) throw new Error('Error al reenviar');

      toast.success("Código reenviado. Revisa tu correo.", { id: loadingToast });
      setResendTimer(60);

    } catch (error: any) {
      console.error("Error reenvío:", error);
      toast.error('No se pudo reenviar. Inténtalo más tarde.', { id: loadingToast });
    } finally {
      setIsResending(false);
    }
  };

  // Auto-verificar al completar
  useEffect(() => {
    if (code.every(digit => digit !== '') && !isLoading) {
      handleVerify();
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col justify-center items-center">
      {/* Fondo */}
      <div className="fixed inset-0 z-0">
        <img
          src="/images/comunidad_3.jpg"
          alt="Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-purple-900/20 backdrop-blur-sm" />
      </div>

      {/* Navbar Simple */}
      <nav className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-70 transition bg-transparent border-none cursor-pointer text-white"
        >
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-lg">RESIDENCIAL</span>
        </button>
      </nav>

      {/* Contenido Central */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 shadow-lg shadow-purple-500/20">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extralight mb-4 text-white">
            Verifica tu<br/>
            <span className="font-semibold">correo.</span>
          </h1>
          <p className="text-gray-400 font-light px-4">
            Hemos enviado un código de 6 dígitos a<br/>
            <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-8 shadow-2xl">

          {/* Inputs del Código */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-6 text-center">
              Introduce el código de seguridad
            </label>

            <div className="flex gap-2 justify-center">
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
                    w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl
                    bg-white/5 text-white border-2 transition-all duration-200
                    focus:outline-none focus:bg-white/10
                    ${digit 
                      ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                      : 'border-white/10 focus:border-purple-500/50'
                    }
                  `}
                />
              ))}
            </div>
          </div>

          {/* Botón verificar */}
          <button
            onClick={handleVerify}
            disabled={isLoading || code.join('').length !== 6}
            className="w-full bg-white text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <span>Verificar código</span>
                <CheckCircle size={20} />
              </>
            )}
          </button>

          {/* Reenviar */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-sm text-gray-500 mb-3">¿No recibiste el código?</p>
            <button
              onClick={handleResend}
              disabled={isResending || resendTimer > 0}
              className="text-white hover:text-purple-300 transition font-medium bg-transparent border-none cursor-pointer flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
              {isResending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : resendTimer > 0 ? (
                <span className="text-gray-400">Reenviar en {resendTimer}s</span>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span className="underline decoration-transparent hover:decoration-purple-300">Reenviar código</span>
                </>
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
            <p className="text-xs text-purple-200 text-center leading-relaxed">
              💡 <strong>Tip:</strong> Revisa tu carpeta de Spam. El código expira en 15 minutos.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/register')}
            className="text-sm text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer"
          >
            ¿Email incorrecto? <span className="underline">Volver al registro</span>
          </button>
        </div>
      </div>
    </div>
  );
}