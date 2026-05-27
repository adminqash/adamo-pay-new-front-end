# date range filter implementation

Esta guía explica cómo implementar un filtro de rango de fechas personalizado usando los componentes de Adamo UI.

## Componentes utilizados

- **Combobox**: Para mostrar opciones preestablecidas (últimos 7/30/90 días) y opción personalizada
- **Calendar**: Para seleccionar un rango de fechas personalizado
- **Popover**: Para mostrar el calendario como un popup
- **Button**: Para botones de aplicar/cancelar en el calendario

## Características

- **Opciones preestablecidas**: Rangos rápidos (últimos 7, 30, 90 días)
- **Selección personalizada**: Calendario para elegir fechas específicas
- **Aplicar/Cancelar**: Confirmación antes de aplicar el rango personalizado
- **Formato localizado**: Soporte para múltiples idiomas (español/inglés)
- **Display inteligente**: Muestra el rango seleccionado en formato dd/MM/yyyy

## Implementación

### 1. Dependencias

```typescript
import { Combobox } from "@adamosuiteservices/ui/combobox";
import { Calendar } from "@adamosuiteservices/ui/calendar";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Button } from "@adamosuiteservices/ui/button";
import type { DateRange } from "react-day-picker";
import { format, subDays, startOfDay } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useRef, useState } from "react";
```

### 2. Componente DateRangePicker

```typescript
const DateRangePicker = ({
  dateRange,
  onDateRangeChange,
  labels,
  className,
  currentLanguage,
}: {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  labels: {
    last7Days: string;
    last30Days: string;
    last90Days: string;
    custom: string;
    placeholder: string;
    cancel: string;
    apply: string;
  };
  className?: string;
  currentLanguage: string;
}) => {
  const comboboxRef = useRef<HTMLElement | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>(() => {
    // Calcular opción inicial basada en dateRange
    if (!dateRange.from || !dateRange.to) return "";
    const today = startOfDay(new Date());
    if (dateRange.from.getTime() === subDays(today, 7).getTime() && 
        dateRange.to.getTime() === today.getTime()) {
      return "7_days";
    }
    if (dateRange.from.getTime() === subDays(today, 30).getTime() && 
        dateRange.to.getTime() === today.getTime()) {
      return "30_days";
    }
    if (dateRange.from.getTime() === subDays(today, 90).getTime() && 
        dateRange.to.getTime() === today.getTime()) {
      return "90_days";
    }
    return "custom";
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<DateRange>({ 
    from: undefined, 
    to: undefined 
  });

  // Obtener locale basado en idioma actual
  const locale = currentLanguage === "es" ? es : enUS;

  const handleComboboxChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (selectedValue === "custom") {
      // Abrir calendario con selección vacía
      setSelectedOption("custom");
      setTempDateRange({ from: undefined, to: undefined });
      setIsCalendarOpen(true);
      return;
    }

    // Manejar selección preestablecida
    setSelectedOption(selectedValue);
    const today = startOfDay(new Date());
    const daysMap = { "7_days": 7, "30_days": 30, "90_days": 90 };
    const days = daysMap[selectedValue as keyof typeof daysMap];
    if (days) {
      onDateRangeChange({ from: subDays(today, days), to: today });
    }
  };

  const handleApply = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onDateRangeChange(tempDateRange);
      setIsCalendarOpen(false);
    }
  };

  const handleCancel = () => {
    setIsCalendarOpen(false);
  };

  // Obtener texto de visualización para combobox
  const getDisplayText = () => {
    if (selectedOption === "custom" && dateRange.from && dateRange.to) {
      return format(dateRange.from, "dd/MM/yyyy") + " - " + 
             format(dateRange.to, "dd/MM/yyyy");
    }
    return "";
  };

  return (
    <>
      <Combobox
        ref={(node) => {
          comboboxRef.current = node;
        }}
        alwaysShowPlaceholder
        selectedFeedback="check"
        icon="calendar_today"
        options={[
          { label: labels.last7Days, value: "7_days" },
          { label: labels.last30Days, value: "30_days" },
          { label: labels.last90Days, value: "90_days" },
          { label: labels.custom, value: "custom" },
        ]}
        labels={{ placeholder: labels.placeholder }}
        value={selectedOption}
        onValueChange={handleComboboxChange}
        classNames={{ trigger: className }}
        renders={{
          displayValue: ({ text, value }) => {
            if (value === "custom" && dateRange.from && dateRange.to) {
              return getDisplayText();
            }
            return text;
          },
        }}
      />
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverAnchor virtualRef={comboboxRef as React.RefObject<HTMLElement>} />
        <PopoverContent align="start">
          <Calendar
            required
            mode="range"
            selected={tempDateRange}
            onSelect={setTempDateRange}
            captionLayout="dropdown"
            locale={locale}
            formatters={{
              formatMonthDropdown: (date) => {
                const monthName = date.toLocaleString(
                  currentLanguage === "es" ? "es-ES" : "en-US", 
                  { month: "long" }
                );
                return monthName.charAt(0).toUpperCase() + monthName.slice(1);
              },
            }}
            classNames={{ root: "adm:p-0!" }}
          />
          <div className="adm:mt-2 adm:flex adm:justify-end adm:gap-2">
            <Button variant="link" onClick={handleCancel}>
              {labels.cancel}
            </Button>
            <Button 
              variant="link" 
              onClick={handleApply} 
              disabled={!tempDateRange.from || !tempDateRange.to}
            >
              {labels.apply}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
```

### 3. Uso en el componente padre

```typescript
const [dateRange, setDateRange] = useState<DateRange>(() => {
  const today = startOfDay(new Date());
  return {
    from: subDays(today, 7),
    to: today,
  };
});

// En el JSX
<DateRangePicker
  dateRange={dateRange}
  onDateRangeChange={setDateRange}
  labels={{
    last7Days: t("filters.last_7_days"),
    last30Days: t("filters.last_30_days"),
    last90Days: t("filters.last_90_days"),
    custom: t("filters.custom"),
    placeholder: t("filters.date"),
    cancel: t("filters.cancel"),
    apply: t("filters.apply"),
  }}
  className="h-10 w-full"
  currentLanguage={i18n.language}
/>
```

## Conceptos clave

### 1. Separación de estados

- **selectedOption**: Opción actualmente seleccionada en el Combobox ("7_days", "30_days", etc.)
- **dateRange**: Rango de fechas efectivo (controlado por el padre)
- **tempDateRange**: Rango temporal mientras se selecciona en el calendario (antes de aplicar)
- **isCalendarOpen**: Controla la visibilidad del popover del calendario

### 2. Flujo de trabajo

1. Usuario selecciona opción preestablecida → Se actualiza inmediatamente `dateRange`
2. Usuario selecciona "custom" → Se abre el calendario con `tempDateRange` vacío
3. Usuario selecciona fechas en el calendario → Se actualiza `tempDateRange`
4. Usuario hace clic en "Aplicar" → Se copia `tempDateRange` a `dateRange` y se cierra el popover
5. Usuario hace clic en "Cancelar" → Se cierra el popover sin aplicar cambios

### 3. PopoverAnchor con virtualRef

```typescript
const comboboxRef = useRef<HTMLElement | null>(null);

<Combobox
  ref={(node) => {
    comboboxRef.current = node;
  }}
  // ...
/>

<PopoverAnchor virtualRef={comboboxRef as React.RefObject<HTMLElement>} />
```

**¿Por qué?** Permite que el Popover se posicione relativo al Combobox, incluso cuando el Combobox no es el elemento que controla el estado del Popover. Esto crea la ilusión de que el calendario "sale" del Combobox.

### 4. Display personalizado del Combobox

```typescript
renders={{
  displayValue: ({ text, value }) => {
    if (value === "custom" && dateRange.from && dateRange.to) {
      return getDisplayText(); // Muestra "01/01/2024 - 31/01/2024"
    }
    return text; // Muestra el label de la opción ("Últimos 7 días")
  },
}}
```

Esto permite mostrar el rango de fechas formateado cuando se selecciona una opción personalizada, en lugar de solo mostrar "Personalizado".

### 5. Localización del Calendar

```typescript
const locale = currentLanguage === "es" ? es : enUS;

<Calendar
  locale={locale}
  formatters={{
    formatMonthDropdown: (date) => {
      const monthName = date.toLocaleString(
        currentLanguage === "es" ? "es-ES" : "en-US", 
        { month: "long" }
      );
      return monthName.charAt(0).toUpperCase() + monthName.slice(1);
    },
  }}
/>
```

Esto asegura que los nombres de meses y días se muestren en el idioma correcto.

## Traduciones necesarias

```json
{
  "filters": {
    "last_7_days": "Últimos 7 días",
    "last_30_days": "Últimos 30 días",
    "last_90_days": "Últimos 90 días",
    "custom": "Personalizado",
    "date": "Fecha",
    "cancel": "Cancelar",
    "apply": "Aplicar"
  }
}
```

## Detección de filtros activos

Para saber si el usuario ha aplicado un filtro de fecha personalizado:

```typescript
const isDateRangeCustom = () => {
  if (!dateRange.from || !dateRange.to) return false;
  const today = startOfDay(new Date());
  const defaultFrom = subDays(today, 7);
  return dateRange.from.getTime() !== defaultFrom.getTime() || 
         dateRange.to.getTime() !== today.getTime();
};
```

## Restablecer filtros

```typescript
const handleResetFilters = () => {
  const today = startOfDay(new Date());
  setDateRange({
    from: subDays(today, 7),
    to: today,
  });
};
```

## Notas importantes

1. **startOfDay()**: Siempre usar para evitar problemas con horas/minutos/segundos en comparaciones
2. **Refs**: El `comboboxRef` es crucial para posicionar correctamente el popover
3. **Estado temporal**: Mantener `tempDateRange` separado permite cancelar la selección sin afectar el filtro actual
4. **Validación**: El botón "Aplicar" solo se habilita cuando ambas fechas están seleccionadas
5. **Inicialización**: El `useState` con función calculadora determina automáticamente qué opción corresponde al `dateRange` inicial
