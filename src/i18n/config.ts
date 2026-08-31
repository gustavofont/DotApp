import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import pt from "./locales/pt.json";
import en from "./locales/en.json";

export const LANGUAGE_STORAGE_KEY = "dotcard-lang";

function storedLanguage(): "pt" | "en" {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === "en" ? "en" : "pt";
  } catch {
    return "pt";
  }
}

// No navigator-based auto-detection on purpose — language is chosen through
// the interface (LanguageSwitcher), never guessed, and pt stays the
// deterministic default so jsdom (which reports en-US) can't quietly change
// what the existing test suite renders.
void i18next.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  lng: storedLanguage(),
  fallbackLng: "pt",
  interpolation: { escapeValue: false },
});

export default i18next;
