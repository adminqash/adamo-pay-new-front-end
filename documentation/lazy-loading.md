# Lazy loading and code splitting

To ensure high performance and fast initial load times, this project uses **Code Splitting** via React's `lazy` and `Suspense`.

## Why lazy load?

Single Page Applications (SPAs) often bundle all JavaScript into a single file. As the app grows, this bundle becomes huge, causing slow load times.
Lazy loading splits the code into smaller "chunks". A chunk is only loaded when the user navigates to the route or uses the component that requires it.

## Route-based splitting

The primary strategy is to lazy load top-level **Page** components.

### 1. Named exports

Pages are exported as **named exports** to enforce consistent naming.

```typescript
// features/documents/application/pages/DocumentsPage.tsx
export function DocumentsPage() {
  return <div>...</div>;
}
```

### 2. Import with `lazy`

Since `React.lazy` expects a default export, we must adapt the import promise when using named exports.

```typescript
import { lazy } from "react";

// Lazy import for Named Exports
const DocumentsPage = lazy(() =>
  import("@/features/documents/application/pages/DocumentsPage").then(
    (module) => ({
      default: module.DocumentsPage,
    }),
  ),
);

const SettingsPage = lazy(() =>
  import("@/features/settings/application/pages/SettingsPage").then(
    (module) => ({
      default: module.SettingsPage,
    }),
  ),
);
```

### 3. Wrap in suspense

Ensure the router or the route definition wraps these components in `Suspense` with a fallback loader.

```tsx
// router.tsx
import { PageLoader } from "@/features/common/components/layout/page-loader";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "documents",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DocumentsPage />
          </Suspense>
        ),
      },
    ],
  },
]);
```

## Component-based splitting

You can also lazy load heavy components that are not pages, such as complex modals, charts, or editors.

```tsx
const RichTextEditor = lazy(() => import("./RichTextEditor"));

function PostEditor() {
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div>
      <button onClick={() => setShowEditor(true)}>Edit</button>

      {showEditor && (
        <Suspense fallback={<div>Loading Editor...</div>}>
          <RichTextEditor />
        </Suspense>
      )}
    </div>
  );
}
```

## Best practices

1. **Named chunks**: Browsers generate chunk names automatically (e.g., `chunk-1.js`). You can sometimes prompt bundlers to use readable names (like `documents-page.js`) using magic comments if needed (Vite/Rollup usually handles this well automatically).
2. **Shared layouts**: Do not lazy load critical layout components (Header, Sidebar) unless necessary, as this can cause layout shift or "flicker" on initial load.
3. **Loading states**: Always provide a good `fallback` UI in `<Suspense>` so the user knows something is happening.
