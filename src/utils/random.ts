export function randomShortCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

export function buildQuoteNumber(sellerCode: string, randomNumber: number) {
  const cleaned = (sellerCode || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  const prefix = cleaned || 'VEN'
  return `${prefix}-${randomNumber}`
}
