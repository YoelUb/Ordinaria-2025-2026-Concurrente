import { useState } from 'react';
import { format } from 'date-fns';
import { Background } from '../components/layout/Background';
import { Header } from '../components/layout/Header';
import { ServiceCard } from '../components/services/ServiceCard';
import { Calendar } from '../components/reservations/Calendar';
import { TimeSlots } from '../components/reservations/TimeSlots';
import { api } from '../services/api';

const SERVICES = [
  { id: 'Padel 1', name: 'PISTA PÁDEL 1', desc: 'Máximo 4 jugadores. 90 mins.' },
  { id: 'Piscina', name: 'PISCINA', desc: 'Acceso por turnos. Aforo limitado.' },
  { id: 'Sala Común', name: 'SALA COMÚN', desc: 'Reuniones y eventos privados.' }
];

const MOCK_SLOTS = ['09:00', '10:30', '12:00', '16:00', '17:30', '19:00', '20:30'];

export function Reservations() {
  const [step, setStep] = useState(1);
  const [service, setService] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!service || !date || !time) return;
    setLoading(true);
    const startTime = `${format(date, 'yyyy-MM-dd')}T${time}:00`;

    const endHour = parseInt(time.split(':')[0]) + 1;
    const endTime = `${format(date, 'yyyy-MM-dd')}T${endHour.toString().padStart(2, '0')}:${time.split(':')[1]}:00`;

    try {
      await api.post('/reservations/', {
        facility: service,
        start_time: startTime,
        end_time: endTime
      });
      alert('Reserva confirmada correctamente');
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Error: La pista ya está reservada o hubo un conflicto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Background image="https://images.unsplash.com/photo-1554135544-245842c673ba?q=80&w=2070&auto=format&fit=crop" />
      <Header />

      <main className="pt-32 px-6 max-w-5xl mx-auto">
        <h1 className="font-gta text-5xl mb-2">NUEVA RESERVA</h1>
        <div className="h-1 w-20 bg-rockstar-yellow mb-12" />

        {/* STEP 1: SERVICIO */}
        <section className="mb-16">
          <h2 className="font-mono text-sm text-white/50 mb-6 uppercase tracking-widest">01. Seleccionar Instalación</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <ServiceCard
                key={s.id}
                service={s}
                isSelected={service === s.id}
                onSelect={() => { setService(s.id); setStep(2); }}
              />
            ))}
          </div>
        </section>

        {step >= 2 && (
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="font-mono text-sm text-white/50 mb-6 uppercase tracking-widest">02. Seleccionar Fecha</h2>
            <Calendar selectedDate={date} onSelect={(d) => { setDate(d); setStep(3); }} />
          </section>
        )}

        {step >= 3 && (
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <h2 className="font-mono text-sm text-white/50 mb-6 uppercase tracking-widest">03. Horario Disponible</h2>
            <TimeSlots slots={MOCK_SLOTS} selectedSlot={time} onSelect={(t) => { setTime(t); setStep(4); }} />
          </section>
        )}

        {step === 4 && (
          <div className="fixed bottom-0 left-0 w-full bg-rockstar-yellow text-black p-6 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-mono text-sm uppercase opacity-70">Confirmar Reserva</p>
                <p className="font-gta text-2xl md:text-3xl">
                  {service} • {date && format(date, 'dd/MM/yyyy')} • {time}
                </p>
              </div>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="bg-black text-white font-gta px-8 py-3 text-xl hover:bg-white hover:text-black transition-colors min-w-[200px]"
              >
                {loading ? 'PROCESANDO...' : 'CONFIRMAR'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}