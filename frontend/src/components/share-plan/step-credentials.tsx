'use client'

import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { validateInviteLink, type CredentialMethod, type PoolDraft } from '@/lib/pool'
import { Field, Segmented, TextInput } from './neo'
import { StepHeader } from './step-header'

export function StepCredentials({ draft, update }: { draft: PoolDraft; update: (p: Partial<PoolDraft>) => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [linkTouched, setLinkTouched] = useState(false)
  const linkError = linkTouched ? validateInviteLink(draft.inviteLink) : null

  return (
    <section className="flex flex-col gap-6" aria-labelledby="step-heading">
      <StepHeader
        kicker="Access"
        title="Hand over the keys."
        description="Members get access only after they've paid. You can rotate credentials any time."
      />

      <div className="flex flex-col gap-5 rounded-3xl border-2 border-ink bg-paper p-5 hard-shadow sm:p-6">
        <Field label="How do members get in?">
          <Segmented<CredentialMethod>
            label="Access method"
            value={draft.credentialMethod}
            onChange={(v) => update({ credentialMethod: v })}
            options={[
              { value: 'login', label: 'Login details' },
              { value: 'invite', label: 'Family invite link' },
            ]}
          />
        </Field>

        {draft.credentialMethod === 'login' ? (
          <div className="flex flex-col gap-5">
            <Field label="Email or username" htmlFor="cred-username">
              <TextInput
                id="cred-username"
                value={draft.username}
                onChange={(e) => update({ username: e.target.value })}
                placeholder="account@email.com"
                autoComplete="off"
                spellCheck={false}
              />
            </Field>
            <Field label="Password" htmlFor="cred-password">
              <TextInput
                id="cred-password"
                type={showPassword ? 'text' : 'password'}
                value={draft.password}
                onChange={(e) => update({ password: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="grid size-8 place-items-center rounded-lg hover:bg-ink/5"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />
            </Field>
          </div>
        ) : (
          <Field
            label="Invite link"
            htmlFor="cred-invite"
            error={linkError}
            hint="Paste the family or team invite URL from the provider."
          >
            <TextInput
              id="cred-invite"
              type="url"
              value={draft.inviteLink}
              onChange={(e) => update({ inviteLink: e.target.value })}
              onBlur={() => setLinkTouched(true)}
              placeholder="https://"
              autoComplete="off"
              spellCheck={false}
              invalid={!!linkError}
            />
          </Field>
        )}

        <div className="flex items-start gap-3 rounded-2xl border-2 border-dashed border-ink/40 bg-mint/30 px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-mint">
            <ShieldCheck className="size-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-bold">Encrypted end to end</p>
            <p className="text-xs leading-relaxed text-ink/70">
              Credentials are encrypted before storage and are never shown in your pool listing.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
