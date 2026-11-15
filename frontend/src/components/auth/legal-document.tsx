import type { LegalDoc } from '@/lib/legal-content'

/** Renders one policy. Used inside the dialog, and can be reused on /legal/* pages. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className="text-sm leading-relaxed">
      {doc.updated && (
        <span className="mb-3 inline-block rounded-full border-2 border-ink bg-lav px-2.5 py-0.5 text-[11px] font-bold text-[#141414]">
          Last Updated: {doc.updated}
        </span>
      )}
      {doc.intro && <p className="mb-1">{doc.intro}</p>}
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h4 className="mb-2 mt-5 font-display-tight text-sm font-bold">{s.heading}</h4>
          <ul className="list-disc space-y-2 pl-5">
            {s.items.map((it, i) => (
              <li key={i}>
                {it.lead && <b className="font-bold">{it.lead}</b>}
                {it.text}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
