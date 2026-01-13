import { FileText, ArrowLeft, AlertCircle, Calendar, Users, DollarSign, Shield, Ban } from 'lucide-react';

export default function TermsConditions() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
           src="/images/comunidad_4.jpg"
           alt="Background"
           className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-full mb-8">
              <FileText size={36} />
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6 text-glow">
              Términos y<br/>
              <span className="font-semibold">Condiciones.</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">
              Última actualización: 13 de enero de 2026
            </p>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Aceptación de términos</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>
                  Bienvenido al Sistema de Gestión Comunitaria Residencial. Al acceder y utilizar esta plataforma, aceptas estar sujeto a estos términos y condiciones de uso. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
                </p>
                <p>
                  Estos términos constituyen un acuerdo legal vinculante entre tú (el residente o usuario) y la Comunidad Residencial. Nos reservamos el derecho de modificar estos términos en cualquier momento, y te notificaremos de cualquier cambio significativo.
                </p>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Elegibilidad y registro</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>Para utilizar este sistema, debes cumplir con los siguientes requisitos:</p>
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Ser residente actual de la comunidad o propietario de una unidad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Tener al menos 18 años de edad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proporcionar información verídica y actualizada durante el registro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mantener la confidencialidad de tus credenciales de acceso</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>No compartir tu cuenta con terceros no autorizados</span>
                  </li>
                </ul>
                <p className="pt-4">
                  Eres responsable de todas las actividades que ocurran bajo tu cuenta. Debes notificar inmediatamente a la administración si sospechas de un uso no autorizado de tu cuenta.
                </p>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Uso de instalaciones y reservas</h2>
              </div>
              <div className="space-y-6 text-gray-300 leading-relaxed font-light">
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">Normas generales</h3>
                  <ul className="space-y-3 pl-6">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Las reservas deben realizarse con un mínimo de 24 horas de antelación</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Solo puedes tener un máximo de 3 reservas activas simultáneamente</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Las cancelaciones deben hacerse con al menos 12 horas de antelación</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Las ausencias sin cancelación previa pueden resultar en penalizaciones</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">Instalaciones deportivas</h3>
                  <ul className="space-y-3 pl-6">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Pistas de pádel: máximo 4 personas por reserva, duración 90 minutos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Debes traer tu propio equipo deportivo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>El uso de las instalaciones es exclusivo para residentes y sus invitados autorizados</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">Piscina y gimnasio</h3>
                  <ul className="space-y-3 pl-6">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Piscina: turnos de 90 minutos con control de aforo</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Gimnasio: acceso 24/7 para residentes con tarjeta de acceso</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Los menores de 16 años deben estar acompañados por un adulto</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Tarifas y pagos</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>El acceso a las instalaciones comunitarias está sujeto a las siguientes condiciones de pago:</p>
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Algunas instalaciones son de uso gratuito para residentes con cuotas de comunidad al día</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Las pistas de pádel tienen una tarifa de 15€/hora que debe abonarse al realizar la reserva</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Los pagos se procesan de forma segura a través de pasarelas de pago certificadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Los reembolsos por cancelación con más de 12 horas de antelación se procesarán en 5-7 días hábiles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Las ausencias sin cancelación previa no son reembolsables</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Ban size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Conducta prohibida</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>Los siguientes comportamientos están estrictamente prohibidos y pueden resultar en la suspensión o cancelación de tu cuenta:</p>
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Proporcionar información falsa o engañosa durante el registro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Intentar acceder a cuentas o datos de otros usuarios</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Realizar reservas fraudulentas o con intención de reventa</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Dañar, interferir o interrumpir el funcionamiento del sistema</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Usar el sistema para fines distintos a los previstos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Comportamiento irrespetuoso hacia otros residentes o el personal de la comunidad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Incumplimiento de las normas de convivencia de la comunidad</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Responsabilidad y garantías</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>El uso de las instalaciones es bajo tu propio riesgo. La comunidad no se hace responsable de lesiones personales o daños a la propiedad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Aunque nos esforzamos por mantener el sistema disponible 24/7, no garantizamos un acceso ininterrumpido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>La comunidad se reserva el derecho de cerrar instalaciones temporalmente por mantenimiento o emergencias</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>No somos responsables de la pérdida de objetos personales en las instalaciones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Debes cumplir con todas las normas de seguridad e higiene en las instalaciones</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Modificaciones y terminación</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>
                  Nos reservamos el derecho de modificar o descontinuar el servicio en cualquier momento, con o sin previo aviso. También podemos modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación.
                </p>
                <p>
                  Podemos suspender o cancelar tu acceso al sistema si violas estos términos, si proporcionas información falsa, o si tu comportamiento pone en riesgo la seguridad o el bienestar de otros residentes.
                </p>
                <p>
                  Puedes solicitar la eliminación de tu cuenta en cualquier momento contactando con la administración. Ten en cuenta que algunas de tus reservas y datos pueden conservarse según lo exigido por ley.
                </p>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Contacto y soporte</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>
                  Si tienes preguntas sobre estos términos y condiciones o necesitas asistencia, puedes contactarnos:
                </p>
                <div className="glass p-6 rounded-2xl space-y-3">
                  <p><strong className="text-white">Email:</strong> soporte@residencial.com</p>
                  <p><strong className="text-white">Teléfono:</strong> +34 900 123 456</p>
                  <p><strong className="text-white">Horario:</strong> Lunes a Viernes, 9:00 - 18:00</p>
                  <p><strong className="text-white">Oficina:</strong> Edificio Principal, Planta Baja</p>
                </div>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section className="glass p-6 rounded-2xl bg-white/5">
              <p className="text-sm text-gray-400 leading-relaxed">
                Al continuar usando el Sistema de Gestión Comunitaria Residencial, confirmas que has leído, entendido y aceptado estos términos y condiciones en su totalidad. Estos términos constituyen un acuerdo legalmente vinculante entre tú y la Comunidad Residencial.
              </p>
            </section>
          </div>

          <div className="text-center mt-12">
            <button
               onClick={scrollToTop}
              className="text-sm text-gray-500 hover:text-white transition font-medium bg-transparent border-none cursor-pointer"
            >
              ↑ Volver arriba
            </button>
          </div>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-light">
            © 2026 Sistema Residencial. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}