import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion
} from 'framer-motion';
import { useRef, useState, type MouseEvent } from 'react';

interface FeatureSectionProps {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  bullets: string[];
  reverse?: boolean;
}

export function FeatureSection({
  eyebrow,
  title,
  highlight,
  description,
  bullets,
  reverse = false
}: FeatureSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // 🎥 Scroll parallax (solo imagen)
  const y = reduceMotion ? 0 : useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = reduceMotion ? 1 : useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  // 🪄 Real 3D tilt
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    setTilt({
      x: (0.5 - py) * 12,
      y: (px - 0.5) * 12
    });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  // Asegúrate de que estas rutas de imagen existen
  const imageMap: Record<string, string> = {
    'Pádel': '/images/comunidad_2.jpg',
    'Climatizada': '/images/comunidad_3.jpg',
    '24/7': '/images/comunidad_4.jpg'
  };

  return (
    <section
      ref={ref}
      className="snap-start min-h-screen flex items-center px-6 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* TEXTO */}
        <motion.div
          className={reverse ? 'md:order-2' : ''}
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <p className="text-sm tracking-[0.3em] uppercase mb-4 text-neutral-500">
            {eyebrow}
          </p>

          <h2 className="text-5xl md:text-7xl font-light mb-8 leading-tight">
            {title}
            <br />
            <span className="font-semibold">{highlight}</span>
          </h2>

          <p className="text-xl text-neutral-500 mb-10 font-light leading-relaxed">
            {description}
          </p>

          <ul className="space-y-4 text-neutral-500">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-1.5 h-1.5 bg-current rounded-full mt-2 opacity-70" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* IMAGEN — REAL 3D */}
        <motion.div
          className={`relative h-[420px] md:h-[540px] rounded-3xl overflow-hidden shadow-2xl will-change-transform ${
            reverse ? 'md:order-1' : ''
          }`}
          style={{
            y,
            scale,
            rotateX: tilt.x,
            rotateY: tilt.y,
            transformStyle: 'preserve-3d',
            perspective: 1000
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        >
          <img
            src={imageMap[highlight]}
            alt={highlight}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: 'translateZ(30px)' }} // Efecto de profundidad
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}