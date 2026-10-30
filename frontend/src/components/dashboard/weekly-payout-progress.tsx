'use client'

type WeekStatus = 'released' | 'queued' | 'locked'
export type Week = { week: number; amount: number; status: WeekStatus }

const MONO = "font-[family-name:var(--font-space-mono)]"

/** Calculate total weeks from planMonths, rounding leftover days into a final partial week */
export function buildWeeks(
  planMonths: number,
  pricePerSeat: number,
  filledSeats: number,
  daysElapsed: number,
): Week[] {
  const totalDays = planMonths * 30
  const fullWeeks = Math.floor(totalDays / 7)
  const remainderDays = totalDays % 7
  const totalWeeks = fullWeeks + (remainderDays > 0 ? 1 : 0)
  const totalPayout = pricePerSeat * filledSeats
  const weeklyPayout = Math.round(totalPayout / totalWeeks)
  const weeksElapsed = Math.floor(daysElapsed / 7)

  return Array.from({ length: totalWeeks }, (_, i) => {
    const status: WeekStatus =
      i < weeksElapsed ? 'released' : i === weeksElapsed ? 'queued' : 'locked'
    return { week: i + 1, amount: weeklyPayout, status }
  })
}

export function WeeklyPayoutProgress({ weeks }: { weeks: Week[] }) {
  const paidWeeks = weeks.filter((w) => w.status === 'released')
  const paid = paidWeeks.length
  const paidAmt = paidWeeks.reduce((a, w) => a + w.amount, 0)
  const totalAmt = weeks.reduce((a, w) => a + w.amount, 0)
  const next = weeks.find((w) => w.status === 'queued')

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="rounded-[24px] border-[2.5px] border-[#151515] bg-white p-4 shadow-[4px_4px_0_0_#151515]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className={`${MONO} text-2xl font-bold leading-none`}>
              ₹{paidAmt.toLocaleString('en-IN')}
            </p>
            <p className="mt-1 text-sm font-medium text-[#6b6558]">
              paid out of ₹{totalAmt.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-right text-sm font-bold">
            {next ? (
              <>
                Next: Week {next.week}
                <br />
                <span className="font-medium text-[#6b6558]">
                  ₹{next.amount.toLocaleString('en-IN')} queued
                </span>
              </>
            ) : (
              'All paid'
            )}
          </p>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-[#151515] bg-[#ece8de]">
          <div
            className="h-full bg-[#8de89a] transition-all duration-500"
            style={{ width: `${weeks.length ? (paid / weeks.length) * 100 : 0}%` }}
          />
        </div>

        <p className={`${MONO} mt-2 text-xs font-bold text-[#3d3a32]`}>
          {paid} of {weeks.length} weeks paid
        </p>
      </div>
    </div>
  )
}
