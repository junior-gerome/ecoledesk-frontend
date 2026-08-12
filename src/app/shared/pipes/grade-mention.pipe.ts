import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "gradeMention",
  standalone: true,
})
export class GradeMentionPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const score = Number(value);
    if (!Number.isFinite(score)) return "N/A";
    if (score >= 16) return "Excellent";
    if (score >= 14) return "Tres bien";
    if (score >= 12) return "Bien";
    if (score >= 10) return "Passable";
    return "Insuffisant";
  }
}
