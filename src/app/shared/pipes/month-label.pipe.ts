import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "monthLabel",
  standalone: true,
})
export class MonthLabelPipe implements PipeTransform {
  transform(value: string | Date | null | undefined, locale = "fr-FR"): string {
    if (!value) return "N/A";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(date);
  }
}
