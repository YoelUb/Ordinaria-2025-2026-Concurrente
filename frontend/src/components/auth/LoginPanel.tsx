import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useAuth } from '../../hooks/useAuth.ts';

export function LoginPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      login(response.data.access_token, email);
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-white/10 p-8 md:p-12">
      <h2 className="font-gta text-4xl mb-2 text-white">ACCESO VECINOS</h2>
      <div className="h-1 w-12 bg-rockstar-yellow mb-8" />

      <form onSubmit={handleSubmit} className="space-y-6 font-sans">
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Contraseña</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button disabled={loading} className="btn-primary w-full mt-4">
          {loading ? 'ACCEDIENDO...' : 'ENTRAR'}
        </button>
      </form>
    </div>
  );
}