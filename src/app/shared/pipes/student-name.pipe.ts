import { Pipe, PipeTransform } from "@angular/core";

interface StudentLike {
  firstNameStudent?: string;
  lastNameStudent?: string;
}

@Pipe({
  name: "studentName",
  standalone: true,
})
export class StudentNamePipe implements PipeTransform {
  transform(student: StudentLike | null | undefined, fallback = "N/A"): string {
    if (!student) return fallback;

    const fullName = `${student.lastNameStudent ?? ""} ${
      student.firstNameStudent ?? ""
    }`
      .trim()
      .replace(/\s+/g, " ");

    return fullName || fallback;
  }
}
