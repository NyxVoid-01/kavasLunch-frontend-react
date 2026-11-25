import { z } from 'zod';

// Reglas compartidas por el registro y el restablecimiento de contraseña (RF-001)
export const upchEmailSchema = z
  .string()
  .email('Correo electrónico inválido')
  .endsWith('@upch.pe', 'Debe usar su correo @upch.pe');

// Requisitos de contraseña segura. La validación y la lista visual de requisitos
// salen de aquí, así que siempre coinciden.
export const PASSWORD_RULES: { label: string; error: string; test: (password: string) => boolean }[] = [
  { label: 'Mínimo 8 caracteres', error: 'La contraseña debe tener al menos 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Una letra mayúscula', error: 'Debe contener al menos una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Una letra minúscula', error: 'Debe contener al menos una minúscula', test: (p) => /[a-z]/.test(p) },
  { label: 'Un número', error: 'Debe contener al menos un número', test: (p) => /[0-9]/.test(p) },
  {
    label: 'Un carácter especial (@$!%*?&)',
    error: 'Debe contener al menos uno de estos caracteres especiales: @$!%*?&',
    test: (p) => /[@$!%*?&]/.test(p),
  },
];

export const strongPasswordSchema = PASSWORD_RULES.reduce(
  (schema, rule) => schema.refine(rule.test, rule.error),
  z.string() as z.ZodType<string>
);

// Convierte los errores de zod en un mapa campo -> primer mensaje
export const zodFieldErrors = (error: z.ZodError): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const field = err.path[0] as string | undefined;
    if (field && !fieldErrors[field]) fieldErrors[field] = err.message;
  });
  return fieldErrors;
};
