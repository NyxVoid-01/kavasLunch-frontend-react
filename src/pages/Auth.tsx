import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { UtensilsCrossed } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido').endsWith('@upch.pe', 'Debe usar su correo @upch.pe'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const signupSchema = z.object({
  email: z.string().email('Correo electrónico inválido').endsWith('@upch.pe', 'Debe usar su correo @upch.pe'),
  fullName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[@$!%*?&]/, 'Debe contener al menos uno de estos caracteres especiales: @$!%*?&'),
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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      loginSchema.parse({ email, password });
      await authLogin({ email, password });
      
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
      });
      
      navigate('/menus/user');
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
      
      navigate('/menus/user');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <UtensilsCrossed className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary">KAVAS-LUNCH</h1>
          <p className="text-muted-foreground">Sistema de Reservas del Comedor Universitario UPCH</p>
        </div>

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
                    <Label htmlFor="login-password">Contraseña</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
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
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (@$!%*?&)
                    </p>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password-confirmation">Confirmar Contraseña</Label>
                    <Input
                      id="signup-password-confirmation"
                      name="passwordConfirmation"
                      type="password"
                      required
                      disabled={loading}
                    />
                    {errors.passwordConfirmation && <p className="text-sm text-destructive">{errors.passwordConfirmation}</p>}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
