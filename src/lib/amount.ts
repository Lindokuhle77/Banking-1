export function parseAmount(text: string): number {
  const n = parseFloat(text.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}
