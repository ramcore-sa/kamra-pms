import { useEffect, useState } from "react"
import { ArrowLeft, Printer } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { call } from "../lib/api"
import { Button } from "../components/ui/button"
import { cur, moneyLocale } from "../lib/money"
import { useT } from "../lib/i18n"

/** Printable cancellation confirmation - the guest's proof, with the
 * cancellation number front and center. */

interface Letter {
  property: {
    property_name: string
    logo_url: string | null
    address: string
    phone: string | null
    email: string | null
  }
  guest: { full_name: string; phone: string | null; email: string | null }
  reservation: {
    name: string
    room_type: string
    check_in_date: string
    check_out_date: string
    nights: number
    amount_after_tax: number
    cancellation_number: string
    cancellation_reason: string | null
    cancellation_fee: number
    cancelled_on: string
    advance_paid: number
  }
}

const inr = (n: number) =>
  Number(n).toLocaleString(moneyLocale(), { maximumFractionDigits: 0 })

export default function CancellationLetter() {
  const { name } = useParams()
  const { t } = useT()
  const [d, setD] = useState<Letter | null>(null)

  useEffect(() => {
    if (name)
      call<Letter>("kamra.api.cancellation_letter", { reservation: name }).then(
        setD,
      )
  }, [name])

  if (!d) return <p className="py-10 text-center text-zinc-400">{t("Loading…")}</p>

  const r = d.reservation
  const refundDue = Math.max(0, r.advance_paid - r.cancellation_fee)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          to="/reservations"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t("Reservations")}
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" aria-hidden /> {t("Print letter")}
        </Button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-8 print:border-0">
        <div className="mb-6 flex items-start justify-between border-b border-zinc-300 pb-4">
          <div>
            <h1 className="text-lg font-bold">{d.property.property_name}</h1>
            <p className="text-xs text-zinc-500">{d.property.address}</p>
            <p className="text-xs text-zinc-500">
              {d.property.phone}
              {d.property.email && <> · {d.property.email}</>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{t("CANCELLATION CONFIRMATION")}</p>
            <p className="text-lg font-bold text-brand-700">
              {r.cancellation_number}
            </p>
            <p className="text-xs text-zinc-500">
              {r.cancelled_on.slice(0, 16)}
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed">
          {t("Dear {name},", { name: d.guest.full_name })}
          <br />
          <br />
          {/* One sentence per variant so a translation can reorder freely. */}
          {r.cancellation_reason
            ? t(
                r.nights === 1
                  ? "This confirms that your reservation {res} - {room}, {from} to {to} (1 night) - has been cancelled ({reason})."
                  : "This confirms that your reservation {res} - {room}, {from} to {to} ({n} nights) - has been cancelled ({reason}).",
                {
                  res: r.name, room: r.room_type, from: r.check_in_date, to: r.check_out_date,
                  n: r.nights, reason: t(r.cancellation_reason),
                },
              )
            : t(
                r.nights === 1
                  ? "This confirms that your reservation {res} - {room}, {from} to {to} (1 night) - has been cancelled."
                  : "This confirms that your reservation {res} - {room}, {from} to {to} ({n} nights) - has been cancelled.",
                { res: r.name, room: r.room_type, from: r.check_in_date, to: r.check_out_date, n: r.nights },
              )}
        </p>

        <div className="mt-5 space-y-1.5 rounded-lg bg-zinc-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">{t("Stay value")}</span>
            <span>{cur()}{inr(r.amount_after_tax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">{t("Cancellation fee")}</span>
            <span>
              {r.cancellation_fee > 0 ? `${cur()}${inr(r.cancellation_fee)}` : t("None")}
            </span>
          </div>
          {r.advance_paid > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-zinc-500">{t("Advance paid")}</span>
                <span>{cur()}{inr(r.advance_paid)}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-medium">
                <span>{t("Refund due")}</span>
                <span>{cur()}{inr(refundDue)}</span>
              </div>
            </>
          )}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-zinc-600">
          {d.property.phone
            ? t(
                "Please keep the cancellation number {num} for your records. We'd love to host you another time - call us on {phone} and we'll find you a room.",
                { num: r.cancellation_number, phone: d.property.phone },
              )
            : t(
                "Please keep the cancellation number {num} for your records. We'd love to host you another time - reach out any time and we'll find you a room.",
                { num: r.cancellation_number },
              )}
        </p>

        <p className="mt-8 text-sm text-zinc-500">
          {t("Warm regards,")}
          <br />
          <span className="font-medium text-zinc-900">
            {d.property.property_name}
          </span>
        </p>
      </div>
    </div>
  )
}
