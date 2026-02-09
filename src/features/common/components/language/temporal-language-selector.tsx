import { useTranslation } from "react-i18next";
import type { ChangeEvent } from "react";
import { AVAILABLE_LANGUAGES } from "@/lib/i18n/i18n.config";

export function TemporalLanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (event: ChangeEvent<HTMLSelectElement>): void => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
  };

  return (
    <select
      id="language-select"
      value={i18n.language}
      onChange={changeLanguage}
    >
      {AVAILABLE_LANGUAGES.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
