import { useEffect, useState } from "react"
import { call, getCurrentProperty } from "../lib/api"
import { Button } from "./ui/button"
import type { Row } from "../lib/resource"
import { useT } from "../lib/i18n"

/** Which charge types bill to the company on corporate stays. Anything
 * unchecked - and all alcohol, always - goes to the guest folio. */

const ROUTABLE = [
  "Room",
  "Meal Plan",
  "Food & Beverage",
  "Minibar",
  "Laundry",
  "Spa",
  "Early Check-in",
  "Late Checkout",
  "Misc",
]

interface Rule {
  charge_type: string
  pay_by: string
}

interface BillingDefault {
  credit_allowed: boolean
  has_rules: boolean
  default: string
  charge_types: string[] | null
  applies: boolean
}

/** "Room and F&B (liquor to guest)" -> "Room and F&B" for the note. */
function shortLabel(d: BillingDefault) {
  return d.default.replace(/\s*\(.*\)\s*$/, "")
}

export default function BillingRulesEditor({ row }: { row: Row; reload: () => void }) {
  const { t } = useT()
  const [toCompany, setToCompany] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [fallback, setFallback] = useState<BillingDefault | null>(null)

  function loadDefault() {
    call<BillingDefault>("kamra.api.company_billing_default", {
      company: row.name,
      property: getCurrentProperty(),
    })
      .then(setFallback)
      .catch(() => setFallback(null))
  }

  useEffect(() => {
    call<Rule[]>("kamra.api.get_billing_rules", { company: row.name }).then(
      (rules) =>
        setToCompany(
          new Set(
            rules.filter((r) => r.pay_by === "Company").map((r) => r.charge_type),
          ),
        ),
    )
    loadDefault()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.name])

  function toggle(ct: string) {
    setSaved(false)
    setToCompany((prev) => {
      const next = new Set(prev)
      if (next.has(ct)) next.delete(ct)
      else next.add(ct)
      return next
    })
  }

  async function save() {
    setBusy(true)
    try {
      await call("kamra.api.set_billing_rules", {
        company: row.name,
        rules: ROUTABLE.filter((ct) => toCompany.has(ct)).map((ct) => ({
          charge_type: ct,
          pay_by: "Company",
        })),
      })
      setSaved(true)
      loadDefault()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-t border-zinc-200 pt-4">
      <h3 className="text-sm font-medium text-zinc-600">{t("Billing rules")}</h3>
      <p className="mb-2 mt-0.5 text-xs text-zinc-400">
        {t("Ticked charge types post to the Company folio on corporate stays. Everything else - and alcohol, always - bills to the guest.")}
      </p>
      {fallback?.applies && (
        <p className="mb-2 rounded-md bg-brand-50 px-2 py-1.5 text-xs text-brand-700">
          {t("No rules: using the property default - {policy}", { policy: t(shortLabel(fallback)) })}
          {fallback.charge_types === null
            ? t(" (every charge except liquor).")
            : fallback.charge_types.length
              ? t(" ({types}).", { types: fallback.charge_types.map((ct) => t(ct)).join(", ") })
              : t(" (the company pays nothing).")}{" "}
          {t("Change it in Settings, Finance. Saving rules here replaces the default for this company.")}
        </p>
      )}
      {fallback && !fallback.credit_allowed && !fallback.has_rules && (
        <p className="mb-2 text-xs text-zinc-400">
          {t("No rules and no credit: everything bills to the guest.")}
        </p>
      )}
      <div className="mb-2 flex gap-1.5">
        <button
          className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:border-brand-600"
          onClick={() => {
            setSaved(false)
            setToCompany(new Set(["Room", "Meal Plan"]))
          }}
        >
          {t("Stay only")}
        </button>
        <button
          className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:border-brand-600"
          onClick={() => {
            setSaved(false)
            setToCompany(new Set(ROUTABLE))
          }}
        >
          {t("Everything")}
        </button>
        <button
          className="rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:border-brand-600"
          onClick={() => {
            setSaved(false)
            setToCompany(new Set())
          }}
        >
          {t("Nothing")}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {ROUTABLE.map((ct) => (
          <label key={ct} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-brand-600"
              checked={toCompany.has(ct)}
              onChange={() => toggle(ct)}
            />
            {t(ct)}
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" disabled={busy} onClick={save}>
          {busy ? t("Saving…") : t("Save rules")}
        </Button>
        {saved && <span className="text-xs text-emerald-600">{t("Saved")}</span>}
      </div>
    </div>
  )
}
