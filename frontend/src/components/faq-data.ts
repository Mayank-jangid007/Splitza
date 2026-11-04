export type CategoryKey =
  | 'All'
  | 'Getting started'
  | 'Payments & escrow'
  | 'Hosting'
  | 'Joining'
  | 'Problems & safety'

export type FaqCategory = {
  key: CategoryKey
  color: string
}

export const CATEGORIES: FaqCategory[] = [
  { key: 'All', color: '#b3a6f7' },
  { key: 'Getting started', color: '#f5aee3' },
  { key: 'Payments & escrow', color: '#a4ecb0' },
  { key: 'Hosting', color: '#f8d56b' },
  { key: 'Joining', color: '#a9c7f7' },
  { key: 'Problems & safety', color: '#ff6b5e' },
]

export type FaqItem = {
  q: string
  a: string
  category: Exclude<CategoryKey, 'All'>
}

export const FAQ: FaqItem[] = [
  // ── Getting started ──
  {
    category: 'Getting started',
    q: 'What is Splitza?',
    a: 'Splitza lets you split the cost of subscription plans (Netflix, Spotify, Google One, etc.) with others. Host a pool to share your plan and earn, or join a pool to pay only your share.',
  },
  {
    category: 'Getting started',
    q: 'How do I create an account?',
    a: 'Click "Sign up" and register with your email. You\'ll receive an OTP to verify your account. You can also sign up directly with Google for instant access.',
  },
  {
    category: 'Getting started',
    q: 'Is Splitza free to use?',
    a: 'Yes. Creating an account, browsing the marketplace, and hosting pools are all free. You only pay your share of the subscription when you join a pool.',
  },

  // ── Payments & escrow ──
  {
    category: 'Payments & escrow',
    q: 'How does escrow work?',
    a: 'When you join a pool, your payment is held safely in escrow. The host only receives the payout after the protection window passes and the plan is confirmed active. If something goes wrong, your money is protected.',
  },
  {
    category: 'Payments & escrow',
    q: 'Is my payment safe?',
    a: 'Yes. We use UPI-based escrow. Your money is locked when you join and only released to the host after the plan is active. If the host fails to deliver, you can dispute and get a refund.',
  },
  {
    category: 'Payments & escrow',
    q: 'How and when does the host get paid?',
    a: 'Host payouts are released in weekly increments after the pool goes active. The total collected from members is split into 4 weekly payouts, each released as the protection window passes.',
  },
  {
    category: 'Payments & escrow',
    q: 'What payment methods are supported?',
    a: 'We currently support UPI payments (Google Pay, PhonePe, Paytm, BHIM). You\'ll scan a QR code or use a direct UPI link to authorize your upfront payment.',
  },

  // ── Hosting ──
  {
    category: 'Hosting',
    q: 'How do I host a pool?',
    a: 'Click "Share a plan" from your dashboard, pick the subscription you pay for, set the number of seats and price per seat, add credentials, and publish. Members will join and their payments go into escrow.',
  },
  {
    category: 'Hosting',
    q: 'How do I set the price per seat?',
    a: 'You set the total plan cost and the number of seats. Splitza automatically calculates the per-seat price. You can also set a custom price per seat during pool creation.',
  },
  {
    category: 'Hosting',
    q: 'Can I make my pool private?',
    a: 'Yes. During pool creation, choose "Private" visibility. Private pools don\'t appear in the marketplace — you get an invite link to share with specific people.',
  },
  {
    category: 'Hosting',
    q: 'What happens when all seats are filled?',
    a: 'When the last seat is filled, the pool automatically becomes ACTIVE. The billing cycle starts, credentials are shared with all members, and your weekly payouts begin.',
  },

  // ── Joining ──
  {
    category: 'Joining',
    q: 'How do I join a pool?',
    a: 'Browse the marketplace, pick a pool with open seats, review the plan details, enter your UPI ID, and pay your share. Your credentials unlock as soon as payment is verified.',
  },
  {
    category: 'Joining',
    q: 'How are credentials shared securely?',
    a: 'Login credentials are encrypted (AES-256-GCM) and only decrypted when you request access. They are never shared in plain text or visible to anyone outside the pool.',
  },
  {
    category: 'Joining',
    q: 'Can I join a private pool?',
    a: 'Only if the host shares an invite link with you. Private pools are never listed in the marketplace. Click the invite link, verify your UPI payment, and you\'re in.',
  },
  {
    category: 'Joining',
    q: 'Can I leave a pool after joining?',
    a: 'You can leave a pool, but upfront payments for fixed-term plans are non-refundable once the plan is active. For monthly plans, you simply stop paying for the next cycle.',
  },

  // ── Problems & safety ──
  {
    category: 'Problems & safety',
    q: 'What if the host stops sharing?',
    a: 'Every pool has a trust and dispute system. If the host fails to provide access, you can cast a dispute vote. If enough members dispute, the escrow is refunded to members automatically.',
  },
  {
    category: 'Problems & safety',
    q: 'What if I can\'t log in to the shared account?',
    a: 'Report the access issue immediately. The host\'s payout is frozen until the problem is resolved. If it remains unresolved, your escrow payment is refunded.',
  },
  {
    category: 'Problems & safety',
    q: 'Is my personal information safe?',
    a: 'Your password is hashed with bcrypt. Google OAuth users\' tokens are never stored. Credential encryption uses AES-256-GCM with a server-side key. We never share your data with third parties.',
  },
  {
    category: 'Problems & safety',
    q: 'How do I report a problem?',
    a: 'Use the "Report an access issue" button on the FAQ page, or contact us directly at feedback@splitza.app. Our team responds within 24 hours.',
  },
]
