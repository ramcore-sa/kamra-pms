import { useCallback, useEffect, useState } from "react"
import { call, getCurrentProperty } from "../lib/api"
import { listResource, serverError, type Row } from "../lib/resource"
import { useCashierAuth } from "../lib/cashierAuth"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { moneyLocale } from "../lib/money"
import { useT } from "../lib/i18n"

const inr = (n: unknown) =>
  Number(n ?? 0).toLocaleString(moneyLocale(), { maximumFractionDigits: 0 })

const CATS = [
  "Supplies",
  "Maintenance",
  "Transport",
  "Staff Welfare",
  "Miscellaneous",
]

export default function PettyCash() {
  const { withPin } = useCashierAuth()
  const { t } = useT()
  const [rows, setRows] = useState<Row[]>([])
  const [payee, setPayee] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("Miscellaneous")
  const [reason, setReason] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    listResource("Petty Cash Voucher", {
      fields: [
        "name", "voucher_date", "payee", "category", "amount", "reason", "status",
      ],
      filters: [["property", "=", getCurrentProperty()]],
      orderBy: "creation desc",
      limit: 50,
    }).then(setRows).catch((e) => setErr(serverError(e)))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submit = async () => {
    setBusy(true)
    setErr(null)
    try {
      await withPin(async (pin) => {
        await call("kamra.cashier.post_petty_cash", {
          property: getCurrentProperty(),
          amount: Number(amount),
          payee,
          category,
          reason,
          pin,
        })
      })
      setPayee("")
      setAmount("")
      setReason("")
      load()
    } catch (e) {
      setErr(serverError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
          {t("Cashier")}
        </p>
        <h1 className="text-2xl font-semibold">{t("Petty Cash")}</h1>
      </div>
      {err ? <p className="text-sm text-rose-600">{err}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("New voucher")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder={t("Payee")}
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
          />
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder={t("Amount")}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>{t(c)}</option>
            ))}
          </select>
          <input
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
            placeholder={t("Reason")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            disabled={busy || !payee || !amount || !reason}
            onClick={() => void submit()}
          >
            {t("Post voucher")}
          </Button>
        </CardContent>
      </Card>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-zinc-400">
            <tr>
              <th className="px-3 py-2">{t("Date")}</th>
              <th className="px-3 py-2">{t("Payee")}</th>
              <th className="px-3 py-2">{t("Category")}</th>
              <th className="px-3 py-2">{t("Amount")}</th>
              <th className="px-3 py-2">{t("Reason")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.name)} className="border-t border-zinc-50">
                <td className="px-3 py-2">{String(r.voucher_date)}</td>
                <td className="px-3 py-2">{String(r.payee)}</td>
                <td className="px-3 py-2">{t(String(r.category))}</td>
                <td className="px-3 py-2 tabular-nums">{inr(r.amount)}</td>
                <td className="px-3 py-2 text-zinc-500">{String(r.reason)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
