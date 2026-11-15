/**
 * Policy text shown in the register consent dialog (and optionally on /legal/* pages).
 * Bump LEGAL_VERSION whenever any text below changes: it is stored with each user's consent.
 */
export const LEGAL_VERSION = '2026-11'
export const LEGAL_UPDATED = 'November 2026'

export type LegalKey = 'terms' | 'privacy' | 'refund'
export type LegalItem = { lead?: string; text: string }
export type LegalSection = { heading: string; items: LegalItem[] }
export type LegalDoc = {
  key: LegalKey
  title: string
  tab: string
  updated?: string
  intro?: string
  sections: LegalSection[]
}

export const LEGAL_ORDER: LegalKey[] = ['terms', 'privacy', 'refund']

export const LEGAL_DOCS: Record<LegalKey, LegalDoc> = {
  terms: {
    key: 'terms',
    title: 'Terms of Service',
    tab: 'Terms of Service',
    updated: LEGAL_UPDATED,
    intro:
      'Welcome to Splitza (splitza-nine.vercel.app). By creating an account or using our platform, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.',
    sections: [
      {
        heading: '1. Nature of Service (Intermediary Safe Harbor)',
        items: [
          { text: 'Splitza is a pure technology utility and peer-to-peer (P2P) expense management ledger.' },
          { text: 'We provide the digital infrastructure, ledgers, and payment routing mechanisms to help users calculate and track shared group expenses.' },
          { text: 'Splitza does not own, host, sell, resell, or distribute any digital subscriptions, accounts, credentials, or copyrighted material.' },
        ],
      },
      {
        heading: '2. User Responsibilities & Third-Party Compliance',
        items: [
          { lead: 'Host Declarations:', text: ' Any user who creates a shared pool (the “Host”) explicitly declares and warrants that their shared plan fully complies with the Terms of Service, end-user license agreements, and household/team policies of that specific third-party software or service provider.' },
          { lead: 'Indemnification:', text: ' The Host assumes 100% legal and financial liability for the pool they create. Splitza acts strictly as a neutral intermediary under Section 79 of India’s Information Technology Act, 2000, and is completely exempt from liability arising from user-generated pools or plan violations.' },
          { lead: 'Data and Access Privacy:', text: ' Users sharing workspaces (e.g., Canva, Notion) must use dedicated, empty environments. Splitza is not responsible for data loss, account takeovers, or unauthorized access within third-party platforms.' },
        ],
      },
      {
        heading: '3. Escrow, Settlements, and Dispute Buffer',
        items: [
          { text: 'Splitza acts as a temporary ledger holder for peer-to-peer settlements. Funds collected from co-subscribers are marked as “Pending Settlement” in a secure wallet buffer.' },
          { lead: 'The 72-Hour Security Window:', text: ' To prevent fraud, all payouts to the Host are subject to a mandatory 72-hour holding period.' },
          { text: 'If a co-subscriber raises a valid access dispute within this 72-hour window, Splitza reserves the right to freeze the funds until the dispute is resolved or issue a refund to the co-subscriber.' },
          { text: 'Splitza charges a nominal technology platform fee for processing and maintaining these digital ledgers.' },
        ],
      },
    ],
  },
  privacy: {
    key: 'privacy',
    title: 'Privacy Policy',
    tab: 'Privacy Policy',
    updated: LEGAL_UPDATED,
    intro: 'Splitza values your privacy. This policy outlines how we collect and protect your data.',
    sections: [
      {
        heading: '1. Information We Collect',
        items: [
          { lead: 'Account Data:', text: ' Name, email address, and mobile number (optional) collected during registration.' },
          { lead: 'Payment Logs:', text: ' Transaction references processed securely through our third-party payment gateway partners. Splitza never stores your full card numbers, CVV, or net banking passwords.' },
        ],
      },
      {
        heading: '2. How We Use Data',
        items: [
          { text: 'To maintain your group ledgers and calculate expense distributions.' },
          { text: 'To process peer-to-peer payout settlements to Hosts.' },
          { text: 'To detect, prevent, and mitigate fraudulent pools or malicious user behavior.' },
        ],
      },
      {
        heading: '3. Third-Party Disclosures',
        items: [
          { text: 'Your data is only shared with authorized financial intermediaries (like payment gateways) to process transactions. We do not sell or rent your personal information to third-party advertisers.' },
        ],
      },
    ],
  },
  refund: {
    key: 'refund',
    title: 'Refund & Cancellation Policy',
    tab: 'Refund & Cancellation',
    sections: [
      {
        heading: '1. Service Disputes',
        items: [
          { text: 'If a Host fails to provide access to the shared tool, or changes credentials unexpectedly, the co-subscriber must click the “Dispute Access” button within 72 hours of joining the pool or within the current billing cycle’s verification window.' },
          { text: 'Once a dispute is validated by our system, the pending funds will be fully refunded to the co-subscriber’s Splitza wallet or original payment source.' },
        ],
      },
      {
        heading: '2. Payout Cancellations',
        items: [
          { text: 'Once funds pass the 72-hour security buffer and move to the Host’s “Withdrawable Balance,” the transaction is considered settled and non-refundable by the platform. Any further settlements must be handled peer-to-peer between the users.' },
        ],
      },
    ],
  },
}
