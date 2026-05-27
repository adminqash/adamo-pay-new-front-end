# Custom date filter pattern (tabs + chip)

Patrón de filtro de fechas que combina tabs predefinidos con opción de rango personalizado, mostrando un chip cuando hay un rango custom activo.

## 🎯 Casos de uso

- Filtros de fecha en páginas de métricas, reportes o dashboards
- Necesidad de opciones rápidas (hoy, esta semana, este mes) + flexibilidad de rango custom
- UX donde el rango seleccionado debe ser visible y fácil de limpiar

## 🏗️ Arquitectura

### Estados necesarios

```typescript
const [filterTab, setFilterTab] = useState("today");
const [customDateRange, setCustomDateRange] = useState<DateRange>({
  from: undefined,
  to: undefined,
});
const [tempDateRange, setTempDateRange] = useState<DateRange>({
  from: undefined,
  to: undefined,
});
const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
const filterTabsRef = useRef<HTMLDivElement>(null);
```

**Propósito de cada estado:**

- `filterTab`: controla cuál tab está activo ("today" | "this_week" | "this_month" | "")
- `customDateRange`: el rango personalizado aplicado actualmente
- `tempDateRange`: buffer temporal mientras el usuario selecciona en el calendario
- `isDatePickerOpen`: controla visibilidad del popover con el calendario
- `filterTabsRef`: referencia para anclar el popover al contenedor de los tabs

### Imports necesarios

```typescript
import { Button } from "@adamosuiteservices/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Calendar } from "@adamosuiteservices/ui/calendar";
import { Icon } from "@adamosuiteservices/ui/icon";
import { useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";
```

## 🎨 UI structure

### Renderizado condicional

```tsx
<div className="flex flex-wrap items-center gap-4" ref={filterTabsRef}>
  <div className="flex flex-wrap items-center gap-2">
    <Tabs value={filterTab} onValueChange={handleFilterTabChange}>
      <TabsList>
        <TabsTrigger value="today">
          {t("metrics.filters.today")}
        </TabsTrigger>
        <TabsTrigger value="this_week">
          {t("metrics.filters.this_week")}
        </TabsTrigger>
        <TabsTrigger value="this_month">
          {t("metrics.filters.this_month")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    
    {/* Renderizado condicional: chip o botón */}
    {customDateRange.from && customDateRange.to ? (
      <div className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border bg-background px-3 text-sm font-medium text-foreground">
        {formatCustomDateRange()}
        <Icon 
          symbol="cancel" 
          fill={1}
          className="cursor-pointer text-destructive hover:text-destructive/80"
          onClick={handleClearCustomDate}
        />
      </div>
    ) : (
      <Button variant="link" onClick={handleOpenCustomDatePicker}>
        <Icon symbol="tune" />
        {t("metrics.filters.custom_range_button")}
      </Button>
    )}
  </div>
</div>
```

### Popover con calendario

```tsx
<Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen} modal={true}>
  <PopoverAnchor virtualRef={filterTabsRef as React.RefObject<Element>} />
  <PopoverContent align="start">
    <Calendar
      mode="range"
      selected={tempDateRange}
      onSelect={(range) => setTempDateRange(range || { from: undefined, to: undefined })}
      locale={i18n.language === "es" ? es : undefined}
      captionLayout="dropdown"
      classNames={{ root: "adm:p-0!" }}
      formatters={{
        formatMonthDropdown: (date) => {
          const monthName = date.toLocaleString(i18n.language === "es" ? "es-ES" : "en-US", { month: "long" });
          return monthName.charAt(0).toUpperCase() + monthName.slice(1);
        },
      }}
    />
    <div className="adm:mt-2 adm:flex adm:justify-end adm:gap-2">
      <Button variant="link" onClick={handleCancelDateRange}>
        {t("metrics.date_picker.cancel")}
      </Button>
      <Button variant="link" onClick={handleApplyDateRange} disabled={!tempDateRange.from || !tempDateRange.to}>
        {t("metrics.date_picker.apply")}
      </Button>
    </div>
  </PopoverContent>
</Popover>
```

## 🔧 Handlers

### 1. Handle filter tab change

```typescript
const handleFilterTabChange = (value: string) => {
  setFilterTab(value);
  setIsDatePickerOpen(false);
  // Reset custom date range when selecting a predefined tab
  if (value !== "custom") {
    setCustomDateRange({ from: undefined, to: undefined });
    setTempDateRange({ from: undefined, to: undefined });
  }
};
```

### 2. Handle open custom date picker

```typescript
const handleOpenCustomDatePicker = () => {
  setTempDateRange(customDateRange);
  setIsDatePickerOpen(true);
};
```

### 3. Handle date range apply

```typescript
const handleApplyDateRange = () => {
  setCustomDateRange(tempDateRange);
  setIsDatePickerOpen(false);
  setFilterTab(""); // Deselect tabs when custom is applied
};
```

### 4. Handle date range cancel

```typescript
const handleCancelDateRange = () => {
  setTempDateRange(customDateRange);
  setIsDatePickerOpen(false);
  // Reset to previous tab if no custom range is set
  if (!customDateRange.from || !customDateRange.to) {
    setFilterTab("today");
  }
};
```

### 5. Format custom date range for display

```typescript
const formatCustomDateRange = () => {
  if (customDateRange.from && customDateRange.to) {
    const formatter = new Intl.DateTimeFormat(i18n.language === "es" ? "es-ES" : "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${formatter.format(customDateRange.from)} - ${formatter.format(customDateRange.to)}`;
  }
  return "";
};
```

### 6. Handle clear custom date filter

```typescript
const handleClearCustomDate = () => {
  setCustomDateRange({ from: undefined, to: undefined });
  setTempDateRange({ from: undefined, to: undefined });
  setFilterTab("today");
  setIsDatePickerOpen(false);
};
```

## 💎 Chip specifications

### Estructura HTML

```tsx
<div className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border bg-background px-3 text-sm font-medium text-foreground">
  {formatCustomDateRange()}
  <Icon 
    symbol="cancel" 
    fill={1}
    className="cursor-pointer text-destructive hover:text-destructive/80"
    onClick={handleClearCustomDate}
  />
</div>
```

### Design tokens

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `height` | `h-10` | 40px de altura (consistente con inputs y botones) |
| `display` | `inline-flex` | Permite que el chip fluya en línea con otros elementos |
| `align-items` | `items-center` | Centra verticalmente el contenido |
| `justify-content` | `justify-center` | Centra horizontalmente el contenido |
| `gap` | `gap-2` | 8px de espacio entre texto e ícono |
| `white-space` | `whitespace-nowrap` | Previene saltos de línea en el texto |
| `border-radius` | `rounded-xl` | 12px de border radius |
| `border` | `border` | Border default del design system |
| `background` | `bg-background` | Color de fondo del sistema |
| `padding-x` | `px-3` | 12px de padding horizontal |
| `font-size` | `text-sm` | 14px |
| `font-weight` | `font-medium` | 500 |
| `color` | `text-foreground` | Color de texto del sistema |

### Icon specifications

| Propiedad | Valor | Descripción |
|-----------|-------|-------------|
| `symbol` | `"cancel"` | Material Symbol de Google |
| `fill` | `1` | Versión filled del ícono |
| `className` | `cursor-pointer text-destructive hover:text-destructive/80` | Cursor pointer + color destructive con hover |
| `onClick` | `handleClearCustomDate` | Handler para limpiar el filtro |

### Estados visuales

**Default:**
- Border default
- Background default
- Text foreground

**Hover (solo en el ícono):**
- Icon cambia a `text-destructive/80` (80% opacity)

## 🔄 Flujo de interacción

### Escenario 1: usuario selecciona tab predefinido

1. Usuario hace clic en "Hoy" / "Esta semana" / "Este mes"
2. `handleFilterTabChange` se ejecuta
3. Se limpia `customDateRange` y `tempDateRange`
4. El chip desaparece, se muestra el botón "Rango personalizado"

### Escenario 2: usuario abre rango personalizado

1. Usuario hace clic en botón "Rango personalizado"
2. `handleOpenCustomDatePicker` se ejecuta
3. Se copia `customDateRange` a `tempDateRange`
4. Se abre el popover con el calendario
5. Calendario se ancla al `filterTabsRef`

### Escenario 3: usuario selecciona y aplica rango

1. Usuario selecciona fechas en el calendario
2. `tempDateRange` se actualiza en cada selección
3. Usuario hace clic en "Aplicar"
4. `handleApplyDateRange` se ejecuta
5. `customDateRange` se actualiza con `tempDateRange`
6. Se deseleccionan los tabs (`setFilterTab("")`)
7. El botón desaparece, se muestra el chip con las fechas

### Escenario 4: usuario cancela selección

1. Usuario hace clic en "Cancelar"
2. `handleCancelDateRange` se ejecuta
3. `tempDateRange` se resetea a `customDateRange`
4. Si no hay rango custom, vuelve a "today"

### Escenario 5: usuario limpia rango custom

1. Usuario hace clic en el ícono X del chip
2. `handleClearCustomDate` se ejecuta
3. Se limpian ambos rangos
4. Se vuelve a "today"
5. El chip desaparece, aparece el botón

## 📦 Ejemplo de implementación completa

```typescript
import { Button } from "@adamosuiteservices/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Calendar } from "@adamosuiteservices/ui/calendar";
import { Icon } from "@adamosuiteservices/ui/icon";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";
import { es } from "date-fns/locale";

export function MyPageWithFilter() {
  const { t, i18n } = useTranslation();
  const [filterTab, setFilterTab] = useState("today");
  const [customDateRange, setCustomDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const filterTabsRef = useRef<HTMLDivElement>(null);

  const handleFilterTabChange = (value: string) => {
    setFilterTab(value);
    setIsDatePickerOpen(false);
    if (value !== "custom") {
      setCustomDateRange({ from: undefined, to: undefined });
      setTempDateRange({ from: undefined, to: undefined });
    }
  };

  const handleOpenCustomDatePicker = () => {
    setTempDateRange(customDateRange);
    setIsDatePickerOpen(true);
  };

  const handleApplyDateRange = () => {
    setCustomDateRange(tempDateRange);
    setIsDatePickerOpen(false);
    setFilterTab("");
  };

  const handleCancelDateRange = () => {
    setTempDateRange(customDateRange);
    setIsDatePickerOpen(false);
    if (!customDateRange.from || !customDateRange.to) {
      setFilterTab("today");
    }
  };

  const formatCustomDateRange = () => {
    if (customDateRange.from && customDateRange.to) {
      const formatter = new Intl.DateTimeFormat(i18n.language === "es" ? "es-ES" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${formatter.format(customDateRange.from)} - ${formatter.format(customDateRange.to)}`;
    }
    return "";
  };

  const handleClearCustomDate = () => {
    setCustomDateRange({ from: undefined, to: undefined });
    setTempDateRange({ from: undefined, to: undefined });
    setFilterTab("today");
    setIsDatePickerOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-4" ref={filterTabsRef}>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={filterTab} onValueChange={handleFilterTabChange}>
            <TabsList>
              <TabsTrigger value="today">
                {t("filters.today")}
              </TabsTrigger>
              <TabsTrigger value="this_week">
                {t("filters.this_week")}
              </TabsTrigger>
              <TabsTrigger value="this_month">
                {t("filters.this_month")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {customDateRange.from && customDateRange.to ? (
            <div className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border bg-background px-3 text-sm font-medium text-foreground">
              {formatCustomDateRange()}
              <Icon 
                symbol="cancel" 
                fill={1}
                className="cursor-pointer text-destructive hover:text-destructive/80"
                onClick={handleClearCustomDate}
              />
            </div>
          ) : (
            <Button variant="link" onClick={handleOpenCustomDatePicker}>
              <Icon symbol="tune" />
              {t("filters.custom_range_button")}
            </Button>
          )}
        </div>
      </div>

      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen} modal={true}>
        <PopoverAnchor virtualRef={filterTabsRef as React.RefObject<Element>} />
        <PopoverContent align="start">
          <Calendar
            mode="range"
            selected={tempDateRange}
            onSelect={(range) => setTempDateRange(range || { from: undefined, to: undefined })}
            locale={i18n.language === "es" ? es : undefined}
            captionLayout="dropdown"
            classNames={{ root: "adm:p-0!" }}
            formatters={{
              formatMonthDropdown: (date) => {
                const monthName = date.toLocaleString(i18n.language === "es" ? "es-ES" : "en-US", { month: "long" });
                return monthName.charAt(0).toUpperCase() + monthName.slice(1);
              },
            }}
          />
          <div className="adm:mt-2 adm:flex adm:justify-end adm:gap-2">
            <Button variant="link" onClick={handleCancelDateRange}>
              {t("date_picker.cancel")}
            </Button>
            <Button variant="link" onClick={handleApplyDateRange} disabled={!tempDateRange.from || !tempDateRange.to}>
              {t("date_picker.apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
```

## 🌍 i18n keys necesarias

```json
{
  "filters": {
    "today": "Hoy",
    "this_week": "Esta semana",
    "this_month": "Este mes",
    "custom_range_button": "Rango personalizado"
  },
  "date_picker": {
    "cancel": "Cancelar",
    "apply": "Aplicar"
  }
}
```

## ✅ Ventajas de este patrón

1. **UX clara**: opciones rápidas + flexibilidad de custom
2. **Visual feedback**: el chip muestra claramente qué rango está activo
3. **Fácil de limpiar**: ícono X intuitivo
4. **Consistente**: altura y estilos alineados con el design system
5. **Responsive**: se adapta bien a diferentes tamaños de pantalla
6. **Accesible**: usa componentes de Adamo UI con accesibilidad built-in

## 🎯 Cuándo usar este patrón

- Cuando necesitas **opciones rápidas + flexibilidad**
- Cuando el espacio horizontal lo permite (tabs + botón/chip)
- Cuando quieres que el rango custom sea **visualmente prominente**
- En páginas de métricas, reportes, dashboards, listados con filtros

## 🚫 Cuándo NO usar este patrón

- En formularios o diálogos (usa `DateRangePicker` con Combobox)
- En espacios reducidos (usa solo Combobox)
- Cuando solo necesitas rango custom sin opciones predefinidas
