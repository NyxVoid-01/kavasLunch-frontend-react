import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, LinkIcon } from 'lucide-react';
import { resetPassword } from '@/services/auth';
import { getErrorMessage } from '@/lib/api';
import { strongPasswordSchema, zodFieldErrors } from '@/lib/validation';
import { PasswordMatch, PasswordRequirements } from '@/components/PasswordRequirements';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/components/AuthLayout';
import PasswordInput from '@/components/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const resetSchema = z
  .object({
    password: strongPasswordSchema,
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirmation'],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [linkError, setLinkError] = useState('');

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const parsed = resetSchema.safeParse({ password, passwordConfirmation: confirmation });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const message = await resetPassword({ token, email, password, password_confirmation: confirmation });
      toast({ title: '¡Contraseña actualizada!', description: message });
      navigate('/auth', { replace: true });
    } catch (err) {
      // El backend responde 422 tanto por enlace vencido como por validación
      const message = getErrorMessage(err);
      if (message.includes('enlace')) {
        setLinkError(message);
      } else {
        toast({ variant: 'destructive', title: 'No se pudo actualizar la contraseña', description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Sin token o con un enlace vencido no tiene sentido mostrar el formulario
  if (!token || !email || linkError) {
    return (
      <AuthLayout>
        <Card className="border-border/50 shadow-card">
          <CardHeader className="items-center text-center">
            <div className="bg-destructive/10 text-destructive p-3 rounded-full mb-2">
              <LinkIcon className="w-8 h-8" />
            </div>
            <CardTitle>Enlace no válido</CardTitle>
            <CardDescription>
              {linkError || 'El enlace para restablecer la contraseña está incompleto. Ábrelo nuevamente desde tu correo.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/forgot-password">Solicitar un nuevo enlace</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/auth">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Iniciar Sesión
              </Link>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <CardTitle>Nueva contraseña</CardTitle>
          <CardDescription>Crea una nueva contraseña para tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="reset-email">Correo Institucional</Label>
              <Input id="reset-email" type="email" value={email} disabled readOnly autoComplete="username" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password">Nueva Contraseña</Label>
              <PasswordInput
                id="reset-password"
                name="password"
                autoComplete="new-password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby="reset-password-rules"
                aria-invalid={!!errors.password}
              />
              <PasswordRequirements id="reset-password-rules" password={password} />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-password-confirmation">Confirmar Contraseña</Label>
              <PasswordInput
                id="reset-password-confirmation"
                name="passwordConfirmation"
                autoComplete="new-password"
                required
                disabled={loading}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                aria-invalid={!!errors.passwordConfirmation}
              />
              <PasswordMatch password={password} confirmation={confirmation} />
              {errors.passwordConfirmation && !confirmation && (
                <p className="text-sm text-destructive">{errors.passwordConfirmation}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
