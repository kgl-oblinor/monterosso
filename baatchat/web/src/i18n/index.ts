// Public i18n surface. Import from "@/i18n".
export { LOCALES, DEFAULT_LOCALE, dictionary } from "./dictionary";
export type { Locale, TranslationKey } from "./dictionary";
export { useLocale, localeForRole } from "./locale";
export { useT, translate } from "./useT";
export type { TFunction, TVars } from "./useT";
export { formatDate, formatTime, formatRelative } from "./format";
