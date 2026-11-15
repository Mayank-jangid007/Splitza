import { notFound } from 'next/navigation'
import { LEGAL_DOCS, type LegalKey } from '@/lib/legal-content'
import { LegalDocument } from '@/components/auth/legal-document'

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params
  const d = LEGAL_DOCS[doc as LegalKey]
  if (!d) notFound()
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-6 font-display-tight text-3xl font-black">{d.title}</h1>
      <LegalDocument doc={d} />
    </main>
  )
}
