import React, { useState, useRef, useEffect } from 'react';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, Lock } from 'lucide-react';

export default function PasswordResetPage() {
  const [step, setStep] = useState<'code' | 'password'>('code');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('usuario@ejemplo.com');
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Obtener email del localStorage (simulado)
  useEffect(() => {
    const userEmail = 'usuario@ejemplo.com'; // En producción: localStorage.getItem('resetEmail')
    if (userEmail) {
      setEmail(userEmail);
    }
  }, []);

  // Manejo de inputs del código
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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

  // Verificar código
  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // En producción:
      // const response = await fetch('http://localhost:8000/api/v1/auth/verify-reset-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code: fullCode }),
      // });

      setStep('password');
    } catch (error: any) {
      setError('Código inválido o expirado');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Validar contraseña
  const validatePassword = () => {
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  // Restablecer contraseña
  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setIsLoading(true);
    setError('');

    try {
      // Simulación de API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // En producción:
      // const response = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, code: code.join(''), password }),
      // });

      alert('¡Contraseña restablecida exitosamente!');
      // navigate('/login');
    } catch (error: any) {
      setError('Error al restablecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col justify-center items-center">
      {/* Fondo */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-purple-900/20" />
      </div>

      {/* Navbar Simple */}
      <nav className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between">
        <button className="flex items-center gap-2 hover:opacity-70 transition bg-transparent border-none cursor-pointer text-white">
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
            {step === 'code' ? (
              <KeyRound size={32} className="text-white" />
            ) : (
              <Lock size={32} className="text-white" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extralight mb-4 text-white">
            {step === 'code' ? (
              <>
                Recupera tu<br/>
                <span className="font-semibold">contraseña.</span>
              </>
            ) : (
              <>
                Nueva<br/>
                <span className="font-semibold">contraseña.</span>
              </>
            )}
          </h1>
          <p className="text-gray-400 font-light px-4">
            {step === 'code' ? (
              <>
                Hemos enviado un código de 6 dígitos a<br/>
                <span className="text-white font-medium">{email}</span>
              </>
            ) : (
              'Crea una contraseña segura para tu cuenta'
            )}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl">

          {step === 'code' ? (
            <>
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

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              {/* Botón verificar código */}
              <button
                onClick={handleVerifyCode}
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

              {/* Tips */}
              <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                <p className="text-xs text-purple-200 text-center leading-relaxed">
                  💡 <strong>Tip:</strong> Revisa tu carpeta de Spam. El código expira en 15 minutos.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Formulario de nueva contraseña */}
              <div className="space-y-5">
                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-white/5 border-2 border-white/10 text-white rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full bg-white/5 border-2 border-white/10 text-white rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-gray-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Requisitos de contraseña */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <p className="text-xs text-gray-400 font-medium mb-2">Tu contraseña debe contener:</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className={`text-xs ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                        Mínimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${password && confirmPassword && password === confirmPassword ? 'bg-green-500' : 'bg-gray-600'}`} />
                      <span className={`text-xs ${password && confirmPassword && password === confirmPassword ? 'text-green-400' : 'text-gray-500'}`}>
                        Las contraseñas coinciden
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              {/* Botón restablecer */}
              <button
                onClick={handleResetPassword}
                disabled={isLoading || !password || !confirmPassword}
                className="w-full bg-white text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Restableciendo...</span>
                  </>
                ) : (
                  <>
                    <span>Restablecer contraseña</span>
                    <CheckCircle size={20} />
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button className="text-sm text-gray-500 hover:text-white transition bg-transparent border-none cursor-pointer">
            ¿Recordaste tu contraseña? <span className="underline">Iniciar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}