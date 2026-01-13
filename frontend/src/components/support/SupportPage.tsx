import { useState } from 'react';
import { HelpCircle, ArrowLeft, Mail, MessageSquare, Phone, Send, ChevronDown, ChevronUp } from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "¿Cómo puedo reservar una pista de pádel?",
      answer: "Inicia sesión en tu cuenta, ve a la sección de 'Servicios' o 'Reservas', selecciona la pista y el horario deseado. El sistema te guiará para realizar el pago si corresponde."
    },
    {
      question: "¿Cuál es el horario de la piscina?",
      answer: "La piscina climatizada está abierta de 08:00 a 22:00 todos los días. Recuerda que debes reservar tu turno de 90 minutos previamente."
    },
    {
      question: "¿He olvidado mi contraseña, cómo la recupero?",
      answer: "En la pantalla de inicio de sesión, pulsa en '¿Olvidaste tu contraseña?'. Recibirás un correo electrónico con las instrucciones para restablecerla."
    },
    {
      question: "¿Puedo invitar a no residentes?",
      answer: "Sí, cada residente puede traer hasta 2 invitados por reserva en las zonas deportivas. Tú eres responsable de su conducta dentro de las instalaciones."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulación de envío
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Mensaje enviado. Te responderemos pronto.');
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Clases comunes para inputs
  const inputClasses = "w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/30 focus:outline-none transition-all resize-none";

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
           src="/images/comunidad_1.jpg" // Reusamos una imagen existente
           alt="Background"
           className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button
             onClick={() => window.history.back()}
             className="flex items-center gap-2 text-gray-400 hover:text-white transition bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Volver</span>
          </button>
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

      {/* Content */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-full mb-8">
              <HelpCircle size={36} />
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6 text-glow">
              Centro de<br/>
              <span className="font-semibold">Soporte.</span>
            </h1>
            <p className="text-gray-400 text-lg font-light max-w-2xl mx-auto">
              Estamos aquí para ayudarte. Encuentra respuestas rápidas o ponte en contacto con nuestro equipo de administración.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* FAQ Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <MessageSquare size={24} className="text-gray-400" />
                Preguntas Frecuentes
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="glass rounded-2xl overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition bg-transparent border-none cursor-pointer"
                    >
                      <span className="font-medium text-lg">{faq.question}</span>
                      {openFaq === index ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </button>
                    <div
                      className={`px-6 text-gray-400 font-light overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 py-5 pt-0 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                    >
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Contact Info */}
              <div className="mt-8 glass p-6 rounded-2xl flex flex-col sm:flex-row gap-6 justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Urgencias 24/7</p>
                    <p className="font-semibold text-lg">+34 900 123 456</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email General</p>
                    <p className="font-semibold text-lg">soporte@residencial.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="glass p-8 rounded-3xl h-fit">
              <h2 className="text-2xl font-semibold mb-2">Envíanos un mensaje</h2>
              <p className="text-gray-400 mb-8 font-light text-sm">Te responderemos en menos de 24 horas.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={inputClasses}
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={inputClasses}
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className={inputClasses}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-black py-4 rounded-xl font-medium text-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Enviando...</span>
                  ) : (
                    <>
                      <span>Enviar mensaje</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
               onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm text-gray-500 hover:text-white transition font-medium bg-transparent border-none cursor-pointer"
            >
              ↑ Volver arriba
            </button>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-light">
            © 2026 Sistema Residencial. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}