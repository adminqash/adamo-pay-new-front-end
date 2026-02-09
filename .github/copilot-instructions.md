# GitHub Copilot instructions

You are an expert developer working on a project that strictly follows Domain-Driven Design (DDD) and specific architectural patterns.

## 🚨 CRITICAL: Source of truth

**You must strictly follow the patterns defined in the `documentation/` directory.**
Do not rely on general knowledge if it conflicts with the project's documentation.

## 📚 Documentation references

For specific implementation details, refer to the following files:

- **Project Structure**: [documentation/project-structure.md](../documentation/project-structure.md)
  - _Consult for_: Feature-based folder layout, `api` vs `application` separation, file naming conventions, component segmentation (create/edit/settings).

- **Service Architecture & Data Fetching**: [documentation/service-architecture.md](../documentation/service-architecture.md)
  - _Consult for_: "Black Box" Service pattern, Hook implementation, DTO -> Entity mapping, Command pattern usage, Global Error Handling.

- **Component Library (Adamo UI)**: [documentation/component-library.md](../documentation/component-library.md)
  - _Consult for_: Component usage patterns, import conventions, `adm:` prefix rules, `asChild` prop, variant system, compound components, styling best practices.
  - _External docs_: `node_modules/@adamosuiteservices/ui/docs/ai-guide.md` (comprehensive AI guide), `node_modules/@adamosuiteservices/ui/docs/components/` (individual component docs).

- **Internationalization (i18n)**: [documentation/internationalization.md](../documentation/internationalization.md)
  - _Consult for_: Translation file structure, `useTranslation` hook usage, interpolation, plurals.

- **Lazy Loading**: [documentation/lazy-loading.md](../documentation/lazy-loading.md)
  - _Consult for_: Named export patterns for pages, lazy loading syntax with named imports, `PageLoader` usage.

## 🛠️ Workflows

1. **Before writing code**: Analyze the request and identify which documentation files are relevant.
2. **Check llm.txt FIRST**: Before creating ANY component, consult `node_modules/@adamosuiteservices/ui/llm.txt` to verify it doesn't already exist.
3. **Check component docs**: If the component exists, read its specific documentation in `docs/components/[component-name].md`.
4. **Read the patterns**: If you are unsure about a pattern, check the linked markdown file.
5. **Keep synchronous**: If the code implementation evolves, you must suggest updates to the relevant documentation files to keep them in sync.

## 🎨 Adamo UI component library

**CRITICAL**: This project uses `@adamosuiteservices/ui` component library with 45+ components.

### 🚨 MUST READ FIRST

**ALWAYS check `node_modules/@adamosuiteservices/ui/llm.txt` BEFORE creating ANY component.**

This is the **source of truth** containing:

- Complete list of all available components
- Critical rules (NEVER create components that exist!)
- Direct links to detailed documentation
- Common mistakes to avoid

### Documentation hierarchy (consult in this order)

1. **llm.txt** - `node_modules/@adamosuiteservices/ui/llm.txt` (⭐ START HERE)
2. **Component library guide** - [documentation/component-library.md](../documentation/component-library.md)
3. **AI guide** - `node_modules/@adamosuiteservices/ui/docs/ai-guide.md`
4. **Specific component docs** - `node_modules/@adamosuiteservices/ui/docs/components/[component-name].md`

## ✍️ Text and casing conventions

**CRITICAL**: Follow these text formatting rules across all code, documentation, comments, and user-facing text:

### General rule

- **Use lowercase** for all titles, headings, labels, messages, and documentation unless absolutely necessary
- **Avoid Camel Case or Title Case** in user-facing text, comments, documentation, and translations
- **Only capitalize** when:
  - Starting a sentence
  - Proper nouns (e.g., React, TypeScript, GitHub)
  - Acronyms (e.g., API, DTO, UI, CSS)
  - Technical terms that require it (e.g., JavaScript, PostgreSQL)

### Examples

```markdown
<!-- ✅ Correct -->

## Project structure

## Quick rules

## Error handling best practices

<!-- ❌ Wrong -->

## Project Structure

## Quick Rules

## Error Handling Best Practices
```

```typescript
// ✅ Correct - Comments and messages
// Fetch user data from the API
const successMessage = "Document created successfully";
const errorMessage = "Failed to create document";

// ❌ Wrong - Unnecessary capitalization
// Fetch User Data From The API
const successMessage = "Document Created Successfully";
const errorMessage = "Failed To Create Document";
```

```json
// ✅ Correct - Translation keys and values
{
  "page_title": "My documents",
  "create_button": "Create document",
  "messages": {
    "success": "Document created successfully"
  }
}

// ❌ Wrong - Title Case
{
  "page_title": "My Documents",
  "create_button": "Create Document",
  "messages": {
    "success": "Document Created Successfully"
  }
}
```

### Where this applies

- 📝 **Documentation**: All markdown files (README, guides, architecture docs)
- 💬 **Comments**: JSDoc, inline comments, code explanations
- 🌎 **Translations**: All i18n JSON files (English and Spanish)
- 💁 **User-facing text**: Labels, buttons, messages, notifications
- 🏷️ **Component props**: String literals for text content

### Exceptions

- **Code identifiers**: Class names, function names, variables follow standard conventions (camelCase, PascalCase)
- **File names**: Follow project conventions (kebab-case with suffixes)
- **Technical terms**: Preserve official casing (e.g., "React Query", "TypeScript", "GitHub Copilot")
