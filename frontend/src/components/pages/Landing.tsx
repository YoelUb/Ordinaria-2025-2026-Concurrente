import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Lock, ChevronRight, Sun, Moon } from 'lucide-react';
import { FeatureSection } from '../services/FeatureSection';
export default function Landing() {
  const [isDark, setIsDark] = useState(true);
  const reduceMotion = useReducedMotion();

  // Tema de color
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mq.matches);
    }
  }, []);

  // Persistencia
  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const isDesktop =
    typeof window !== 'undefined' &&
    window.matchMedia('(min-width: 768px)').matches;

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isDesktop ? 'snap-y snap-mandatory overflow-y-scroll' : ''
      } ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
    >
      {/* TOGGLE */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur bg-white/10 hover:bg-white/20 transition"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* HERO */}
      <section className="snap-start min-h-screen flex items-center justify-center text-center px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-6xl md:text-8xl font-light mb-8">
            Elegancia.
            <br />
            <span className="font-semibold">Simplicidad.</span>
          </h1>

          <p className="text-neutral-500 max-w-xl mx-auto mb-12">
            Reservas inteligentes para instalaciones premium.
          </p>

          <motion.button
            whileHover={reduceMotion ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => (window.location.href = '/login')}
            className={`inline-flex items-center gap-3 px-10 py-4 rounded-full font-medium ${
              isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}
          >
            <Lock size={18} />
            Acceder
            <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* FEATURES */}
      <FeatureSection
        eyebrow="Deporte Premium"
        title="Pistas de"
        highlight="Pádel"
        description="Pistas profesionales con iluminación LED y reservas inteligentes."
        bullets={[
          'Iluminación nocturna',
          'Reserva flexible',
          'Hasta 4 jugadores'
        ]}
      />

      <FeatureSection
        eyebrow="Wellness & Relax"
        title="Piscina"
        highlight="Climatizada"
        description="Piscina climatizada todo el año con control de aforo."
        bullets={[
          '28°C constantes',
          'Sistema salino',
          'Turnos inteligentes'
        ]}
        reverse
      />

      <FeatureSection
        eyebrow="Fitness & Training"
        title="Gimnasio"
        highlight="24/7"
        description="Zona fitness con acceso exclusivo para residentes."
        bullets={[
          'Fuerza y cardio',
          'Acceso total',
          'Climatización avanzada'
        ]}
      />

      {/* CTA FINAL */}
      <section className="snap-start min-h-screen flex items-center justify-center text-center px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        >
          <h2 className="text-5xl md:text-7xl font-light mb-10">
            Tu experiencia
            <br />
            <span className="font-semibold">empieza aquí.</span>
          </h2>

          <motion.button
            whileHover={reduceMotion ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260 }}
            onClick={() => (window.location.href = '/login')}
            className={`px-14 py-5 rounded-full text-xl font-medium ${
              isDark ? 'bg-white text-black' : 'bg-black text-white'
            }`}
          >
            Acceder al sistema
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
