import { Check, Circle, X } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/validation';
import { cn } from '@/lib/utils';

// Lista de requisitos de la contraseña que se marcan en verde a medida que se cumplen
export function PasswordRequirements({ password, id }: { password: string; id?: string }) {
  const metCount = PASSWORD_RULES.filter((rule) => rule.test(password)).length;

  return (
    <div id={id}>
      <ul className="grid gap-1 text-xs sm:grid-cols-2" aria-label="Requisitos de la contraseña">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li
              key={rule.label}
              className={cn('flex items-center gap-1.5 transition-colors', met ? 'text-success font-medium' : 'text-muted-foreground')}
            >
              {met ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
              {rule.label}
              <span className="sr-only">{met ? ': cumplido' : ': pendiente'}</span>
            </li>
          );
        })}
      </ul>
      {/* Aviso para lectores de pantalla sin repetir la lista en cada tecla */}
      <p className="sr-only" aria-live="polite">
        {metCount === PASSWORD_RULES.length
          ? 'La contraseña cumple todos los requisitos'
          : `${metCount} de ${PASSWORD_RULES.length} requisitos cumplidos`}
      </p>
    </div>
  );
}

// Indica si la confirmación coincide; no muestra nada mientras está vacía
export function PasswordMatch({ password, confirmation }: { password: string; confirmation: string }) {
  if (!confirmation) return null;
  const matches = password === confirmation;

  return (
    <p className={cn('flex items-center gap-1.5 text-xs font-medium', matches ? 'text-success' : 'text-destructive')} aria-live="polite">
      {matches ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
      {matches ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
    </p>
  );
}
