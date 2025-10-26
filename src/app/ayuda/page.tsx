import Link from 'next/link'
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock,
  CreditCard,
  Home,
  Calendar,
  Shield,
  HelpCircle
} from 'lucide-react'

export default function AyudaPage() {
  const faqs = [
    {
      category: "Reservas",
      icon: Calendar,
      questions: [
        {
          q: "¿Cómo confirmo que mi reserva está asegurada?",
          a: "Una vez que completes el pago, recibirás un email de confirmación inmediatamente. Tu reserva también aparecerá como 'Confirmada' en la sección 'Mis Reservas' y estará visible en el calendario del propietario."
        },
        {
          q: "¿Cuánto tiempo tengo para pagar mi reserva?",
          a: "Tienes 30 minutos para completar el pago después de hacer la reserva. Si no pagas en este tiempo, la reserva se cancelará automáticamente y las fechas quedarán disponibles nuevamente."
        },
        {
          q: "¿Puedo modificar o cancelar mi reserva?",
          a: "Las modificaciones y cancelaciones dependen de la política del propietario. Contáctanos lo antes posible para revisar tu caso específico."
        }
      ]
    },
    {
      category: "Pagos",
      icon: CreditCard,
      questions: [
        {
          q: "¿Qué métodos de pago aceptan?",
          a: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), transferencias bancarias y otros métodos disponibles a través de MercadoPago."
        },
        {
          q: "¿Es seguro pagar en línea?",
          a: "Sí, todos los pagos se procesan a través de MercadoPago, una plataforma segura y certificada. No almacenamos información de tarjetas de crédito en nuestros servidores."
        },
        {
          q: "¿Cuándo se cobra el pago?",
          a: "El pago se procesa inmediatamente al confirmar la reserva. Solo se cobra si la transacción es exitosa y recibes la confirmación."
        }
      ]
    },
    {
      category: "Check-in/Check-out",
      icon: Home,
      questions: [
        {
          q: "¿Cómo obtengo las llaves del alojamiento?",
          a: "El propietario se contactará contigo 24-48 horas antes del check-in para coordinar la entrega de llaves y darte instrucciones específicas del alojamiento."
        },
        {
          q: "¿Cuáles son los horarios de check-in y check-out?",
          a: "Check-in: desde las 15:00 hs / Check-out: hasta las 11:00 hs. Algunos propietarios pueden ser flexibles con estos horarios, consulta directamente con ellos."
        },
        {
          q: "¿Qué documentos necesito llevar?",
          a: "Debes llevar tu DNI o documento de identidad válido. Es obligatorio para el registro de huéspedes según la normativa vigente."
        }
      ]
    },
    {
      category: "Problemas Técnicos",
      icon: Shield,
      questions: [
        {
          q: "No recibí el email de confirmación",
          a: "Revisa tu carpeta de spam. Si no lo encuentras, ve a 'Mis Reservas' para verificar el estado. Si el problema persiste, contáctanos con tu código de reserva."
        },
        {
          q: "Mi pago fue rechazado",
          a: "Verifica que los datos de tu tarjeta sean correctos y que tengas fondos suficientes. Si el problema continúa, intenta con otro método de pago o contacta a tu banco."
        },
        {
          q: "No puedo acceder a mis reservas",
          a: "Asegúrate de estar usando el mismo email con el que hiciste la reserva. Si olvidaste tu contraseña, usa la opción 'Recuperar contraseña'."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Centro de Ayuda
          </h1>
          <p className="text-neutral-400">
            Encuentra respuestas a las preguntas más frecuentes o contáctanos directamente
          </p>
        </div>

        {/* Contacto rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 text-center">
            <Phone className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <h3 className="text-foreground font-semibold mb-2">Teléfono</h3>
            <p className="text-neutral-300 mb-2">+54 9 11 1234-5678</p>
            <p className="text-sm text-neutral-400">Lun a Dom 9:00 - 21:00</p>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-6 text-center">
            <Mail className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h3 className="text-foreground font-semibold mb-2">Email</h3>
            <p className="text-neutral-300 mb-2">soporte@resio.com</p>
            <p className="text-sm text-neutral-400">Respuesta en 24hs</p>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 p-6 text-center">
            <MessageCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <h3 className="text-foreground font-semibold mb-2">Chat en vivo</h3>
            <p className="text-neutral-300 mb-2">Próximamente</p>
            <p className="text-sm text-neutral-400">Atención inmediata</p>
          </div>
        </div>

        {/* Emergencias */}
        <div className="bg-red-900/20 border border-red-800 p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-6 h-6 text-red-400" />
            <h2 className="text-red-300 font-semibold text-lg">¿Tienes una emergencia durante tu estadía?</h2>
          </div>
          <p className="text-red-200 mb-3">
            Si tienes un problema urgente durante tu estadía (llaves, acceso, servicios), contacta inmediatamente:
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-400" />
              <span className="text-red-100 font-semibold">+54 9 11 1234-5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-400" />
              <span className="text-red-100">emergencias@resio.com</span>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Preguntas Frecuentes</h2>
          
          {faqs.map((category, categoryIndex) => {
            const CategoryIcon = category.icon
            return (
              <div key={categoryIndex} className="bg-neutral-900 border border-neutral-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CategoryIcon className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-foreground">{category.category}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => (
                    <div key={faqIndex} className="border-b border-neutral-800 pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-foreground font-medium mb-2">{faq.q}</h4>
                          <p className="text-neutral-300 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-900/20 border border-blue-800 p-6 mt-8">
          <h3 className="text-blue-300 font-semibold mb-3">¿No encontraste lo que buscabas?</h3>
          <p className="text-blue-200 mb-4">
            Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta específica sobre tu reserva o el proceso de alojamiento.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <Link
              href="/tablero/reservas"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
            >
              Ver mis reservas
            </Link>
            <a
              href="mailto:soporte@resio.com"
              className="inline-flex items-center justify-center gap-2 border border-blue-600 text-blue-300 px-6 py-3 hover:bg-blue-900/30 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar consulta
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}