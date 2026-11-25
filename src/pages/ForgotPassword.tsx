import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { forgotPassword } from '@/services/auth';
import { getErrorMessage } from '@/lib/api';
import { upchEmailSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const email = (new FormData(e.currentTarget).get('email') as string).trim();
    const parsed = upchEmailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'No se pudo enviar el enlace',
        description: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="border-border/50 shadow-card">
        {sentTo ? (
          <>
            <CardHeader className="items-center text-center">
              <div className="bg-success/10 text-success p-3 rounded-full mb-2">
                <MailCheck className="w-8 h-8" />
              </div>
              <CardTitle>Revisa tu correo</CardTitle>
              <CardDescription>
                Si <strong className="text-foreground">{sentTo}</strong> está registrado, recibirás un enlace para
                crear una nueva contraseña.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                El enlace vence en 60 minutos y solo puede usarse una vez. Si no lo ves, revisa la carpeta de spam.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">Volver a Iniciar Sesión</Link>
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setSentTo(null)}>
                Usar otro correo
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Recuperar contraseña</CardTitle>
              <CardDescription>
                Ingresa tu correo institucional y te enviaremos un enlace para crear una nueva contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Correo Institucional</Label>
                  <Input
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@upch.pe"
                    autoComplete="email"
                    required
                    disabled={loading}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'forgot-email-error' : undefined}
                  />
                  {error && <p id="forgot-email-error" className="text-sm text-destructive">{error}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to="/auth">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a Iniciar Sesión
                  </Link>
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </AuthLayout>
  );
}
