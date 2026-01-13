import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck, Mail, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img
           src="/images/comunidad_2.jpg"
           alt="Background"
           className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      {/* Nav */}
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
              <Shield size={36} />
            </div>
            <h1 className="text-5xl md:text-7xl font-extralight mb-6 text-glow">
              Política de<br/>
              <span className="font-semibold">Privacidad.</span>
            </h1>
            <p className="text-gray-400 text-lg font-light">
              Última actualización: 13 de enero de 2026
            </p>
          </div>

          <div className="glass rounded-3xl p-8 md:p-12 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Introducción</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>
                  En Sistema Residencial, nos comprometemos a proteger tu privacidad y garantizar la seguridad de tus datos personales. Esta política describe cómo recopilamos, usamos y protegemos tu información cuando utilizas nuestra plataforma de gestión comunitaria.
                </p>
                <p>
                  Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política de privacidad. Si no estás de acuerdo con algún aspecto de esta política, por favor no utilices nuestros servicios.
                </p>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Database size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Información que recopilamos</h2>
              </div>
              <div className="space-y-6 text-gray-300 leading-relaxed font-light">
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">Datos personales</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Nombre completo y número de apartamento</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Dirección de correo electrónico</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Número de teléfono</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Información de acceso (usuario y contraseña encriptada)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white mb-3">Datos de uso</h3>
                  <ul className="space-y-2 pl-6">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Historial de reservas de instalaciones</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Fecha y hora de acceso al sistema</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <span>Preferencias de uso de instalaciones</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Eye size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Cómo usamos tu información</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>Utilizamos la información recopilada para los siguientes propósitos:</p>
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Gestionar y procesar tus reservas de instalaciones comunitarias</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Verificar tu identidad y residencia en la comunidad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Enviar notificaciones sobre tus reservas y actualizaciones del sistema</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Mejorar nuestros servicios y experiencia de usuario</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Cumplir con obligaciones legales y normativas de la comunidad</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Prevenir fraudes y garantizar la seguridad del sistema</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Lock size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Protección de datos</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger tus datos personales contra el acceso no autorizado, alteración, divulgación o destrucción:
                </p>
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Encriptación de extremo a extremo para datos sensibles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Servidores seguros con protección contra intrusiones</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Contraseñas con hash y algoritmos de encriptación avanzados</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Acceso restringido a datos personales solo para personal autorizado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span>Copias de seguridad regulares y planes de recuperación ante desastres</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <UserCheck size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Tus derechos</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>Como residente y usuario de nuestro sistema, tienes los siguientes derechos:</p>
                <ul className="space-y-3 pl-6">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-white">Acceso:</strong> Solicitar una copia de tus datos personales</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-white">Rectificación:</strong> Corregir datos inexactos o incompletos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-white">Supresión:</strong> Solicitar la eliminación de tus datos (sujeto a obligaciones legales)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-white">Portabilidad:</strong> Recibir tus datos en un formato estructurado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span><strong className="text-white">Oposición:</strong> Oponerte al procesamiento de tus datos en determinadas circunstancias</span>
                  </li>
                </ul>
              </div>
            </section>

            <div className="border-t border-white/10"></div>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <h2 className="text-3xl font-semibold">Contacto</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed font-light">
                <p>
                  Si tienes preguntas sobre esta política de privacidad o deseas ejercer tus derechos, puedes contactarnos a través de:
                </p>
                <div className="glass p-6 rounded-2xl space-y-3">
                  <p><strong className="text-white">Email:</strong> privacidad@residencial.com</p>
                  <p><strong className="text-white">Teléfono:</strong> +34 900 123 456</p>
                  <p><strong className="text-white">Dirección:</strong> Oficina de Administración, Comunidad Residencial</p>
                </div>
              </div>
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