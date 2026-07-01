// The translator hook. `useT()` returns a `t(key, vars?)` bound to the active locale.
// Lookup order: active locale → English fallback → the key itself (so nothing ever renders blank).
// Interpolation is simple `{name}` substitution.
import { dictionary, DEFAULT_LOCALE, type Locale, type TranslationKey } from "./dictionary";
import { useLocale } from "./locale";

export type TVars = Record<string, string | number>;

function interpolate(s: string, vars?: TVars): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

/** Locale-explicit translate — the engine behind the hook (also usable outside React). */
export function translate(locale: Locale, key: TranslationKey, vars?: TVars): string {
  const entry = dictionary[key];
  if (!entry) return key;
  return interpolate(entry[locale] ?? entry[DEFAULT_LOCALE] ?? key, vars);
}

export type TFunction = (key: TranslationKey, vars?: TVars) => string;

/** Returns `t(key, vars?)` in the signed-in user's locale. */
export function useT(): TFunction {
  const locale = useLocale();
  return (key, vars) => translate(locale, key, vars);
}
