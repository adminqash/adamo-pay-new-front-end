# sticky filter header component

## overview

The `StickyFilterHeader` component provides a consistent way to implement sticky headers in list/table pages across the application. It handles all the complexity of positioning, spacing, and visual consistency automatically.

## when to use

Use this component when you have:

- Filter sections that should remain visible while scrolling
- Header controls (refresh, action buttons, search) that need to stay accessible
- Table or list views with multiple filter options

## basic usage

```tsx
import { StickyFilterHeader } from "@/features/common/components/layout/sticky-filter-header";
import { Card } from "@adamosuiteservices/ui/card";

export const YourPage = () => {
  return (
    <PageContainer>
      <Card className="p-6 border overflow-visible">
        <StickyFilterHeader className="flex flex-col gap-0">
          {/* Your header content */}
          <div className="flex flex-wrap items-center gap-6">
            {/* Refresh button, action buttons, search bar */}
          </div>

          {/* Your filters */}
          <div className="flex flex-wrap items-center gap-6 mt-6">
            {/* Date filter, status filter, etc. */}
          </div>
        </StickyFilterHeader>

        {/* Your scrollable content (table, list, etc.) */}
        <Table>{/* ... */}</Table>
      </Card>
    </PageContainer>
  );
};
```

## important requirements

### 1. card must have specific classes

```tsx
<Card className="p-6 border overflow-visible">
  {/* ⬆️ overflow-visible is critical for sticky behavior */}
```

### 2. structure your content correctly

```tsx
<StickyFilterHeader className="flex flex-col gap-0">
  {/* First section: header controls */}
  <div className="flex flex-wrap items-center gap-6">{/* ... */}</div>

  {/* Second section: filters with mt-6 for spacing */}
  <div className="flex flex-wrap items-center gap-6 mt-6">{/* ... */}</div>
</StickyFilterHeader>;

{
  /* Content comes AFTER closing tag, NOT inside */
}
<Table>{/* ... */}</Table>;
```

### 3. no gap between sticky header and scrollable content

The component handles spacing internally. Do not add margins or gaps between the `StickyFilterHeader` and your scrollable content.

## props

| prop         | type        | default     | description                                   |
| ------------ | ----------- | ----------- | --------------------------------------------- |
| `children`   | `ReactNode` | required    | content to display in the sticky header       |
| `className`  | `string`    | `undefined` | additional CSS classes for the container      |
| `topSpacing` | `number`    | `24`        | spacing offset from the page header in pixels |

## examples

### example 1: simple header with filters

```tsx
<StickyFilterHeader className="flex flex-col gap-0">
  <div className="flex items-center gap-4">
    <Button variant="secondary">
      <Icon symbol="refresh" />
    </Button>
    <p>Total: {count}</p>
  </div>

  <div className="flex items-center gap-4 mt-6">
    <Combobox {...filterProps} />
    <DateRangePicker {...dateProps} />
  </div>
</StickyFilterHeader>
```

### example 2: complex header with multiple sections

```tsx
<StickyFilterHeader className="flex flex-col gap-0">
  {/* row 1: title + actions */}
  <div className="flex flex-wrap items-center gap-6">
    <div className="flex-1">
      <Button variant="secondary">
        <Icon symbol="refresh" />
      </Button>
      <p className="text-sm">{t("header.count", { count })}</p>
    </div>

    <div className="flex gap-4">
      <Button variant="default" asChild>
        <Link to="/create">Create new</Link>
      </Button>
      <Button variant="secondary">Export</Button>
    </div>

    <div className="w-full md:flex-1">
      <Input placeholder="Search..." />
    </div>
  </div>

  {/* row 2: filters */}
  <div className="flex flex-wrap items-center gap-6 mt-6">
    <DateRangePicker {...dateRangeProps} />
    <Combobox {...statusProps} />
    <Button variant="link" onClick={resetFilters}>
      Reset filters
    </Button>
  </div>
</StickyFilterHeader>
```

## how it works

1. **sticky positioning**: The component calculates the correct `top` offset based on the page header height
2. **visual consistency**: Pseudo-elements (`::before` and `::after`) maintain visual consistency by:
   - Covering the card's top border and border-radius when scrolling
   - Creating proper spacing between the sticky header and scrollable content
3. **z-index management**: Ensures the sticky header stays above scrolling content

## troubleshooting

### sticky header not working

- ✅ Make sure the Card has `overflow-visible` class
- ✅ Verify content is placed AFTER the `</StickyFilterHeader>` closing tag
- ✅ Check that there's enough content to scroll

### white rectangles showing on sides

- ✅ This is expected in the initial state - it's the pseudo-elements that cover borders
- ✅ If they're too visible, check that the Card border-radius is correct (should be 1.5rem/24px)

### gap between header and content

- ✅ Remove any margin-top on the elements after `StickyFilterHeader`
- ✅ Use `gap-0` on the StickyFilterHeader className
- ✅ Add spacing between internal sections using `mt-6` on the second div

## migration guide

If you have an existing page with custom sticky implementation:

1. Remove all custom CSS for sticky behavior
2. Remove `useElementRect` and sticky offset calculations
3. Replace the header wrapper div with `<StickyFilterHeader>`
4. Add `overflow-visible` to your Card component
5. Ensure proper structure (see examples above)

## best practices

- ✅ Keep filter sections organized and visually grouped
- ✅ Use consistent spacing (gap-6 for horizontal, mt-6 between rows)
- ✅ Place the most important actions in the first row
- ✅ Keep search bars full-width on mobile with `w-full md:flex-1`
- ✅ Test with different amounts of content to ensure sticky behavior works
