import type { BatchTemplateDTO } from "@/features/batches/api/dtos/batch-template.dto";

function escapeCsvValue(value: string | number): string {
  const raw = String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, "\"\"")}"`;
  }
  return raw;
}

export function downloadBatchTemplateFile(template: BatchTemplateDTO): void {
  const delimiter = template.delimiter || ",";
  const headers = template.columns.map((column) => column.label);
  const rows = [headers.join(delimiter)];

  if (template.sampleRow) {
    const sampleValues = template.columns.map((column) => {
      const value = template.sampleRow?.[column.key];
      return escapeCsvValue(value ?? "");
    });
    rows.push(sampleValues.join(delimiter));
  }

  const content = `\uFEFF${rows.join("\n")}`;
  const blob = new Blob([content], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = template.fileName ?? "plantilla-lote-pagos.csv";
  link.click();
  URL.revokeObjectURL(url);
}
