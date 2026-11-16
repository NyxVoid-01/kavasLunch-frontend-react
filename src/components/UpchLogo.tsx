import { cn } from '@/lib/utils';

// Escudo de la Universidad Peruana Cayetano Heredia (el alto lo define quien lo usa)
export default function UpchLogo({ className }: { className?: string }) {
  return (
    <img
      src="/logo-upch.png"
      alt="Escudo de la Universidad Peruana Cayetano Heredia"
      className={cn('w-auto select-none', className)}
      draggable={false}
    />
  );
}
