# Internationalization (i18n)

The project uses `i18next` and `react-i18next` for translations. This ensures the application can be easily localized into multiple languages.

## Configuration

The i18n configuration is located in `src/lib/i18n/index.ts`. It initializes `i18next` with the following features:

- **Backend**: Loads translations from `public/locales/{lng}/{ns}.json`.
- **Language Detector**: Detects user language from the browser or local storage.
- **Interpolation**: Escapes values to prevent XSS.

## Translation files

Translations are stored in JSON files within the `public/locales` directory. They are organized by language code (e.g., `en`, `es`) and namespace.

**Structure:**

```text
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── auth.json
    │   └── documents.json
    └── es/
        ├── common.json
        ├── auth.json
        └── documents.json
```

**Namespaces:**
Use namespaces to group translations by feature (e.g., `auth`, `documents`) or category (e.g., `common`, `errors`). This keeps files manageable and avoids loading unnecessary translations.

## Adding translations

When adding new text to the application, **always** add the corresponding key to the JSON files. Do not hardcode strings in components.

**Example (`public/locales/en/documents.json`):**

```json
{
  "page_title": "My Documents",
  "create_button": "Create Document",
  "messages": {
    "success": "Document created successfully"
  }
}
```

## Usage in components

Use the `useTranslation` hook to access translations.

```tsx
import { useTranslation } from "react-i18next";

export function DocumentsPage() {
  // Load the "documents" and "common" namespaces
  const { t } = useTranslation(["documents", "common"]);

  return (
    <div>
      <h1>{t("documents:page_title")}</h1>
      <button>{t("documents:create_button")}</button>

      {/* Fallback to common namespace if key not found in first ns (optional config) */}
      <footer>{t("common:copyright")}</footer>
    </div>
  );
}
```

### Interpolation

You can pass values to translations.

**JSON:**

```json
{
  "welcome_user": "Welcome, {{name}}!"
}
```

**Component:**

```tsx
<h1>{t("welcome_user", { name: "John" })}</h1>
```

### Plurals

i18next handles pluralization automatically.

**JSON:**

```json
{
  "item_one": "Item",
  "item_other": "Items",
  "item_with_count_one": "{{count}} item",
  "item_with_count_other": "{{count}} items"
}
```

**Component:**

```tsx
<p>{t('item', { count: 1 })}</p> <!-- "Item" -->
<p>{t('item', { count: 5 })}</p> <!-- "Items" -->
<p>{t('item_with_count', { count: 5 })}</p> <!-- "5 items" -->
```

## IDE support

For better developer experience, consider installing an i18n extension for your IDE (e.g., "i18n Ally") to see translations inline.
