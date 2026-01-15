import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PasswordResetPage() {
  const navigate = useNavigate();

  // Estados de navegación y datos
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  // Estados de contraseña
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- PASO 1: SOLICITAR CÓDIGO (Email) ---
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
        setError('Introduce un email válido');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success("Código enviado. Revisa tu correo.");
        setStep('code');
      } else {
        const data = await response.json();
        setError(data.detail || 'Error al solicitar el código');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // --- MANEJO DE INPUTS DEL CÓDIGO ---
  const handleCodeChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const newCode = [...code];
    pastedData.split('').forEach((char, idx) => { if (idx < 6) newCode[idx] = char; });
    setCode(newCode);
    const nextEmpty = newCode.findIndex(c => !c);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // --- PASO 2: VERIFICAR CÓDIGO (Visualmente) ---
  const handleVerifyCodeStep = () => {
    // Nota: Como el backend valida el código AL MISMO TIEMPO que cambia la contraseña,
    // aquí solo validamos longitud y pasamos al siguiente paso.
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('El código debe tener 6 dígitos completos.');
      return;
    }
    setError('');
    setStep('password');
  };

  // --- PASO 3: RESTABLECER CONTRASEÑA (Llamada final) ---
  const handleResetPassword = async () => {
    if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            code: code.join(''),
            new_password: password
        }),
      });

      if (response.ok) {
        toast.success('¡Contraseña restablecida exitosamente!');
        navigate('/login');
      } else {
        const data = await response.json();
        // Si falla, probablemente el código es erróneo
        if (data.detail && data.detail.includes('código')) {
            setStep('code'); // Volver al paso del código si estaba mal
            setCode(['','','','','','']); // Limpiar
        }
        setError(data.detail || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col justify-center items-center font-sans">
      {/* Fondo */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-purple-900/20" />
      </div>

      {/* Navbar Simple */}
      <nav className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 hover:opacity-70 transition bg-transparent border-none cursor-pointer text-white">
          {step !== 'email' && <ArrowLeft size={20} className="mr-1" />}
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-lg hidden sm:inline">RESIDENCIAL</span>
        </button>
      </nav>

      {/* Contenido Central */}
      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-6 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]">
            {step === 'email' ? <Mail size={32} className="text-white" /> :
             step === 'code' ? <KeyRound size={32} className="text-white" /> :
             <Lock size={32} className="text-white" />}
          </div>

          <h1 className="text-4xl md:text-5xl font-extralight mb-4 text-white tracking-tight">
            {step === 'email' && <>Recuperar<br/><span className="font-semibold">Acceso</span></>}
            {step === 'code' && <>Código de<br/><span className="font-semibold">Seguridad</span></>}
            {step === 'password' && <>Nueva<br/><span className="font-semibold">Contraseña</span></>}
          </h1>

          <p className="text-gray-400 font-light px-4 text-sm md:text-base">
            {step === 'email' && "Introduce tu email para recibir el código de recuperación."}
            {step === 'code' && <>Hemos enviado un código a <span className="text-white font-medium">{email}</span></>}
            {step === 'password' && "Crea una contraseña segura para tu cuenta."}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden group">
          {/* Efecto de borde brillante */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

          {/* PASO 1: EMAIL */}
          {step === 'email' && (
            <form onSubmit={handleRequestCode} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email Registrado</label>
                    <div className="relative">
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all placeholder:text-gray-600"
                            placeholder="nombre@ejemplo.com"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

                <button type="submit" disabled={isLoading} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 transform">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Enviar Código <ArrowRight size={20} /></>}
                </button>
            </form>
          )}

          {/* PASO 2: CÓDIGO */}
          {step === 'code' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">Introduce los 6 dígitos</label>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      onPaste={index === 0 ? handleCodePaste : undefined}
                      className={`
                        w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-xl
                        bg-black/40 text-white border-2 transition-all duration-200
                        focus:outline-none focus:bg-white/10
                        ${digit ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-white/10 focus:border-purple-500/50'}
                      `}
                    />
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button onClick={handleVerifyCodeStep} disabled={code.join('').length !== 6} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg">
                Continuar <ArrowRight size={20} />
              </button>

              <div className="text-center">
                <button onClick={() => setStep('email')} className="text-xs text-gray-500 hover:text-white underline bg-transparent border-none cursor-pointer">Cambiar email o reenviar</button>
              </div>
            </>
          )}

          {/* PASO 3: NUEVA CONTRASEÑA */}
          {step === 'password' && (
            <>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all placeholder:text-gray-600"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer p-1">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-purple-500/50 focus:bg-white/5 transition-all placeholder:text-gray-600"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer p-1">
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-2 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className={`text-xs ${password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${password && confirmPassword && password === confirmPassword ? 'bg-green-500' : 'bg-gray-600'}`} />
                    <span className={`text-xs ${password && confirmPassword && password === confirmPassword ? 'text-green-400' : 'text-gray-500'}`}>Coinciden</span>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

              <button onClick={handleResetPassword} disabled={isLoading || !password || !confirmPassword} className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border-none shadow-lg">
                {isLoading ? <><Loader2 className="animate-spin" size={20} /> Restableciendo...</> : <><CheckCircle size={20} /> Restablecer Acceso</>}
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link to="/login" className="text-sm text-gray-500 hover:text-white transition no-underline">
            ¿Recordaste tu contraseña? <span className="underline">Iniciar sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}