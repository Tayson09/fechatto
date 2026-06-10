export function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatArea(value: number | null | undefined): string {
  if (!value) return '-';
  return `${value.toFixed(2).replace('.', ',')} m²`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function toNum(v: number | string | null | undefined): string {
  if (v == null || v === '') return '';
  return parseFloat(String(v)).toString();
}

export function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}