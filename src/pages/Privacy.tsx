import Footer from '@/components/Footer';
import Header from '@/components/Header';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: 'Qué datos recopilamos',
    body: [
      'Tu nombre completo y tu correo institucional (@upch.pe) al crear la cuenta.',
      'Tus reservas: menú elegido, fecha, turno de recojo, método de pago y estado del pedido.',
    ],
  },
  {
    title: 'Para qué los usamos',
    body: [
      'Gestionar tus reservas y la entrega de tu almuerzo en el comedor universitario.',
      'Enviarte correos del servicio: bienvenida, confirmación, recordatorio de recojo, cancelación, vencimiento y recuperación de contraseña.',
      'Generar reportes de uso del comedor para la administración. No usamos tus datos para publicidad.',
    ],
  },
  {
    title: 'Cómo los protegemos',
    body: [
      'Tu contraseña se guarda cifrada y nadie, ni la administración, puede verla.',
      'Solo el personal autorizado del comedor accede a las reservas del día para entregar los pedidos.',
      'El acceso se bloquea temporalmente tras varios intentos fallidos de inicio de sesión.',
    ],
  },
  {
    title: 'Tus derechos',
    body: [
      'Puedes consultar y actualizar tus datos desde tu perfil.',
      'Puedes pedir la corrección o eliminación de tu cuenta a la administración del comedor, conforme a la Ley N.º 29733 de Protección de Datos Personales.',
    ],
  },
];

// Política de privacidad (RNF-004): visible desde el pie de página, sin necesidad de sesión
export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow max-w-3xl">
        <h1 className="inline-block text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-[#E0A100] bg-clip-text text-transparent">
          Política de privacidad
        </h1>
        <p className="text-muted-foreground mb-6">Cómo KAVAS-LUNCH cuida tus datos personales</p>

        <div className="space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title} className="rounded-2xl border-2 border-primary/20 p-5">
              <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {section.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
