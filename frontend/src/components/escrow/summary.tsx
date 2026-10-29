import type { EscrowPool } from './types'

interface SummaryProps {
  pool: EscrowPool
  paid: boolean
  upiId?: string
}

export function Summary({ pool, paid, upiId }: SummaryProps) {
  const rows: [string, string][] = [
    ['Total plan value', pool.total],
    ['Members splitting', `${pool.members} people`],
    ['Your split', pool.split],
    ...(paid && upiId
      ? ([['Paid via', upiId], ['Reference', pool.reference]] as [string, string][])
      : []),
  ]

  return (
    <aside
      aria-label="Payment summary"
      className="flex max-w-full flex-[1_1_320px] flex-col overflow-hidden rounded-[32px] border-[2.5px] border-[#151515] bg-white shadow-[4px_4px_0_0_#151515]"
    >
      {/* Pool header */}
      <div className="flex items-center gap-3 border-b-[2.5px] border-[#151515] bg-[#f7c85a] p-5">
        <span className="grid size-[52px] shrink-0 place-items-center rounded-full border-2 border-[#151515] bg-white text-xl font-extrabold shadow-[2px_2px_0_0_#151515]">
          {pool.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pool.logoUrl} alt="" className="size-8 object-contain" />
          ) : (
            pool.name.charAt(0)
          )}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-extrabold uppercase tracking-[0.05em] text-[#3d3a32]">
            {paid ? 'You joined' : 'You are joining'}
          </span>
          <h2 className="text-xl font-extrabold leading-[1.15] tracking-[-0.02em]">{pool.name}</h2>
          <span className="text-sm font-semibold">Hosted by {pool.host}</span>
        </div>
      </div>

      {/* Summary rows */}
      <div className="flex flex-col gap-4 p-5">
        <h3 className="text-base font-extrabold">Payment summary</h3>
        <dl className="flex flex-col gap-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="font-medium text-[#3d3a32]">{k}</dt>
              <dd className="font-mono font-bold">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t-2 border-dashed border-[#151515]/30" />

        <div className="flex items-end justify-between gap-3">
          <span className="font-bold">{paid ? 'Paid' : 'Due today'}</span>
          <span className="font-mono text-2xl font-bold">{pool.split}</span>
        </div>

        <p className="rounded-[16px] border-2 border-[#151515] bg-[#8de89a] px-4 py-3 text-xs font-bold leading-relaxed shadow-[2px_2px_0_0_#151515]">
          {paid
            ? '✓ Funds held in escrow. The host gets paid after 7 days.'
            : 'The host is paid only after the 7-day protection window.'}
        </p>
      </div>
    </aside>
  )
}
