export * from './global';
export { default as globalStyles } from './global';

export function formatRupiah(amount: number | undefined): string {
  if (!amount) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatWIB(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch { return '-'; }
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(date);
  } catch { return '-'; }
}

export function formatNumber(num: number | undefined): string {
  if (!num) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
}

export function filterNumericInput(text: string): string {
  return text.replace(/[^0-9]/g, '');
}

export function sanitizeInput(text: string): string {
  return text.replace(/[<>{}[\]\\/=]/g, '').trim();
}