export function parseNumberLoose(value: string) {
  const normalized = value
    .trim()
    .replace(/\s/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.-]/g, '')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

export function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}

export function roundToDecimals(value: number, digits = 2) {
  if (!Number.isFinite(value)) return 0

  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function roundMoney(value: number) {
  return roundToDecimals(value, 2)
}

export function formatMoneyUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(value))
}

export function formatMoneyPen(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundMoney(value))
}

export function formatNumber(value: number, digits = 3) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0)
}
