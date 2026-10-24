/*  Where this function is, and what's left.

    Flat tabs tell you what screens exist. They don't tell you that the
    quote is unsent, the hall unconfirmed and nothing collected — which is
    the only thing a banquet manager actually wants to know when they open
    a function.

    So the nav is the process, numbered and in order: each step carries a
    tick when it's genuinely done, a live line of what it holds right now,
    and — when it isn't done — the one thing standing in the way. You can
    still jump anywhere; nothing is locked. A step that isn't ready just
    says so instead of pretending. */

import { Check } from "lucide-react"

import type { FunctionSheet } from "../../lib/api"
import { inr } from "./shared"
import { t, useT } from "../../lib/i18n"

export type StepId =
  | "enquiry"
  | "quote"
  | "margin"
  | "money"
  | "documents"
  | "close"

export interface Step {
  id: StepId
  n: number
  label: string
  /** What this step holds right now - shown under the label. */
  state: string
  done: boolean
  /** The one thing standing in the way, when it isn't done. */
  blocker?: string
}

/** Read the steps off the function itself, so the nav can never disagree
 *  with the sheet it's describing. Called during render, so the module t()
 *  reads the language current at that moment. */
export function stepsFor(fn: FunctionSheet): Step[] {
  const lines = fn.items.length
  const quoted = (fn.quote_version ?? 0) > 0
  const emailed = Boolean(fn.quote_emailed_on)
  const sold = fn.status === "Confirmed" || fn.status === "Completed"
  const costed = fn.total_cost > 0
  const collected = fn.advance_received > 0
  const paper = Boolean(fn.beo_generated_on)
  const closed = Boolean(fn.closed_out_on)

  return [
    {
      id: "enquiry",
      n: 1,
      label: t("Enquiry"),
      state: [
        fn.venue?.split("-").pop(),
        fn.session ? t(fn.session) : null,
        fn.billable_pax ? t("{n} pax", { n: fn.billable_pax }) : null,
      ]
        .filter(Boolean)
        .join(" · "),
      done: Boolean(fn.venue && fn.event_date && fn.pax_guaranteed),
      blocker: !fn.pax_guaranteed ? t("No guaranteed pax yet") : undefined,
    },
    {
      id: "quote",
      n: 2,
      label: t("Quote"),
      state: lines
        ? (lines === 1
            ? t("1 line · {amt}", { amt: inr(fn.grand_total) })
            : t("{n} lines · {amt}", { n: lines, amt: inr(fn.grand_total) }))
        : t("Nothing priced"),
      done: lines > 0,
      blocker: !lines ? t("Add the menu and the extras") : undefined,
    },
    {
      id: "margin",
      n: 3,
      label: t("Margin"),
      state: costed
        ? t("{pct}% · {amt}", { pct: fn.margin_percent, amt: inr(fn.gross_margin) })
        : t("Not costed"),
      done: costed,
      blocker: !costed ? t("Choose the dishes, or cost the services") : undefined,
    },
    {
      id: "money",
      n: 4,
      label: t("Money"),
      state: collected
        ? t("{in} in · {due} due", { in: inr(fn.advance_received), due: inr(fn.balance_due) })
        : fn.payment_terms.length
          ? t("{n} milestones · nothing in", { n: fn.payment_terms.length })
          : t("No terms set"),
      done: collected,
      blocker: !fn.payment_terms.length
        ? t("Set the payment schedule")
        : !collected
          ? t("Nothing received yet")
          : undefined,
    },
    {
      id: "documents",
      n: 5,
      label: t("Documents"),
      state: quoted
        ? [
            t("Quote v{n}", { n: fn.quote_version ?? 0 }),
            emailed ? t("emailed") : null,
            paper ? t("event order out") : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : t("Nothing issued"),
      done: quoted && emailed,
      blocker: !quoted
        ? t("Stamp the quotation")
        : !emailed
          ? t("Email the quote to the guest")
          : undefined,
    },
    {
      id: "close",
      n: 6,
      label: t("The night"),
      state: closed
        ? t("Closed out")
        : sold
          ? fn.pax_actual
            ? t("{n} served", { n: fn.pax_actual })
            : t("Not counted yet")
          : t("After the function"),
      done: closed,
      blocker: !sold ? t("Confirm the function first") : undefined,
    },
  ]
}

export function Steps({
  steps,
  current,
  onPick,
}: {
  steps: Step[]
  current: StepId
  onPick: (id: StepId) => void
}) {
  const { t } = useT()
  return (
    // A grid, not a scrolling strip: six steps always fit the width they're
    // given, wrapping to two or three rows on a narrow screen rather than
    // hiding the last step off the right edge.
    <nav aria-label={t("Function progress")}>
      <ol className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((s) => {
          const active = s.id === current
          return (
            <li key={s.id} className="min-w-0">
              <button
                onClick={() => onPick(s.id)}
                aria-current={active ? "step" : undefined}
                className={
                  "group flex h-full w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-all " +
                  (active
                    ? "border-brand-600 bg-brand-50/70 ring-1 ring-brand-600/20"
                    : "border-transparent hover:border-zinc-200 hover:bg-zinc-50")
                }
              >
                <span className="flex items-center gap-2">
                  <span
                    className={
                      "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold " +
                      (s.done
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-brand-600 text-white"
                          : "bg-zinc-200 text-zinc-500 group-hover:bg-zinc-300")
                    }
                  >
                    {s.done ? <Check className="size-3" /> : s.n}
                  </span>
                  <span
                    className={
                      "truncate text-sm font-medium " +
                      (active ? "text-brand-800" : "text-zinc-700")
                    }
                  >
                    {s.label}
                  </span>
                </span>
                <span
                  title={s.done ? s.state : (s.blocker ?? s.state)}
                  className={
                    "line-clamp-2 pl-7 text-xs " +
                    (s.done
                      ? "text-zinc-500"
                      : s.blocker
                        ? "text-amber-700"
                        : "text-zinc-400")
                  }
                >
                  {s.done ? s.state : (s.blocker ?? s.state)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
