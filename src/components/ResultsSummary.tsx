// Resultado de los filtros ("Mostrando 10 menús"), anunciado a lectores de pantalla cuando cambia
export default function ResultsSummary({ count, singular, plural }: { count: number; singular: string; plural: string }) {
  return (
    <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
      Mostrando <strong className="text-foreground">{count}</strong> {count === 1 ? singular : plural}
    </p>
  );
}
