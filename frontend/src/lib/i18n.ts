import { useCallback, useEffect, useState } from "react"
import { getLang, type Lang } from "./dir"
import ar from "../i18n/locales/ar.json"

/** Locale dictionaries keyed by English source string. Missing keys fall back
 * to English so the app never blanks as coverage expands. */
const DICT: Record<string, Record<string, string>> = {
  en: {},
  ar: ar as Record<string, string>,
}

/** The site's own catalogue (every installed app's translations plus the
 * Translation doctype), fetched per language at boot. The bundle above is
 * frozen at build time; this is how a string added later, or translated by
 * an app installed on the site, reaches the screen without a rebuild.
 *
 * The bundle wins where it has the key: it was written for these screens,
 * while the site catalogue is shared with the desk, where the same English
 * word can mean something else (an HR "Check-in" is not a guest's). The site
 * catalogue fills only what the bundle lacks. */
const SITE: Record<string, Record<string, string>> = {}
const loading: Record<string, Promise<void>> = {}

/** Fired when a site catalogue arrives, so mounted screens re-render with it.
 * Separate from `kamra:lang`: the language has not changed, only the words. */
const LOADED = "kamra:i18n"

function lookup(lang: Lang, s: string): string {
  return DICT[lang]?.[s] ?? SITE[lang]?.[s] ?? s
}

/** Fetch the site catalogue for a language once. Failure is silent on
 * purpose: the bundle still covers most of the UI, and a screen must never
 * fail to render because a translation request did. */
export function loadSiteTranslations(lang: Lang = getLang()): Promise<void> {
  if (lang === "en") return Promise.resolve()
  if (!loading[lang]) {
    loading[lang] = fetch(
      `/api/method/kamra.public_api.ui_translations?lang=${encodeURIComponent(lang)}`,
      // Guest on purpose, like callGuest: the catalogue is public and the
      // public booking pages must not depend on a staff session or its CSRF.
      { credentials: "omit" },
    )
      .then((r) => (r.ok ? r.json() : { message: {} }))
      .then((body: { message?: Record<string, string> }) => {
        SITE[lang] = body.message ?? {}
        window.dispatchEvent(new Event(LOADED))
      })
      .catch(() => {
        // Let a later language switch try again.
        delete loading[lang]
      })
  }
  return loading[lang]
}

/** Call once at boot: loads the current language's site catalogue now and
 * the new one whenever the user switches language. */
export function initTranslations() {
  void loadSiteTranslations()
  window.addEventListener("kamra:lang", () => void loadSiteTranslations())
}

export type Vars = Record<string, string | number>

/** Replace `{name}` placeholders in a template. Arabic (and others) can
 * reorder words by placing the same placeholders differently. */
function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, k: string) =>
    vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : `{${k}}`,
  )
}

/** Translate an English string for the current language (falls back to it). */
export function t(s: string, vars?: Vars): string {
  return interpolate(lookup(getLang(), s), vars)
}

/** Subscribe a component to the language: re-renders on change, returns a
 * bound translator. */
export function useT() {
  const [lang, setL] = useState<Lang>(getLang())
  // Bumped when a site catalogue lands. The language is unchanged then, so
  // setting `lang` alone would be a no-op and the screen would stay English.
  const [rev, setRev] = useState(0)
  useEffect(() => {
    const on = () => setL(getLang())
    const loaded = () => setRev((n) => n + 1)
    window.addEventListener("kamra:lang", on)
    window.addEventListener(LOADED, loaded)
    return () => {
      window.removeEventListener("kamra:lang", on)
      window.removeEventListener(LOADED, loaded)
    }
  }, [])
  const t = useCallback(
    (s: string, vars?: Vars) => interpolate(lookup(lang, s), vars),
    // rev is not read inside, but it is the signal that SITE changed: a new
    // function identity re-runs any effect that depends on `t`.
    [lang, rev],
  )
  return { lang, t }
}
