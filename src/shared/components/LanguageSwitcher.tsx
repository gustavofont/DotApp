import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LANGUAGE_STORAGE_KEY } from "../../i18n/config";

const LANGUAGES = [
  { code: "pt", flag: "🇧🇷", labelKey: "languageSwitcher.portuguese" },
  { code: "en", flag: "🇺🇸", labelKey: "languageSwitcher.english" },
] as const;

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  function selectLanguage(code: (typeof LANGUAGES)[number]["code"]) {
    void i18n.changeLanguage(code);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch {
      // Private window or blocked storage — the choice just won't persist.
    }
  }

  return (
    <div className="flex shrink-0 gap-1 sm:w-full">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          onClick={() => selectLanguage(language.code)}
          aria-pressed={i18n.resolvedLanguage === language.code}
          className={cn(
            "flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold tracking-wide uppercase outline-none transition-colors focus-visible:ring-3 focus-visible:ring-legendary/50 sm:rounded-sm",
            i18n.resolvedLanguage === language.code
              ? "bg-legendary/10 text-legendary"
              : "text-ink-dim hover:text-ink",
          )}
        >
          <span aria-hidden="true">{language.flag}</span>
          {t(language.labelKey)}
        </button>
      ))}
    </div>
  );
}
