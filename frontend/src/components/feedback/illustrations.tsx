import { cn } from '@/lib/utils'

/** Animated mailbox / envelope illustration used on the feedback page. */
export function MailScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 285" className={cn('block', className)} aria-hidden="true">
      <path
        d="M26 206C6 96 118 22 226 56"
        fill="none"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
        strokeDasharray="3 9"
      />
      <g transform="rotate(16 238 52)">
        <rect
          x="214"
          y="36"
          width="50"
          height="34"
          rx="5"
          fill="#fff"
          stroke="#151515"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
        <path
          d="M216 40l23 16 23-16"
          fill="none"
          stroke="#151515"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
      </g>
      <path
        transform="translate(46 66) scale(1.1)"
        d="M0 -12Q0 0 12 0Q0 0 0 12Q0 0 -12 0Q0 0 0 -12z"
        fill="#f8c93a"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.18"
      />
      <path
        transform="translate(268 138) scale(0.9)"
        d="M0 -12Q0 0 12 0Q0 0 0 12Q0 0 -12 0Q0 0 0 -12z"
        fill="#f8c93a"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.67"
      />
      <path
        transform="translate(150 34) scale(0.7)"
        d="M0 -12Q0 0 12 0Q0 0 0 12Q0 0 -12 0Q0 0 0 -12z"
        fill="#f8c93a"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.43"
      />
      <polygon
        points="64,132 150,66 236,132"
        fill="#ffd86b"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <g>
        <rect
          x="96"
          y="78"
          width="108"
          height="86"
          rx="6"
          fill="#fff"
          stroke="#151515"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <path
          d="M112 98h60M112 114h76M112 130h44"
          fill="none"
          stroke="#151515"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
        <rect
          x="170"
          y="122"
          width="22"
          height="22"
          rx="5"
          fill="#f7b4e6"
          stroke="#151515"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </g>
      <rect
        x="62"
        y="128"
        width="176"
        height="112"
        rx="12"
        fill="#fffdf4"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M64 134L150 196L236 134M64 236L126 184M236 236L174 184"
        fill="none"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <path
        d="M150 220c-14-9-20-16-20-23a10 10 0 0120-4 10 10 0 0120 4c0 7-6 14-20 23z"
        transform="translate(0 -8) scale(.9) translate(16 -4)"
        fill="#f7a1a1"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <g
        fill="none"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      >
        <path d="M34 238Q16 226 18 204" />
        <path d="M42 270l-4 12" />
        <path d="M62 266l6 14" />
        <path d="M262 238q22-8 20-34" />
        <path d="M252 272l-6 10" />
        <path d="M270 270l8 10" />
      </g>
      <g transform="rotate(-12 44 234)">
        <rect x="20" y="210" width="48" height="52" rx="9" fill="#1f7fe0" />
        <path
          d="M32 232q4 4 8 0M50 232q4 4 8 0M40 244q5 5 10 0"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
      <polygon
        points="256.0,206.0 263.5,215.3 275.3,213.0 275.1,225.0 285.5,230.8 277.7,239.8 282.0,251.0 270.1,252.9 266.3,264.2 256.0,258.0 245.7,264.2 241.9,252.9 230.0,251.0 234.3,239.8 226.5,230.8 236.9,225.0 236.7,213.0 248.5,215.3"
        fill="#f8c93a"
      />
      <g
        fill="none"
        stroke="#151515"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      >
        <path d="M246 232q4 4 8 0M260 232q4 4 8 0" />
        <path d="M251 243q5 5 10 0" />
      </g>
    </svg>
  )
}

/** Sprout avatar — a cute plant growing out of a pot, used on the profile hero. */
export function SproutAvatar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn('flex-none', className)} aria-hidden="true">
      <defs>
        <clipPath id="avc">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#f8d56b" />
      <g clipPath="url(#avc)">
        <path d="M20 108C12 62 30 34 52 34c24 0 40 28 30 74z" fill="#2fbf71" />
        <g
          fill="none"
          stroke="#151515"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 74Q10 66 12 50" />
          <path d="M80 74Q92 66 90 50" />
          <path d="M52 34V22" />
          <path d="M52 24c-8 0-12-5-12-10 8 0 12 4 12 10z" fill="#a4ecb0" />
          <path d="M40 56q4 4 8 0M58 56q4 4 8 0" strokeWidth="3.2" />
          <path d="M48 66q5 6 10 0" strokeWidth="3.2" />
        </g>
        <circle cx="36" cy="64" r="4" fill="#f7a1a1" opacity=".8" />
        <circle cx="70" cy="64" r="4" fill="#f7a1a1" opacity=".8" />
      </g>
      <circle cx="50" cy="50" r="46" fill="none" stroke="#151515" strokeWidth="3.5" />
    </svg>
  )
}

