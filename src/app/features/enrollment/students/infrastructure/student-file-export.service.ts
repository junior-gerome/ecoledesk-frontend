import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@environments/environment";
import { firstValueFrom } from "rxjs";
import { StudentEntity } from "../domain/models/student.entity";
import { Gender } from "@app/enums/gender";
import { TypeParent } from "@app/features/parent/domain/enums/typeParent.enum";
import { StudentMapper } from "../domain/mappers/student.mapper";

type ExcelCell = string | number | boolean | Date | null | undefined;
type ExcelRow = ExcelCell[];

@Injectable({
  providedIn: "root",
})
export class StudentFileExportService {
  private readonly http = inject(HttpClient);

  async exportStudentsToExcel(keyword = ""): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(`${environment.apiUrl}/students/export/excel`, {
        params: this.searchParams(keyword),
        responseType: "blob",
      }),
    );

    this.downloadBlob(blob, `liste-eleves-${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  async exportStudentsToPdf(fileName: string, keyword = ""): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(`${environment.apiUrl}/students/export/pdf`, {
        params: this.searchParams(keyword),
        responseType: "blob",
      }),
    );

    this.downloadBlob(blob, fileName);
  }

  async importStudentsFromExcel(file: File): Promise<Partial<StudentEntity>[]> {
    const XLSX = await import("xlsx");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Parse all rows (assuming header is on row 4, which is index 3)
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 });
          if (jsonData.length < 4) {
            throw new Error("Format de fichier invalide. Veuillez utiliser le template officiel.");
          }

          // Headers are: Nom, Prenom, Date de Naissance, Genre, Ecole Precedente, Parent...
          const students: Partial<StudentEntity>[] = [];
          for (let i = 3; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const lastName = row[0]?.toString()?.trim();
              const firstName = row[1]?.toString()?.trim();
              if (!lastName || !firstName) continue; // Skip empty rows

              const rawDate = row[2];
              let parsedDate = "";
              if (rawDate) {
                const date =
                  typeof rawDate === "number"
                    ? new Date((rawDate - 25569) * 86400 * 1000)
                    : rawDate instanceof Date || typeof rawDate === "string"
                      ? new Date(rawDate)
                      : null;

                parsedDate = date && !Number.isNaN(date.getTime())
                  ? date.toISOString().split("T")[0]
                  : "";
              }

              const genderString = row[3]?.toString()?.trim()?.toUpperCase() === "M" || row[3]?.toString()?.trim()?.toUpperCase() === "MALE" ? Gender.MASCULIN : Gender.FEMININ;

              students.push({
                lastNameStudent: lastName,
                firstNameStudent: firstName,
                dateOfBirth: parsedDate,
                gender: genderString,
                ecolePrecedente: row[4]?.toString()?.trim() || "",
                parent: {
                  typeParent: this.parseParentType(row[5]),
                  lastNameParent: row[6]?.toString()?.trim() || "",
                  firstNameParent: row[7]?.toString()?.trim() || "",
                  phoneNumber: row[8]?.toString()?.trim() || "",
                  email: row[9]?.toString()?.trim() || "",
                  address: row[10]?.toString()?.trim() || "",
                  professionParent: row[11]?.toString()?.trim() || "",
                },
              });
            }
          }
          resolve(students);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier."));
      reader.readAsArrayBuffer(file);
    });
  }

  async createStudentsFromPreview(rows: Partial<StudentEntity>[]): Promise<number> {
    let imported = 0;

    for (const row of rows) {
      const student: StudentEntity = {
        lastNameStudent: row.lastNameStudent ?? "",
        firstNameStudent: row.firstNameStudent ?? "",
        dateOfBirth: row.dateOfBirth ?? "",
        registrationDate: new Date().toISOString(),
        gender: row.gender ?? Gender.MASCULIN,
        ecolePrecedente: row.ecolePrecedente ?? "",
        parent: row.parent ?? null,
      };

      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/students`, StudentMapper.toBackendApi(student)),
      );
      imported++;
    }

    return imported;
  }

  async downloadTemplateExcel(): Promise<void> {
    const XLSX = await import("xlsx");
    const sheetData: Array<Array<string | number>> = [
      ["Template d'Importation des Eleves"],
      ["Veuillez remplir les lignes a partir de la ligne 4. Ne pas modifier les en-tetes."],
      [],
      [
        "Nom",
        "Prenom",
        "Date de Naissance (AAAA-MM-JJ)",
        "Genre (M/F)",
        "Ecole Precedente",
        "Type Parent (PERE/MERE/TUTEUR)",
        "Nom Parent",
        "Prenom Parent",
        "Telephone Parent",
        "Email Parent",
        "Adresse Parent",
        "Profession Parent",
      ],
      [
        "DUPONT",
        "Jean",
        "2015-05-12",
        "M",
        "Ecole Primaire du Centre",
        "PERE",
        "DUPONT",
        "Paul",
        "+237690000000",
        "paul.dupont@example.com",
        "Douala",
        "Commercant",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 25 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 22 },
      { wch: 28 },
      { wch: 24 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    const xlsxContent = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    this.downloadBlob(
      new Blob([xlsxContent], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "template-import-eleves.xlsx"
    );
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private searchParams(keyword: string): HttpParams {
    const trimmed = keyword.trim();
    return trimmed ? new HttpParams().set("q", trimmed) : new HttpParams();
  }

  private parseParentType(value: ExcelCell): TypeParent {
    const normalized = value?.toString()?.trim()?.toUpperCase();
    if (normalized === "MERE") {
      return TypeParent.MERE;
    }
    if (normalized === "TUTEUR" || normalized === "TUTEUR_LEGAL") {
      return TypeParent.TUTEUR_LEGAL;
    }
    return TypeParent.PERE;
  }
}
