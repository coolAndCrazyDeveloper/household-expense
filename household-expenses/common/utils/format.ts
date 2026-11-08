import { CURRENCY, LOCALE } from '../constants/app';

export function formatMoney(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(value || 0);
}
