export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

/** Para colunas só de data (`@db.Date`), que o banco devolve como meia-noite UTC.
 * Formatar essas no fuso local mostraria o dia anterior no Brasil — e formatar em
 * UTC um horário de verdade (mentoria às 22h) mostraria o dia seguinte. Por isso as
 * duas funções: `formatDate` para data e hora, esta para data pura. */
export function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}
