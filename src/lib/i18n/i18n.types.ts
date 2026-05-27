import type { useTranslation } from "react-i18next";

export type TranslateFunction = ReturnType<typeof useTranslation>["t"];
