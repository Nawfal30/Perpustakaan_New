export type FineRule =
  | { type: "flat"; perDay: number; cap?: number }
  | {
      type: "tiered"
      tiers: Array<{ throughDay: number | null; perDay: number }>
      cap?: number
    }

export type CopyStatus =
  | "TERSEDIA"
  | "DIPINJAM"
  | "DITAHAN"
  | "RUSAK"
  | "DALAM_PERBAIKAN"
  | "HILANG"
  | "DITARIK"

const transitions: Record<CopyStatus, readonly CopyStatus[]> = {
  TERSEDIA: ["DIPINJAM", "DITAHAN", "RUSAK", "DITARIK"],
  DIPINJAM: ["TERSEDIA", "DITAHAN", "RUSAK", "HILANG"],
  DITAHAN: ["DIPINJAM", "TERSEDIA", "DITARIK", "HILANG", "RUSAK"],
  RUSAK: ["DALAM_PERBAIKAN", "DITARIK"],
  DALAM_PERBAIKAN: ["TERSEDIA", "RUSAK", "DITARIK"],
  HILANG: ["TERSEDIA", "DITARIK"],
  DITARIK: [],
}

export function canTransitionCopy(from: CopyStatus, to: CopyStatus): boolean {
  return transitions[from].includes(to)
}

export function overdueDays(
  dueDate: string,
  returnDate: string,
  graceDays = 0,
): number {
  const due = Date.parse(`${dueDate}T00:00:00Z`)
  const returned = Date.parse(`${returnDate}T00:00:00Z`)
  if (!Number.isFinite(due) || !Number.isFinite(returned)) {
    throw new Error("Tanggal jatuh tempo atau pengembalian tidak valid.")
  }
  const calendarDays = Math.floor((returned - due) / 86_400_000)
  return Math.max(0, calendarDays - Math.max(0, graceDays))
}

export function calculateFine(
  rule: FineRule,
  dueDate: string,
  returnDate: string,
  graceDays = 0,
): number {
  const days = overdueDays(dueDate, returnDate, graceDays)
  let amount = 0

  if (rule.type === "flat") {
    amount = days * Math.max(0, rule.perDay)
  } else {
    let remaining = days
    let previousBoundary = 0
    for (const tier of rule.tiers) {
      if (remaining <= 0) break
      const tierLength =
        tier.throughDay === null
          ? remaining
          : Math.max(0, tier.throughDay - previousBoundary)
      const chargedDays = Math.min(remaining, tierLength)
      amount += chargedDays * Math.max(0, tier.perDay)
      remaining -= chargedDays
      if (tier.throughDay !== null) previousBoundary = tier.throughDay
    }
  }

  if (rule.cap !== undefined) amount = Math.min(amount, Math.max(0, rule.cap))
  return Math.round(amount)
}

export function resolveDueDate(checkoutDate: string, loanDays: number): string {
  if (!Number.isInteger(loanDays) || loanDays < 1) {
    throw new Error("Durasi pinjam harus minimal satu hari.")
  }
  const date = new Date(`${checkoutDate}T00:00:00Z`)
  if (!Number.isFinite(date.getTime())) throw new Error("Tanggal pinjam tidak valid.")
  date.setUTCDate(date.getUTCDate() + loanDays)
  return date.toISOString().slice(0, 10)
}
