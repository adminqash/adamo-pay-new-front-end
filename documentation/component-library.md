# Component library - Adamo UI

This project uses **Adamo UI** (`@adamosuiteservices/ui`), a comprehensive React component library with 45+ production-ready components.

## Quick reference

- **Package**: `@adamosuiteservices/ui`
- **Components**: 45+ UI and layout components
- **Built with**: React, TypeScript, Tailwind CSS, Radix UI
- **Features**: Accessibility, dark mode, full TypeScript support

## 🚨 CRITICAL: Source of truth

**ALWAYS check `node_modules/@adamosuiteservices/ui/llm.txt` FIRST** before creating any component.

This file is the **definitive reference** containing:

- Complete list of all 45+ available components
- Critical rules and common mistakes to avoid
- Direct links to detailed component documentation
- Quick decision flow for component usage

## Documentation hierarchy

Consult documentation in this order:

### 1. Primary reference (START HERE)

- **llm.txt**: `node_modules/@adamosuiteservices/ui/llm.txt` ⭐
  - **Master index** of all components
  - Critical usage rules
  - Links to specific component docs
  - Common mistakes to avoid

### 2. Detailed implementation guides

- **AI guide**: `node_modules/@adamosuiteservices/ui/docs/ai-guide.md`
  - Complete development patterns
  - Component architecture and conventions
  - Critical conventions (`adm:` prefix, `asChild` prop)
  - Styling system and best practices

### 3. Component-specific documentation

- **Component docs**: `node_modules/@adamosuiteservices/ui/docs/components/`
  - Individual component API reference
  - Props, variants, and usage examples
  - Accessibility guidelines
  - Code examples

### 4. Design system

- **Color system**: `node_modules/@adamosuiteservices/ui/docs/colors-and-tokens.md`
  - OKLCH color system
  - Semantic tokens
  - Theming

### 5. Interactive playground

- **Storybook**: [Interactive examples](https://marvelous-panda-f6ab35.netlify.app)
  - Live component playground
  - Visual testing

## Setup

### Installation

```bash
npm install @adamosuiteservices/ui react-day-picker@^9.11.1 cmdk@^1.1.1 date-fns@^4.1.0
```

### Configuration

Import global styles once in your app entry point (`src/main.tsx`):

```typescript
import "@adamosuiteservices/ui/styles.css";
```

### Usage

Always use individual imports (not barrel imports):

```typescript
// ✅ Correct
import { Button } from "@adamosuiteservices/ui/button";
import { Input } from "@adamosuiteservices/ui/input";

// ❌ Wrong
import { Button, Input } from "@adamosuiteservices/ui";
```

## Important rules

1. **ALWAYS check llm.txt first** - `node_modules/@adamosuiteservices/ui/llm.txt`
2. **Never create components that already exist** - Check component list in llm.txt
3. **Never use `adm:` prefix** - It's internal to the library
4. **Use individual imports** - `import { Button } from "@adamosuiteservices/ui/button"`
5. **Follow compound patterns** - (e.g., Dialog, DialogContent, DialogHeader)

## Common mistakes to avoid

❌ Creating components that already exist (e.g., custom file upload instead of `<FileUpload>`)
❌ Using barrel imports: `import { X } from "@adamosuiteservices/ui"`
❌ Using `adm:` prefix in user code
❌ Not consulting llm.txt before implementation

## Getting help (in order)

1. **Check component index**: `node_modules/@adamosuiteservices/ui/llm.txt` (START HERE)
2. **Check specific component docs**: `node_modules/@adamosuiteservices/ui/docs/components/[component-name].md`
3. **Check patterns guide**: `node_modules/@adamosuiteservices/ui/docs/ai-guide.md`
4. **Browse Storybook**: https://marvelous-panda-f6ab35.netlify.app
