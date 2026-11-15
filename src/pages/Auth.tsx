import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import AuthLayout from '@/components/AuthLayout';
import PasswordInput from '@/components/PasswordInput';
import { PasswordMatch, PasswordRequirements } from '@/components/PasswordRequirements';
import { strongPasswordSchema, upchEmailSchema } from '@/lib/validation';

const loginSchema = z.object({
  email: upchEmailSchema,
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const signupSchema = z.object({
  email: upchEmailSchema,
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  password: strongPasswordSchema,
  passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirmation"],
});

export default function Auth() {
  const { login: authLogin, register: authRegister } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmation, setSignupConfirmation] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      loginSchema.parse({ email, password });
      const result = await authLogin({ email, password });
      
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });
      
      // Redirigir según el rol del usuario
      // Obtener el usuario actualizado del contexto después del login
      // Esperamos un poco para que el contexto se actualice
      setTimeout(() => {
        // Verificar el localStorage directamente para obtener el usuario
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/menus/user');
          }
        } else {
          navigate('/menus/user');
        }
      }, 100);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: getErrorMessage(error),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const passwordConfirmation = formData.get('passwordConfirmation') as string;
    const fullName = formData.get('fullName') as string;

    try {
      signupSchema.parse({ email, password, passwordConfirmation, fullName });
      
      await authRegister({
        email,
        password,
        password_confirmation: passwordConfirmation,
        full_name: fullName,
      });
      
      toast({
        title: "¡Cuenta creada!",
        description: "Tu cuenta ha sido creada exitosamente",
      });
      
      // Redirigir según el rol del usuario (por defecto será user, pero verificamos por si acaso)
      setTimeout(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/menus/user');
          }
        } else {
          navigate('/menus/user');
        }
      }, 100);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Error al crear cuenta",
          description: getErrorMessage(error),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
        <Card className="border-border/50 shadow-card">
          <CardHeader>
            <CardTitle>Acceso al Sistema</CardTitle>
            <CardDescription>Ingresa con tu correo institucional @upch.pe</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="signup">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="ejemplo@upch.pe"
                      required
                      disabled={loading}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <PasswordInput
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      required
                      disabled={loading}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nombre Completo</Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Juan Pérez García"
                      required
                      disabled={loading}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Correo Institucional</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="ejemplo@upch.pe"
                      required
                      disabled={loading}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <PasswordInput
                      id="signup-password"
                      name="password"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      aria-describedby="signup-password-rules"
                      aria-invalid={!!errors.password}
                    />
                    <PasswordRequirements id="signup-password-rules" password={signupPassword} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password-confirmation">Confirmar Contraseña</Label>
                    <PasswordInput
                      id="signup-password-confirmation"
                      name="passwordConfirmation"
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      value={signupConfirmation}
                      onChange={(e) => setSignupConfirmation(e.target.value)}
                      aria-invalid={!!errors.passwordConfirmation}
                    />
                    <PasswordMatch password={signupPassword} confirmation={signupConfirmation} />
                    {errors.passwordConfirmation && !signupConfirmation && (
                      <p className="text-sm text-destructive">{errors.passwordConfirmation}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
    </AuthLayout>
  );
}
