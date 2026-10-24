import { Fragment, useEffect, useState, type ReactNode } from "react"
import { Check, Copy, KeyRound, RefreshCw, Terminal } from "lucide-react"

import {
  developerInfo,
  generateApiKey,
  getCurrentProperty,
} from "../lib/api"
import { serverError } from "../lib/resource"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useT } from "../lib/i18n"

/** Put elements (a <code> span) into a translated sentence at its {name}
 *  placeholders, so the sentence stays one catalogue key and Arabic can move
 *  the code wherever its word order needs it. */
function rich(s: string, nodes: Record<string, ReactNode>): ReactNode[] {
  return s.split(/(\{\w+\})/).map((part, i) => {
    const k = /^\{(\w+)\}$/.exec(part)?.[1]
    return k && k in nodes ? <Fragment key={i}>{nodes[k]}</Fragment> : part
  })
}

function Copyable({ label, value }: { label: string; value: string }) {
  const { t } = useT()
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-500">{label}</div>
      <div className="flex items-stretch gap-2">
        <code className="flex-1 overflow-x-auto rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-800">
          {value}
        </code>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1200)
          }}
          className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-600 hover:border-brand-600 hover:text-brand-700"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? t("Copied") : t("Copy")}
        </button>
      </div>
    </div>
  )
}

const ENDPOINTS: { group: string; rows: [string, string][] }[] = [
  {
    group: "Availability & booking",
    rows: [
      ["availability_calendar", "Rooms × dates with live rates"],
      ["booking_options", "Room types, meal & rate plans, add-ons"],
      ["get_quote", "Deterministic priced quote for a stay"],
      ["create_booking", "Create a reservation (guest deduped by phone)"],
    ],
  },
  {
    group: "Front desk",
    rows: [
      ["front_desk_snapshot", "Arrivals, departures, in-house, room board"],
      ["reservation_detail", "Full 360 for one booking"],
      ["check_in / check_out", "Move a stay through its lifecycle"],
      ["amend_stay / move_reservation", "Change dates or room (re-prices)"],
    ],
  },
  {
    group: "Money",
    rows: [
      ["get_folio / reservation_folios", "Folios for a stay"],
      ["add_folio_charge / add_folio_payment", "Post charges & payments"],
      ["folio_invoice / close_folio", "GST invoice + number assignment"],
      ["record_advance / folio_payment_link", "Deposits & payment links"],
    ],
  },
]

export default function Developers() {
  const { t } = useT()
  const [info, setInfo] = useState<{
    user: string
    has_key: boolean
    base_url: string
  } | null>(null)
  const [key, setKey] = useState<{ api_key: string; api_secret: string } | null>(
    null,
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const property = getCurrentProperty()

  useEffect(() => {
    developerInfo()
      .then(setInfo)
      .catch((e) => setError(serverError(e)))
  }, [])

  async function generate() {
    if (
      info?.has_key &&
      !confirm(
        t("Rotating your key invalidates the old one. Any integration using it will stop working. Continue?"),
      )
    )
      return
    setBusy(true)
    setError(null)
    try {
      const k = await generateApiKey()
      setKey(k)
      setInfo((i) => (i ? { ...i, has_key: true } : i))
    } catch (e) {
      setError(serverError(e))
    } finally {
      setBusy(false)
    }
  }

  const base = info?.base_url ?? window.location.origin
  const authHeader = key
    ? `token ${key.api_key}:${key.api_secret}`
    : "token <api_key>:<api_secret>"

  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div>
        <h1 className="text-xl font-semibold">{t("Developers")}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          {t("Your API key, the REST surface, and how to connect AI agents. Every call runs with your roles and lands in the audit log.")}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* API key */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="size-4 text-zinc-400" /> {t("Your API key")}
            </CardTitle>
            <p className="mt-0.5 text-xs text-zinc-400">
              {rich(t("Signed in as {user}. The secret is shown once - copy it now."), {
                user: <code className="text-zinc-500">{info?.user}</code>,
              })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {key ? (
            <>
              <Copyable label={t("API key")} value={key.api_key} />
              <Copyable label={t("API secret")} value={key.api_secret} />
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {t("Store the secret somewhere safe now - it can't be shown again. Rotate any time from here.")}
              </p>
            </>
          ) : (
            <p className="text-sm text-zinc-600">
              {info?.has_key
                ? t("You already have an API key. Rotate it below to get a fresh key + secret.")
                : t("You don't have an API key yet. Generate one to call the REST API or connect an agent.")}
            </p>
          )}
          <Button onClick={generate} disabled={busy}>
            <RefreshCw className="size-4" />
            {busy
              ? t("Generating…")
              : info?.has_key
                ? t("Rotate API key")
                : t("Generate API key")}
          </Button>
        </CardContent>
      </Card>

      {/* REST quickstart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="size-4 text-zinc-400" /> REST API
            </CardTitle>
            <p className="mt-0.5 text-xs text-zinc-400">
              {rich(t("Base URL {url}. Authenticate with the token header on every request."), {
                url: <code className="text-zinc-500">{base}</code>,
              })}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Copyable label={t("Authorization header")} value={`Authorization: ${authHeader}`} />
          <div>
            <div className="mb-1 text-xs font-medium text-zinc-500">
              {t("Example - today's front desk")}
            </div>
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs leading-relaxed text-zinc-100">
{`curl -X POST ${base}/api/method/kamra.api.front_desk_snapshot \\
  -H "Authorization: ${authHeader}" \\
  -H "Content-Type: application/json" \\
  -d '{"property": "${property}"}'`}
            </pre>
          </div>
          <p className="text-xs text-zinc-400">
            {t("Full reference:")}{" "}
            <a
              href="https://github.com/Kamra-PMS/kamra-pms/blob/main/docs/ai-and-api.md"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-700 hover:underline"
            >
              docs/ai-and-api.md →
            </a>
          </p>
        </CardContent>
      </Card>

      {/* endpoint reference */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Key endpoints")}</CardTitle>
          <p className="mt-0.5 text-xs text-zinc-400">
            {rich(t("All under {path} (POST, JSON). Role-gated the same as the UI."), {
              path: <code className="text-zinc-500">/api/method/kamra.api.&lt;name&gt;</code>,
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {ENDPOINTS.map((sec) => (
            <div key={sec.group}>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {t(sec.group)}
              </div>
              <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-100">
                {sec.rows.map(([name, desc]) => (
                  <div
                    key={name}
                    className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <code className="font-mono text-xs text-zinc-800">{name}</code>
                    <span className="text-xs text-zinc-500">{t(desc)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MCP */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Connect an AI agent (MCP)")}</CardTitle>
          <p className="mt-0.5 text-xs text-zinc-400">
            {rich(t("Point Claude at this property over MCP. Staff should use {link}. The key above is for unattended / service integrations."), {
              link: (
                <a href="/kamra/assistant" className="font-medium text-brand-700 hover:underline">
                  {t("Kamra Agent → Connect Claude")}
                </a>
              ),
            })}
          </p>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs leading-relaxed text-zinc-700">
{`claude mcp add --transport http kamra ${base}/mcp`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
