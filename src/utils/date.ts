export function addDaysISO(dateISO: string, days: number) {
  const base = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(base.getTime())) return dateISO
  base.setDate(base.getDate() + days)
  return base.toISOString().slice(0, 10)
}

